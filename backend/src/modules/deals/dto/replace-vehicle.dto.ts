import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReplaceVehicleDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  newVehicleId: string;
}
