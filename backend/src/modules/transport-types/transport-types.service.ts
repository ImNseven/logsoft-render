import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransportType } from './entities/transport-type.entity';

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
}
