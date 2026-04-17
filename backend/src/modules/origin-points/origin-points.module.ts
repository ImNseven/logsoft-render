import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OriginPoint } from './entities/origin-point.entity';
import { OriginPointsService } from './origin-points.service';
import { OriginPointsController } from './origin-points.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OriginPoint])],
  controllers: [OriginPointsController],
  providers: [OriginPointsService],
  exports: [TypeOrmModule],
})
export class OriginPointsModule {}
