import { ApiProperty } from '@nestjs/swagger';

export class OriginPointResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;
}
