import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OriginPointsService } from './origin-points.service';
import { OriginPointResponseDto } from './dto/origin-point-response.dto';

@ApiTags('Reference Data')
@ApiBearerAuth()
@Controller('origin-points')
export class OriginPointsController {
  constructor(private readonly service: OriginPointsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active origin points' })
  @ApiResponse({
    status: 200,
    description: 'List of active origin points',
    type: [OriginPointResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.service.findAllActive();
  }
}
