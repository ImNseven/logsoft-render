import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, DocType } from '../../common/enums';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Добавить машину (carrier или dispatcher)' })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: any) {
    return this.vehiclesService.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Список машин (carrier видит свои, dispatcher — все)',
  })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  findAll(@Query() query: QueryVehiclesDto, @CurrentUser() user: any) {
    if (user.role === UserRole.CARRIER && !user.is_admin) {
      return this.vehiclesService.findMy(user.userId, query);
    }
    return this.vehiclesService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои машины (carrier)' })
  @Roles(UserRole.CARRIER)
  @UseGuards(RolesGuard)
  findMy(@Query() query: QueryVehiclesDto, @CurrentUser() user: any) {
    return this.vehiclesService.findMy(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Детальная информация о машине' })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать машину' })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.update(id, dto, user);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Деактивировать машину' })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.deactivate(id, user);
  }

  @Post(':id/documents')
  @ApiOperation({
    summary:
      'Загрузить документ (PDF/JPG/PNG/HEIC, до 20 MB). multipart/form-data с полями file и docType',
  })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Недопустимый формат файла'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'docType'],
      properties: {
        file: { type: 'string', format: 'binary' },
        docType: { type: 'string', enum: Object.values(DocType) },
      },
    },
  })
  uploadDocument(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('docType') docType: DocType,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Файл обязателен');
    if (!docType || !Object.values(DocType).includes(docType)) {
      throw new BadRequestException('Некорректный тип документа');
    }
    return this.vehiclesService.uploadDocument(vehicleId, file, docType, user);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Список документов машины (без содержимого файла)' })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  getDocuments(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.getDocuments(vehicleId, user);
  }
}
