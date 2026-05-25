import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TransportTypesService } from './transport-types.service';
import { TransportTypeResponseDto } from './dto/transport-type-response.dto';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';
import { IsAdmin } from '../auth/decorators/is-admin.decorator';

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

  @Get('all')
  @IsAdmin()
  @ApiOperation({ summary: 'Get all transport types incl. inactive (admin)' })
  @ApiResponse({ status: 200, type: [TransportTypeResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllAdmin() {
    return this.service.findAll();
  }

  @Post()
  @IsAdmin()
  @ApiOperation({ summary: 'Create transport type (admin)' })
  @ApiResponse({ status: 201, type: TransportTypeResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() dto: CreateTransportTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @IsAdmin()
  @ApiOperation({ summary: 'Update transport type (admin)' })
  @ApiResponse({ status: 200, type: TransportTypeResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransportTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @IsAdmin()
  @ApiOperation({ summary: 'Delete transport type (admin)' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'In use, cannot delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
