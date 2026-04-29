import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLoadDto } from './create-load.dto';

export class UpdateLoadDto extends PartialType(OmitType(CreateLoadDto, ['shipperId'] as const)) {}
