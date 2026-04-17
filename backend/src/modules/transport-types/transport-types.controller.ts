import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TransportTypesService } from './transport-types.service';
import { TransportTypeResponseDto } from './dto/transport-type-response.dto';

@ApiTags('Reference Data')
@ApiBearerAuth()
@Controller('transport-types')
export class TransportTypesController {
  constructor(private readonly service: TransportTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active transport types' })
  @ApiResponse({
    status: 200,
    description: 'List of active transport types',
    type: [TransportTypeResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.service.findAllActive();
  }
}
