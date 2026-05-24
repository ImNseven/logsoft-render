import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { PaymentsService } from './payments.service';
import { SendQrDto } from './dto/send-qr.dto';

const QR_ALLOWED_MIME = ['image/png', 'image/jpeg', 'application/pdf'];
const QR_MAX_SIZE = 5 * 1024 * 1024;

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('deals/:dealId/payment')
  @ApiOperation({ summary: 'Получить оплату по сделке (с presigned qrUrl)' })
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.DISPATCHER)
  getByDeal(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.getByDeal(dealId, user);
  }

  @Patch('payments/:id/send-qr')
  @ApiOperation({ summary: 'Загрузить QR-код к оплате (dispatcher)' })
  @Roles(UserRole.DISPATCHER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: QR_MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!QR_ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException('Недопустимый формат файла'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        amount: { type: 'number' },
      },
    },
  })
  sendQr(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SendQrDto,
  ) {
    return this.paymentsService.sendQr(id, file, dto.amount);
  }
}
