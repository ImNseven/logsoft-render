import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoadDto {
  @ApiPropertyOptional({ description: 'Только для dispatcher' })
  @IsUUID()
  @IsOptional()
  shipperId?: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  originPointId: number;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  destination: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  transportTypeId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  weightKg?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  volumeM3?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  readyDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
