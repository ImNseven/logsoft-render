import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.repo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    await this.repo.update(userId, dto);
    return this.getProfile(userId);
  }

  async getUsers(query: QueryUsersDto) {
    const { role, search, is_active, page = 1, limit = 20 } = query;

    const qb = this.repo.createQueryBuilder('user');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (is_active !== undefined) {
      qb.andWhere('user.is_active = :is_active', { is_active });
    }

    if (search) {
      qb.andWhere(
        '(user.full_name ILIKE :search OR user.company_name ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('user.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    currentUserId: string,
  ): Promise<User> {
    if (id === currentUserId) {
      if (dto.is_active === false) {
        throw new ForbiddenException('Cannot deactivate yourself');
      }
      if (dto.is_admin === false) {
        throw new ForbiddenException('Cannot remove your own admin status');
      }
    }

    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return this.repo.save(user);
  }
}
