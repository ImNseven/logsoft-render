import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Load } from '../loads/entities/load.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Payment } from '../payments/entities/payment.entity';
import {
  UserRole,
  LoadStatus,
  DealStatus,
  PaymentStatus,
} from '../../common/enums';
import { AdminStatsResponseDto } from './dto/admin-stats.response';

type Row = Record<string, string | null>;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Load) private readonly loads: Repository<Load>,
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(Deal) private readonly deals: Repository<Deal>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
  ) {}

  async getStats(): Promise<AdminStatsResponseDto> {
    const usersRow: Row = await this.users
      .createQueryBuilder('u')
      .select('COUNT(*)::int', 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE u.role = :shipper)::int`,
        'shippers',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE u.role = :carrier)::int`,
        'carriers',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE u.role = :dispatcher)::int`,
        'dispatchers',
      )
      .addSelect(`COUNT(*) FILTER (WHERE u.is_admin = true)::int`, 'admins')
      .addSelect(
        `COUNT(*) FILTER (WHERE u.is_active = false)::int`,
        'inactive',
      )
      .setParameters({
        shipper: UserRole.SHIPPER,
        carrier: UserRole.CARRIER,
        dispatcher: UserRole.DISPATCHER,
      })
      .getRawOne();

    const loadsRow: Row = await this.loads
      .createQueryBuilder('l')
      .select('COUNT(*)::int', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE l.status = :active)::int`, 'active')
      .addSelect(`COUNT(*) FILTER (WHERE l.status = :in_deal)::int`, 'in_deal')
      .addSelect(
        `COUNT(*) FILTER (WHERE l.status = :completed)::int`,
        'completed',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE l.status = :cancelled)::int`,
        'cancelled',
      )
      .setParameters({
        active: LoadStatus.ACTIVE,
        in_deal: LoadStatus.IN_DEAL,
        completed: LoadStatus.COMPLETED,
        cancelled: LoadStatus.CANCELLED,
      })
      .getRawOne();

    const vehiclesRow: Row = await this.vehicles
      .createQueryBuilder('v')
      .select('COUNT(*)::int', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE v.is_active = true)::int`, 'active')
      .addSelect(
        `COUNT(*) FILTER (WHERE v.is_active = false)::int`,
        'inactive',
      )
      .getRawOne();

    const dealsRow: Row = await this.deals
      .createQueryBuilder('d')
      .select('COUNT(*)::int', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE d.status = :pending)::int`, 'pending')
      .addSelect(`COUNT(*) FILTER (WHERE d.status = :paid)::int`, 'paid')
      .addSelect(
        `COUNT(*) FILTER (WHERE d.status = :revealed)::int`,
        'documents_revealed',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE d.status = :cancelled)::int`,
        'cancelled',
      )
      .setParameters({
        pending: DealStatus.PENDING,
        paid: DealStatus.PAID,
        revealed: DealStatus.DOCUMENTS_REVEALED,
        cancelled: DealStatus.CANCELLED,
      })
      .getRawOne();

    const paymentsRow: Row = await this.payments
      .createQueryBuilder('p')
      .select(
        `COALESCE(SUM(p.amount) FILTER (WHERE p.status = :confirmed), 0)::text`,
        'confirmed_total_amount',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE p.status = :confirmed)::int`,
        'confirmed_count',
      )
      .setParameter('confirmed', PaymentStatus.CONFIRMED)
      .getRawOne();

    const n = (v: string | null) => Number(v ?? 0);

    return {
      users: {
        total: n(usersRow.total),
        shippers: n(usersRow.shippers),
        carriers: n(usersRow.carriers),
        dispatchers: n(usersRow.dispatchers),
        admins: n(usersRow.admins),
        inactive: n(usersRow.inactive),
      },
      loads: {
        total: n(loadsRow.total),
        active: n(loadsRow.active),
        in_deal: n(loadsRow.in_deal),
        completed: n(loadsRow.completed),
        cancelled: n(loadsRow.cancelled),
      },
      vehicles: {
        total: n(vehiclesRow.total),
        active: n(vehiclesRow.active),
        inactive: n(vehiclesRow.inactive),
      },
      deals: {
        total: n(dealsRow.total),
        pending: n(dealsRow.pending),
        paid: n(dealsRow.paid),
        documents_revealed: n(dealsRow.documents_revealed),
        cancelled: n(dealsRow.cancelled),
      },
      payments: {
        confirmed_total_amount: paymentsRow.confirmed_total_amount ?? '0',
        confirmed_count: n(paymentsRow.confirmed_count),
      },
    };
  }
}
