import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { User } from '../users/entities/user.entity';
import { REDIS_CLIENT } from '../redis/redis.module';
import { RegisterDto } from './dto/register.dto';
import { SmsService } from './sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async register(dto: RegisterDto, tempToken: string) {
    const payload = this.smsService.verifyTemporaryToken(tempToken);
    if (payload.phone !== dto.phone) {
      throw new UnauthorizedException('Phone mismatch');
    }

    const existing = await this.userRepo.findOneBy({ phone: dto.phone });
    if (existing) {
      throw new ConflictException('User with this phone already exists');
    }

    const user = this.userRepo.create({
      phone: dto.phone,
      password_hash: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      full_name: dto.full_name || null,
      company_name: dto.company_name || null,
    });
    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(phone: string, password: string) {
    const user = await this.userRepo.findOneBy({ phone });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new ForbiddenException('Account deactivated');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.redis.get(`refresh:${payload.sub}`);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.redis.del(`refresh:${payload.sub}`);

    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
  }

  private async generateTokens(user: User) {
    const tokenPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      is_admin: user.is_admin,
    };

    const access_token = this.jwtService.sign(tokenPayload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refresh_token = this.jwtService.sign(tokenPayload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    await this.redis.setex(
      `refresh:${user.id}`,
      7 * 24 * 60 * 60,
      refresh_token,
    );

    return { access_token, refresh_token };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      full_name: user.full_name,
      company_name: user.company_name,
      is_admin: user.is_admin,
    };
  }
}
