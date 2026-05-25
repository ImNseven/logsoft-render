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
import { OriginPointsService } from './origin-points.service';
import { OriginPointResponseDto } from './dto/origin-point-response.dto';
import { CreateOriginPointDto } from './dto/create-origin-point.dto';
import { UpdateOriginPointDto } from './dto/update-origin-point.dto';
import { IsAdmin } from '../auth/decorators/is-admin.decorator';

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

  @Get('all')
  @IsAdmin()
  @ApiOperation({ summary: 'Get all origin points incl. inactive (admin)' })
  @ApiResponse({ status: 200, type: [OriginPointResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllAdmin() {
    return this.service.findAll();
  }

  @Post()
  @IsAdmin()
  @ApiOperation({ summary: 'Create origin point (admin)' })
  @ApiResponse({ status: 201, type: OriginPointResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() dto: CreateOriginPointDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @IsAdmin()
  @ApiOperation({ summary: 'Update origin point (admin)' })
  @ApiResponse({ status: 200, type: OriginPointResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOriginPointDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @IsAdmin()
  @ApiOperation({ summary: 'Delete origin point (admin)' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'In use, cannot delete' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
