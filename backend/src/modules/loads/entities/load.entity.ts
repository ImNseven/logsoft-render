import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OriginPoint } from '../../origin-points/entities/origin-point.entity';
import { TransportType } from '../../transport-types/entities/transport-type.entity';
import { LoadStatus } from '../../../common/enums';

@Entity('loads')
export class Load {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipper_id' })
  shipperId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'shipper_id' })
  shipper: User;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'origin_point_id' })
  originPointId: number;

  @ManyToOne(() => OriginPoint)
  @JoinColumn({ name: 'origin_point_id' })
  originPoint: OriginPoint;

  @Column({ length: 500 })
  destination: string;

  @Column({ name: 'transport_type_id', nullable: true })
  transportTypeId: number;

  @ManyToOne(() => TransportType, { nullable: true })
  @JoinColumn({ name: 'transport_type_id' })
  transportType: TransportType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'weight_kg', nullable: true })
  weightKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'volume_m3', nullable: true })
  volumeM3: number;

  @Column({ type: 'date', name: 'ready_date', nullable: true })
  readyDate: string;

  @Column({
    type: 'enum',
    enum: LoadStatus,
    enumName: 'loads_status_enum',
    default: LoadStatus.ACTIVE,
  })
  status: LoadStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
