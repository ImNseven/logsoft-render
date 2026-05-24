import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDealDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  loadId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
