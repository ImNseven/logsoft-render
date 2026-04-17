import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OriginPoint } from './entities/origin-point.entity';

@Injectable()
export class OriginPointsService {
  constructor(
    @InjectRepository(OriginPoint)
    private readonly repo: Repository<OriginPoint>,
  ) {}

  async findAllActive(): Promise<OriginPoint[]> {
    return this.repo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }
}
