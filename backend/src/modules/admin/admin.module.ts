import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Load } from '../loads/entities/load.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Payment } from '../payments/entities/payment.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Load, Vehicle, Deal, Payment])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
