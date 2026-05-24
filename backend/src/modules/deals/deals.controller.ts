import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealsDto } from './dto/query-deals.dto';
import { CancelDealDto } from './dto/cancel-deal.dto';
import { ReplaceVehicleDto } from './dto/replace-vehicle.dto';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать сделку (dispatcher)' })
  @Roles(UserRole.DISPATCHER)
  create(@Body() dto: CreateDealDto, @CurrentUser() user: any) {
    return this.dealsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Список всех сделок с фильтрами (dispatcher)' })
  @Roles(UserRole.DISPATCHER)
  findAll(@Query() query: QueryDealsDto, @CurrentUser() user: any) {
    return this.dealsService.findAll(query, user);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои сделки (shipper, carrier)' })
  @Roles(UserRole.SHIPPER, UserRole.CARRIER)
  findMy(@Query() query: QueryDealsDto, @CurrentUser() user: any) {
    return this.dealsService.findMy(user.userId, query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детальная информация о сделке' })
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.DISPATCHER)
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.dealsService.findOne(id, user);
  }

  @Patch(':id/reveal')
  @ApiOperation({ summary: 'Раскрыть документы по сделке (dispatcher)' })
  @ApiResponse({ status: 200, description: 'Документы раскрыты' })
  @ApiResponse({ status: 400, description: 'Оплата не подтверждена' })
  @ApiResponse({ status: 404, description: 'Сделка не найдена' })
  @Roles(UserRole.DISPATCHER)
  reveal(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.dealsService.reveal(id, user);
  }

  @Patch(':id/replace-vehicle')
  @ApiOperation({ summary: 'Заменить машину в сделке (dispatcher), не более 1 раза' })
  @ApiResponse({ status: 200, description: 'Машина заменена' })
  @ApiResponse({ status: 400, description: 'Замена недоступна' })
  @ApiResponse({ status: 404, description: 'Сделка или машина не найдена' })
  @Roles(UserRole.DISPATCHER)
  replaceVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceVehicleDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.replaceVehicle(id, dto, user);
  }

  @Patch(':id/confirm-payment')
  @ApiOperation({ summary: 'Подтвердить оплату по сделке (dispatcher)' })
  @Roles(UserRole.DISPATCHER)
  confirmPayment(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.dealsService.confirmPayment(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Отменить сделку (dispatcher)' })
  @Roles(UserRole.DISPATCHER)
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.cancel(id, dto, user);
  }
}
