export interface ISmsProvider {
  sendCode(phone: string, code: string): Promise<boolean>;
}

export const SMS_PROVIDER = 'SMS_PROVIDER';
