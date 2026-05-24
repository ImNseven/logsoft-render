import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from '../modules/deals/entities/deal.entity';
import { ContactsVisibilityService } from './services/contacts-visibility.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Deal])],
  providers: [ContactsVisibilityService],
  exports: [ContactsVisibilityService],
})
export class CommonModule {}
