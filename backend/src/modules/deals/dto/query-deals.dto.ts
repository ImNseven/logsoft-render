import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { DealStatus } from '../../../common/enums';

export class QueryDealsDto {
  @ApiPropertyOptional({ enum: DealStatus })
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shipperId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dispatcherId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  loadId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
