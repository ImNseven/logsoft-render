import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Load } from './entities/load.entity';
import { CreateLoadDto } from './dto/create-load.dto';
import { UpdateLoadDto } from './dto/update-load.dto';
import { QueryLoadsDto } from './dto/query-loads.dto';
import { LoadStatus, UserRole } from '../../common/enums';

type ReqUser = { userId: string; role: UserRole; is_admin: boolean };

@Injectable()
export class LoadsService {
  constructor(
    @InjectRepository(Load)
    private readonly loadsRepository: Repository<Load>,
  ) {}

  async create(dto: CreateLoadDto, currentUser: ReqUser): Promise<Load> {
    const shipperId =
      currentUser.role === UserRole.DISPATCHER
        ? (dto.shipperId ?? currentUser.userId)
        : currentUser.userId;

    const load = this.loadsRepository.create({
      ...dto,
      shipperId,
      createdBy: currentUser.userId,
      status: LoadStatus.ACTIVE,
    });
    return this.loadsRepository.save(load);
  }

  async findAll(query: QueryLoadsDto): Promise<{ data: Load[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = query;
    const qb = this.loadsRepository
      .createQueryBuilder('load')
      .leftJoinAndSelect('load.originPoint', 'originPoint')
      .leftJoinAndSelect('load.transportType', 'transportType')
      .leftJoinAndSelect('load.shipper', 'shipper');

    if (query.status) qb.andWhere('load.status = :status', { status: query.status });
    if (query.shipperId) qb.andWhere('load.shipper_id = :shipperId', { shipperId: query.shipperId });
    if (query.originPointId) qb.andWhere('load.origin_point_id = :opi', { opi: query.originPointId });
    if (query.transportTypeId) qb.andWhere('load.transport_type_id = :tti', { tti: query.transportTypeId });

    qb.orderBy('load.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findMy(userId: string, query: QueryLoadsDto): Promise<{ data: Load[]; total: number; page: number; limit: number }> {
    return this.findAll({ ...query, shipperId: userId });
  }

  async findOne(id: string, currentUser: ReqUser): Promise<Load> {
    const load = await this.loadsRepository.findOne({
      where: { id },
      relations: ['originPoint', 'transportType', 'shipper'],
    });
    if (!load) throw new NotFoundException('Груз не найден');
    if (currentUser.role === UserRole.SHIPPER && load.shipperId !== currentUser.userId) {
      throw new ForbiddenException('Нет доступа');
    }
    return load;
  }

  async update(id: string, dto: UpdateLoadDto, currentUser: ReqUser): Promise<Load> {
    const load = await this.findOne(id, currentUser);
    if (load.status !== LoadStatus.ACTIVE) {
      throw new BadRequestException('Нельзя редактировать груз не в статусе active');
    }
    Object.assign(load, dto);
    return this.loadsRepository.save(load);
  }

  async cancel(id: string, currentUser: ReqUser): Promise<Load> {
    const load = await this.findOne(id, currentUser);
    if (load.status === LoadStatus.CANCELLED) {
      throw new BadRequestException('Груз уже отменён');
    }
    if (load.status === LoadStatus.IN_DEAL && currentUser.role === UserRole.SHIPPER) {
      throw new ForbiddenException('Нельзя отменить груз в сделке');
    }
    load.status = LoadStatus.CANCELLED;
    return this.loadsRepository.save(load);
  }
}
