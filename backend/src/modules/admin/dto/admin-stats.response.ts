import { ApiProperty } from '@nestjs/swagger';

export class UsersStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() shippers: number;
  @ApiProperty() carriers: number;
  @ApiProperty() dispatchers: number;
  @ApiProperty() admins: number;
  @ApiProperty() inactive: number;
}

export class LoadsStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() active: number;
  @ApiProperty() in_deal: number;
  @ApiProperty() completed: number;
  @ApiProperty() cancelled: number;
}

export class VehiclesStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() active: number;
  @ApiProperty() inactive: number;
}

export class DealsStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() pending: number;
  @ApiProperty() paid: number;
  @ApiProperty() documents_revealed: number;
  @ApiProperty() cancelled: number;
}

export class PaymentsStatsDto {
  @ApiProperty({ type: String, example: '12345.67' })
  confirmed_total_amount: string;

  @ApiProperty() confirmed_count: number;
}

export class AdminStatsResponseDto {
  @ApiProperty({ type: UsersStatsDto }) users: UsersStatsDto;
  @ApiProperty({ type: LoadsStatsDto }) loads: LoadsStatsDto;
  @ApiProperty({ type: VehiclesStatsDto }) vehicles: VehiclesStatsDto;
  @ApiProperty({ type: DealsStatsDto }) deals: DealsStatsDto;
  @ApiProperty({ type: PaymentsStatsDto }) payments: PaymentsStatsDto;
}
