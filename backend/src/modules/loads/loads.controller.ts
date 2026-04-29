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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { LoadsService } from './loads.service';
import { CreateLoadDto } from './dto/create-load.dto';
import { UpdateLoadDto } from './dto/update-load.dto';
import { QueryLoadsDto } from './dto/query-loads.dto';

@ApiTags('Loads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loads')
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать груз (shipper или dispatcher)' })
  @Roles(UserRole.SHIPPER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateLoadDto, @CurrentUser() user: any) {
    return this.loadsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Список всех грузов с фильтрами (dispatcher)' })
  @Roles(UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  findAll(@Query() query: QueryLoadsDto) {
    return this.loadsService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои грузы (shipper)' })
  @Roles(UserRole.SHIPPER)
  @UseGuards(RolesGuard)
  findMy(@Query() query: QueryLoadsDto, @CurrentUser() user: any) {
    return this.loadsService.findMy(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детальная информация о грузе' })
  @Roles(UserRole.SHIPPER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.loadsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать груз (только в статусе active)' })
  @Roles(UserRole.SHIPPER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLoadDto,
    @CurrentUser() user: any,
  ) {
    return this.loadsService.update(id, dto, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Отменить груз' })
  @Roles(UserRole.SHIPPER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.loadsService.cancel(id, user);
  }
}
