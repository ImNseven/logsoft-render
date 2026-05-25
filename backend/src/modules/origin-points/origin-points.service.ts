import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OriginPoint } from './entities/origin-point.entity';
import { CreateOriginPointDto } from './dto/create-origin-point.dto';
import { UpdateOriginPointDto } from './dto/update-origin-point.dto';

@Injectable()
export class OriginPointsService {
  constructor(
    @InjectRepository(OriginPoint)
    private readonly repo: Repository<OriginPoint>,
  ) {}

  async findAllActive(): Promise<OriginPoint[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { id: 'ASC' },
    });
  }

  async findAll(): Promise<OriginPoint[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreateOriginPointDto): Promise<OriginPoint> {
    const item = this.repo.create({ name: dto.name });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateOriginPointDto): Promise<OriginPoint> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Origin point not found');
    if (dto.name !== undefined) item.name = dto.name;
    if (dto.is_active !== undefined) item.is_active = dto.is_active;
    return this.repo.save(item);
  }

  async remove(id: number): Promise<{ ok: true }> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Origin point not found');
    try {
      await this.repo.delete(id);
      return { ok: true };
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new ConflictException(
          'Пункт отправки используется в грузах и не может быть удалён',
        );
      }
      throw err;
    }
  }
}
