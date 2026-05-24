import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './entities/deal.entity';
import { Load } from '../loads/entities/load.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Deal, Load, Vehicle, Payment])],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
