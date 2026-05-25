import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportType } from './entities/transport-type.entity';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';

@Injectable()
export class TransportTypesService {
  constructor(
    @InjectRepository(TransportType)
    private readonly repo: Repository<TransportType>,
  ) {}

  async findAllActive(): Promise<TransportType[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { id: 'ASC' },
    });
  }

  async findAll(): Promise<TransportType[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreateTransportTypeDto): Promise<TransportType> {
    const item = this.repo.create({ name: dto.name });
    return this.repo.save(item);
  }

  async update(id: number, dto: UpdateTransportTypeDto): Promise<TransportType> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Transport type not found');
    if (dto.name !== undefined) item.name = dto.name;
    if (dto.is_active !== undefined) item.is_active = dto.is_active;
    return this.repo.save(item);
  }

  async remove(id: number): Promise<{ ok: true }> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Transport type not found');
    try {
      await this.repo.delete(id);
      return { ok: true };
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new ConflictException(
          'Тип транспорта используется в грузах или машинах и не может быть удалён',
        );
      }
      throw err;
    }
  }
}
