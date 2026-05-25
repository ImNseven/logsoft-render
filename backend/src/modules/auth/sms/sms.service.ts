import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { ISmsProvider, SMS_PROVIDER } from './sms.interface';

@Injectable()
export class SmsService {
  constructor(
    @Inject(SMS_PROVIDER) private readonly smsProvider: ISmsProvider,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async sendCode(phone: string): Promise<string> {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    await this.redis.setex(`sms:${phone}`, 300, code);
    await this.smsProvider.sendCode(phone, code);
    return code;
  }

  async verifyCode(phone: string, code: string): Promise<string> {
    const stored = await this.redis.get(`sms:${phone}`);
    if (!stored || stored !== code) {
      throw new BadRequestException('Invalid or expired code');
    }
    await this.redis.del(`sms:${phone}`);

    return this.jwtService.sign(
      { phone, verified: true },
      {
        secret: this.config.get('SMS_VERIFY_SECRET'),
        expiresIn: '10m',
      },
    );
  }

  verifyTemporaryToken(token: string): { phone: string; verified: boolean } {
    return this.jwtService.verify(token, {
      secret: this.config.get('SMS_VERIFY_SECRET'),
    });
  }
}
