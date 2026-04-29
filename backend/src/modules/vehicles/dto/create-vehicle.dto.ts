import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiPropertyOptional({ description: 'Только для dispatcher' })
  @IsUUID()
  @IsOptional()
  carrierId?: string;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  plateNumber: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  transportTypeId?: number;

  @ApiPropertyOptional({ description: 'Грузоподъёмность в кг' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  capacityKg?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specs?: string;
}
