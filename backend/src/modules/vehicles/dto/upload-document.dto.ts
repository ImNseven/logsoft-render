import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocType } from '../../../common/enums';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocType })
  @IsEnum(DocType)
  docType: DocType;
}
