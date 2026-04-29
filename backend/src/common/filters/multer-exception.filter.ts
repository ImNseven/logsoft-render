import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message: string = exception.message;
    if (exception.code === 'LIMIT_FILE_SIZE') {
      message = 'Размер файла не должен превышать 20 MB';
    }

    const body = new BadRequestException(message).getResponse();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message:
        typeof body === 'object' && body !== null && 'message' in body
          ? (body as any).message
          : message,
      error: 'BadRequestException',
      timestamp: new Date().toISOString(),
    });
  }
}
