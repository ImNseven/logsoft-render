import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';
import { Deal } from '../deals/entities/deal.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { DealStatus, DocType, UserRole } from '../../common/enums';
import { S3Service } from '../s3/s3.service';
import { ContactsVisibilityService } from '../../common/services/contacts-visibility.service';

type ReqUser = { userId: string; role: UserRole; is_admin: boolean };

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepo: Repository<Vehicle>,
    @InjectRepository(VehicleDocument)
    private readonly docsRepo: Repository<VehicleDocument>,
    @InjectRepository(Deal)
    private readonly dealsRepo: Repository<Deal>,
    private readonly s3Service: S3Service,
    private readonly contacts: ContactsVisibilityService,
  ) {}

  async create(dto: CreateVehicleDto, currentUser: ReqUser): Promise<Vehicle> {
    const carrierId =
      currentUser.role === UserRole.DISPATCHER
        ? (dto.carrierId ?? currentUser.userId)
        : currentUser.userId;

    const vehicle = this.vehiclesRepo.create({
      ...dto,
      carrierId,
      createdBy: currentUser.userId,
    });
    return this.vehiclesRepo.save(vehicle);
  }

  async findAll(query: QueryVehiclesDto, currentUser?: ReqUser): Promise<{
    data: Vehicle[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20 } = query;
    const qb = this.vehiclesRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.carrier', 'carrier')
      .leftJoinAndSelect('vehicle.transportType', 'transportType');

    if (query.carrierId)
      qb.andWhere('vehicle.carrier_id = :cid', { cid: query.carrierId });
    if (query.isActive !== undefined)
      qb.andWhere('vehicle.is_active = :ia', { ia: query.isActive });

    qb.orderBy('vehicle.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    if (currentUser) {
      await this.contacts.maskMany(currentUser, data.map((v) => v.carrier));
    }
    return { data, total, page, limit };
  }

  async findMy(userId: string, query: QueryVehiclesDto, currentUser?: ReqUser) {
    return this.findAll({ ...query, carrierId: userId }, currentUser);
  }

  async findOne(id: string, currentUser: ReqUser): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepo.findOne({
      where: { id },
      relations: ['carrier', 'transportType', 'documents'],
    });
    if (!vehicle) throw new NotFoundException('Машина не найдена');
    if (
      currentUser.role === UserRole.CARRIER &&
      vehicle.carrierId !== currentUser.userId
    ) {
      throw new ForbiddenException('Нет доступа');
    }
    await this.contacts.maskUser(currentUser, vehicle.carrier);
    return vehicle;
  }

  async update(
    id: string,
    dto: UpdateVehicleDto,
    currentUser: ReqUser,
  ): Promise<Vehicle> {
    const vehicle = await this.findOne(id, currentUser);
    Object.assign(vehicle, dto);
    return this.vehiclesRepo.save(vehicle);
  }

  async deactivate(id: string, currentUser: ReqUser): Promise<Vehicle> {
    const vehicle = await this.findOne(id, currentUser);
    vehicle.isActive = false;
    return this.vehiclesRepo.save(vehicle);
  }

  async activate(id: string, currentUser: ReqUser): Promise<Vehicle> {
    const vehicle = await this.findOne(id, currentUser);
    vehicle.isActive = true;
    return this.vehiclesRepo.save(vehicle);
  }

  async uploadDocument(
    vehicleId: string,
    file: Express.Multer.File,
    docType: DocType,
    currentUser: ReqUser,
  ): Promise<VehicleDocument> {
    if (!file) throw new BadRequestException('Файл обязателен');
    const vehicle = await this.findOne(vehicleId, currentUser);
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const fileKey = await this.s3Service.uploadFile(
      file,
      `vehicles/${vehicle.id}/docs`,
    );
    const doc = this.docsRepo.create({
      vehicleId: vehicle.id,
      docType,
      fileKey,
      fileName: originalName,
      mimeType: file.mimetype,
      uploadedBy: currentUser.userId,
    });
    return this.docsRepo.save(doc);
  }

  async getDocuments(
    vehicleId: string,
    currentUser: ReqUser,
  ): Promise<VehicleDocument[]> {
    await this.findOne(vehicleId, currentUser);
    if (
      currentUser.role === UserRole.SHIPPER &&
      !currentUser.is_admin
    ) {
      const count = await this.dealsRepo.count({
        where: { shipperId: currentUser.userId, vehicleId },
      });
      if (count === 0) {
        throw new ForbiddenException('Нет доступа к документам этой машины');
      }
    }
    return this.docsRepo.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  async downloadDocument(
    docId: string,
    currentUser: ReqUser,
  ): Promise<{ url: string }> {
    const doc = await this.docsRepo.findOne({
      where: { id: docId },
      relations: ['vehicle'],
    });
    if (!doc) throw new NotFoundException('Документ не найден');

    if (currentUser.is_admin) {
      // bypass
    } else if (currentUser.role === UserRole.CARRIER) {
      if (doc.vehicle.carrierId !== currentUser.userId) {
        throw new ForbiddenException('Нет доступа');
      }
    } else if (currentUser.role === UserRole.SHIPPER) {
      const count = await this.dealsRepo.count({
        where: {
          shipperId: currentUser.userId,
          vehicleId: doc.vehicleId,
          status: DealStatus.DOCUMENTS_REVEALED,
        },
      });
      if (count === 0) {
        throw new ForbiddenException('Доступ к документам откроется после раскрытия сделки');
      }
    }

    const exists = await this.s3Service.fileExists(doc.fileKey);
    if (!exists) {
      throw new NotFoundException('Файл не найден в хранилище');
    }
    const url = await this.s3Service.getPresignedUrl(doc.fileKey, 900);
    return { url };
  }

  async deleteDocument(docId: string, currentUser: ReqUser): Promise<void> {
    const doc = await this.docsRepo.findOne({
      where: { id: docId },
      relations: ['vehicle'],
    });
    if (!doc) throw new NotFoundException('Документ не найден');
    if (
      currentUser.role === UserRole.CARRIER &&
      doc.vehicle.carrierId !== currentUser.userId
    ) {
      throw new ForbiddenException('Нет доступа');
    }
    await this.s3Service.deleteFile(doc.fileKey);
    await this.docsRepo.remove(doc);
  }
}
