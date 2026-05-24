import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { PaymentStatus } from '../../../common/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deal_id' })
  dealId: string;

  @OneToOne(() => Deal, (d) => d.payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Column({ name: 'payer_id' })
  payerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payer_id' })
  payer: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number | null;

  @Column({ name: 'qr_code_url', length: 500, nullable: true })
  qrCodeUrl: string | null;

  @Column({ name: 'qr_file_name', length: 255, nullable: true })
  qrFileName: string | null;

  @Column({ name: 'qr_mime_type', length: 100, nullable: true })
  qrMimeType: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payments_status_enum',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'confirmed_by' })
  confirmer: User | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
