import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { IsAdmin } from '../auth/decorators/is-admin.decorator';
import { AdminStatsResponseDto } from './dto/admin-stats.response';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('stats')
  @IsAdmin()
  @ApiOperation({ summary: 'Aggregate platform stats (admin)' })
  @ApiResponse({ status: 200, type: AdminStatsResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(): Promise<AdminStatsResponseDto> {
    return this.service.getStats();
  }
}
