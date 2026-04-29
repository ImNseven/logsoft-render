import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoadStatus } from '../../../common/enums';

export class QueryLoadsDto {
  @ApiPropertyOptional({ enum: LoadStatus })
  @IsEnum(LoadStatus)
  @IsOptional()
  status?: LoadStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  shipperId?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  originPointId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  transportTypeId?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @IsOptional()
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
