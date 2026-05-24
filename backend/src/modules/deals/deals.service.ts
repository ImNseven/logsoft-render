import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import { Deal } from './entities/deal.entity';
import { Load } from '../loads/entities/load.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { CancelDealDto } from './dto/cancel-deal.dto';
import { ReplaceVehicleDto } from './dto/replace-vehicle.dto';
import { DealStatus, LoadStatus, PaymentStatus, UserRole } from '../../common/enums';
import { ContactsVisibilityService } from '../../common/services/contacts-visibility.service';

type ReqUser = { userId: string; role: UserRole; is_admin: boolean };

type ListResult = { data: Deal[]; total: number; page: number; limit: number };

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(Load) private readonly loadsRepo: Repository<Load>,
    @InjectRepository(Vehicle) private readonly vehiclesRepo: Repository<Vehicle>,
    @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly contacts: ContactsVisibilityService,
  ) {}

  async hasRevealedDealForVehicle(shipperId: string, vehicleId: string): Promise<boolean> {
    const count = await this.dealsRepo.count({
      where: { shipperId, vehicleId, status: DealStatus.DOCUMENTS_REVEALED },
    });
    return count > 0;
  }

  async create(dto: CreateDealDto, currentUser: ReqUser): Promise<Deal> {
    let createdId: string;
    try {
      createdId = await this.dataSource.transaction(async (manager) => {
        const load = await manager.findOne(Load, { where: { id: dto.loadId } });
        if (!load) throw new NotFoundException('Груз не найден');
        if (load.status !== LoadStatus.ACTIVE) {
          throw new BadRequestException('Груз не в статусе active');
        }

        const vehicle = await manager.findOne(Vehicle, { where: { id: dto.vehicleId } });
        if (!vehicle) throw new NotFoundException('Машина не найдена');
        if (!vehicle.isActive) throw new BadRequestException('Машина деактивирована');

        const deal = manager.create(Deal, {
          loadId: load.id,
          vehicleId: vehicle.id,
          shipperId: load.shipperId,
          carrierId: vehicle.carrierId,
          dispatcherId: currentUser.userId,
          status: DealStatus.PENDING,
          notes: dto.notes ?? null,
        });
        const saved = await manager.save(deal);

        await manager.update(Load, load.id, { status: LoadStatus.IN_DEAL });

        const payment = manager.create(Payment, {
          dealId: saved.id,
          payerId: load.shipperId,
          status: PaymentStatus.PENDING,
        });
        await manager.save(payment);

        return saved.id;
      });
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        (e as any).code === '23505' &&
        String((e as any).constraint ?? '').includes('uniq_deals_active_load')
      ) {
        throw new ConflictException('У груза уже есть активная сделка');
      }
      throw e;
    }

    return this.findOne(createdId, currentUser);
  }

  async findAll(query: QueryDealsDto, currentUser: ReqUser): Promise<ListResult> {
    const { page = 1, limit = 20 } = query;
    const qb = this.baseQuery();
    this.applyFilters(qb, query);
    qb.orderBy('deal.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    this.maskList(data, currentUser);
    return { data, total, page, limit };
  }

  async findMy(userId: string, query: QueryDealsDto, currentUser: ReqUser): Promise<ListResult> {
    const { page = 1, limit = 20 } = query;
    const qb = this.baseQuery();
    qb.andWhere('(deal.shipper_id = :uid OR deal.carrier_id = :uid)', { uid: userId });
    this.applyFilters(qb, query);
    qb.orderBy('deal.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    this.maskList(data, currentUser);
    return { data, total, page, limit };
  }

  private hideUser(u: any) {
    if (!u) return;
    u.phone = null;
    u.full_name = null;
    u.company_name = null;
  }

  private maskDealParties(deal: Deal, viewer: ReqUser): void {
    if (!viewer) return;
    if (viewer.is_admin || viewer.role === UserRole.DISPATCHER) return;
    if (deal.status === DealStatus.DOCUMENTS_REVEALED) return;
    if (deal.shipper && deal.shipper.id !== viewer.userId) this.hideUser(deal.shipper);
    if (deal.carrier && deal.carrier.id !== viewer.userId) this.hideUser(deal.carrier);
    if (deal.payment?.payer && deal.payment.payer.id !== viewer.userId) {
      this.hideUser(deal.payment.payer);
    }
  }

  private maskList(deals: Deal[], viewer: ReqUser): void {
    for (const d of deals) this.maskDealParties(d, viewer);
  }

  async findOne(id: string, currentUser: ReqUser): Promise<Deal> {
    const qb = this.baseQuery()
      .leftJoinAndSelect('vehicle.documents', 'documents')
      .where('deal.id = :id', { id });
    const deal = await qb.getOne();
    if (!deal) throw new NotFoundException('Сделка не найдена');

    if (!currentUser.is_admin) {
      if (currentUser.role === UserRole.SHIPPER && deal.shipperId !== currentUser.userId) {
        throw new ForbiddenException('Нет доступа');
      }
      if (currentUser.role === UserRole.CARRIER && deal.carrierId !== currentUser.userId) {
        throw new ForbiddenException('Нет доступа');
      }
    }
    this.maskDealParties(deal, currentUser);
    return deal;
  }

  async reveal(id: string, currentUser: ReqUser): Promise<Deal> {
    const deal = await this.dealsRepo.findOne({ where: { id } });
    if (!deal) throw new NotFoundException('Сделка не найдена');
    if (deal.status !== DealStatus.PAID) {
      throw new BadRequestException('Оплата не подтверждена');
    }
    const payment = await this.paymentsRepo.findOne({ where: { dealId: id } });
    if (!payment || payment.status !== PaymentStatus.CONFIRMED) {
      throw new BadRequestException('Оплата не подтверждена');
    }
    await this.dealsRepo.update(id, {
      status: DealStatus.DOCUMENTS_REVEALED,
      documentsRevealedAt: new Date(),
    });
    return this.findOne(id, currentUser);
  }

  async replaceVehicle(id: string, dto: ReplaceVehicleDto, currentUser: ReqUser): Promise<Deal> {
    await this.dataSource.transaction(async (manager) => {
      const deal = await manager.findOne(Deal, { where: { id } });
      if (!deal) throw new NotFoundException('Сделка не найдена');
      if (deal.vehicleReplaced) throw new BadRequestException('Замена уже была произведена');
      if (deal.status === DealStatus.DOCUMENTS_REVEALED) {
        throw new BadRequestException('Нельзя менять машину после раскрытия документов');
      }
      if (deal.status === DealStatus.CANCELLED) {
        throw new BadRequestException('Сделка отменена');
      }
      const vehicle = await manager.findOne(Vehicle, { where: { id: dto.newVehicleId } });
      if (!vehicle) throw new NotFoundException('Машина не найдена');
      if (!vehicle.isActive) throw new BadRequestException('Машина деактивирована');
      if (vehicle.id === deal.vehicleId) throw new BadRequestException('Это уже текущая машина');
      await manager.update(Deal, id, {
        vehicleId: vehicle.id,
        carrierId: vehicle.carrierId,
        vehicleReplaced: true,
      });
    });
    return this.findOne(id, currentUser);
  }

  async confirmPayment(id: string, currentUser: ReqUser): Promise<Deal> {
    await this.dataSource.transaction(async (manager) => {
      const deal = await manager.findOne(Deal, { where: { id } });
      if (!deal) throw new NotFoundException('Сделка не найдена');
      if (deal.status !== DealStatus.PENDING) {
        throw new BadRequestException('Сделка не в статусе pending');
      }
      const payment = await manager.findOne(Payment, { where: { dealId: id } });
      if (!payment) throw new NotFoundException('Оплата не найдена');
      if (payment.status !== PaymentStatus.QR_SENT) {
        throw new BadRequestException('QR-код не отправлен грузоотправителю');
      }
      payment.status = PaymentStatus.CONFIRMED;
      payment.confirmedBy = currentUser.userId;
      payment.confirmedAt = new Date();
      await manager.save(payment);
      await manager.update(Deal, id, { status: DealStatus.PAID });
    });
    return this.findOne(id, currentUser);
  }

  async cancel(id: string, _dto: CancelDealDto | undefined, currentUser: ReqUser): Promise<Deal> {
    const existing = await this.dealsRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Сделка не найдена');
    if (existing.status === DealStatus.CANCELLED) {
      throw new BadRequestException('Сделка уже отменена');
    }
    if (existing.status === DealStatus.DOCUMENTS_REVEALED) {
      throw new BadRequestException('Нельзя отменить сделку с раскрытыми документами');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Deal, id, { status: DealStatus.CANCELLED });
      const load = await manager.findOne(Load, { where: { id: existing.loadId } });
      if (load && load.status === LoadStatus.IN_DEAL) {
        await manager.update(Load, load.id, { status: LoadStatus.ACTIVE });
      }
    });

    return this.findOne(id, currentUser);
  }

  private baseQuery(): SelectQueryBuilder<Deal> {
    return this.dealsRepo
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.load', 'load')
      .leftJoinAndSelect('load.originPoint', 'loadOriginPoint')
      .leftJoinAndSelect('load.transportType', 'loadTransportType')
      .leftJoinAndSelect('deal.vehicle', 'vehicle')
      .leftJoinAndSelect('vehicle.transportType', 'vehicleTransportType')
      .leftJoinAndSelect('deal.shipper', 'shipper')
      .leftJoinAndSelect('deal.carrier', 'carrier')
      .leftJoinAndSelect('deal.dispatcher', 'dispatcher')
      .leftJoinAndSelect('deal.payment', 'payment');
  }

  private applyFilters(qb: SelectQueryBuilder<Deal>, q: QueryDealsDto): void {
    if (q.status) qb.andWhere('deal.status = :status', { status: q.status });
    if (q.shipperId) qb.andWhere('deal.shipper_id = :shipperId', { shipperId: q.shipperId });
    if (q.carrierId) qb.andWhere('deal.carrier_id = :carrierId', { carrierId: q.carrierId });
    if (q.dispatcherId) qb.andWhere('deal.dispatcher_id = :dispatcherId', { dispatcherId: q.dispatcherId });
    if (q.loadId) qb.andWhere('deal.load_id = :loadId', { loadId: q.loadId });
    if (q.vehicleId) qb.andWhere('deal.vehicle_id = :vehicleId', { vehicleId: q.vehicleId });
  }
}
