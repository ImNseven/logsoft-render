import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Deal } from '../deals/entities/deal.entity';
import { S3Service } from '../s3/s3.service';
import { DealStatus, PaymentStatus, UserRole } from '../../common/enums';

type ReqUser = { userId: string; role: UserRole; is_admin: boolean };

export type PaymentWithUrl = Payment & { qrUrl: string | null };

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    private readonly s3: S3Service,
  ) {}

  async getByDeal(dealId: string, currentUser: ReqUser): Promise<PaymentWithUrl> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Сделка не найдена');

    if (!currentUser.is_admin) {
      if (currentUser.role === UserRole.CARRIER) {
        throw new ForbiddenException('Нет доступа к оплате');
      }
      if (currentUser.role === UserRole.SHIPPER && deal.shipperId !== currentUser.userId) {
        throw new ForbiddenException('Нет доступа');
      }
    }

    const payment = await this.paymentsRepo.findOne({
      where: { dealId },
      relations: ['payer'],
    });
    if (!payment) throw new NotFoundException('Оплата не найдена');

    return this.withUrl(payment);
  }

  async sendQr(
    paymentId: string,
    file: Express.Multer.File,
    amount: number | undefined,
  ): Promise<PaymentWithUrl> {
    if (!file) throw new BadRequestException('Файл обязателен');

    const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Оплата не найдена');

    const deal = await this.dealsRepo.findOne({ where: { id: payment.dealId } });
    if (!deal) throw new NotFoundException('Сделка не найдена');
    if (deal.status !== DealStatus.PENDING) {
      throw new BadRequestException('Сделка не в статусе ожидания оплаты');
    }

    if (payment.qrCodeUrl) {
      try {
        await this.s3.deleteFile(payment.qrCodeUrl);
      } catch {}
    }

    const key = await this.s3.uploadFile(file, `payments/${deal.id}/qr`);

    payment.qrCodeUrl = key;
    payment.qrFileName = file.originalname;
    payment.qrMimeType = file.mimetype;
    if (typeof amount === 'number') payment.amount = amount;
    payment.status = PaymentStatus.QR_SENT;

    const saved = await this.paymentsRepo.save(payment);
    return this.withUrl(saved);
  }

  private async withUrl(payment: Payment): Promise<PaymentWithUrl> {
    const qrUrl = payment.qrCodeUrl ? await this.s3.getPresignedUrl(payment.qrCodeUrl, 900) : null;
    return Object.assign(payment, { qrUrl });
  }
}
