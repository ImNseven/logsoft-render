import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Load } from '../../loads/entities/load.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { DealStatus } from '../../../common/enums';

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'load_id' })
  loadId: string;

  @ManyToOne(() => Load)
  @JoinColumn({ name: 'load_id' })
  load: Load;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'shipper_id' })
  shipperId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'shipper_id' })
  shipper: User;

  @Column({ name: 'carrier_id' })
  carrierId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'carrier_id' })
  carrier: User;

  @Column({ name: 'dispatcher_id' })
  dispatcherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'dispatcher_id' })
  dispatcher: User;

  @Column({
    type: 'enum',
    enum: DealStatus,
    enumName: 'deals_status_enum',
    default: DealStatus.PENDING,
  })
  status: DealStatus;

  @Column({ name: 'vehicle_replaced', type: 'boolean', default: false })
  vehicleReplaced: boolean;

  @Column({ name: 'documents_revealed_at', type: 'timestamptz', nullable: true })
  documentsRevealedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Payment, (p) => p.deal)
  payment?: Payment;
}
