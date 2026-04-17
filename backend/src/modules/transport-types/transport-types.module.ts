import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransportType } from './entities/transport-type.entity';
import { TransportTypesService } from './transport-types.service';
import { TransportTypesController } from './transport-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TransportType])],
  controllers: [TransportTypesController],
  providers: [TransportTypesService],
  exports: [TypeOrmModule],
})
export class TransportTypesModule {}
