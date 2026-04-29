import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { VehiclesService } from './vehicles.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get(':id/download')
  @ApiOperation({
    summary:
      'Получить временную ссылку на скачивание (presigned URL, TTL 15 минут)',
  })
  download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.downloadDocument(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить документ (из БД и из MinIO)' })
  @Roles(UserRole.CARRIER, UserRole.DISPATCHER)
  @UseGuards(RolesGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.vehiclesService.deleteDocument(id, user);
  }
}
