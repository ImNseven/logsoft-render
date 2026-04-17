import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from './sms.interface';

@Injectable()
export class MockSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendCode(phone: string, code: string): Promise<boolean> {
    this.logger.log(`[SMS MOCK] Code for ${phone}: ${code}`);
    return true;
  }
}
