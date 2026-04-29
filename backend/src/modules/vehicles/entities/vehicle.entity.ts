import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TransportType } from '../../transport-types/entities/transport-type.entity';
import { VehicleDocument } from './vehicle-document.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'carrier_id' })
  carrierId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'carrier_id' })
  carrier: User;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'plate_number', length: 20 })
  plateNumber: string;

  @Column({ name: 'transport_type_id', nullable: true })
  transportTypeId: number;

  @ManyToOne(() => TransportType, { nullable: true })
  @JoinColumn({ name: 'transport_type_id' })
  transportType: TransportType;

  @Column({
    name: 'capacity_kg',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  capacityKg: number;

  @Column({ type: 'text', nullable: true })
  specs: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => VehicleDocument, (doc) => doc.vehicle)
  documents: VehicleDocument[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
