import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SmsService } from './sms/sms.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('send-code')
  @ApiOperation({ summary: 'Send SMS verification code' })
  @ApiBody({ type: SendCodeDto })
  @ApiResponse({ status: 200, description: 'SMS code sent' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async sendCode(@Body() dto: SendCodeDto) {
    const code = await this.smsService.sendCode(dto.phone);
    const expose = this.config.get<string>('SHOW_SMS_CODE') === 'true';
    return {
      message: 'SMS code sent',
      phone: dto.phone,
      ...(expose ? { code } : {}),
    };
  }

  @Public()
  @Post('verify-code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify SMS code and get temporary token' })
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({ status: 200, description: 'Code verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    const temporary_token = await this.smsService.verifyCode(
      dto.phone,
      dto.code,
    );
    return { temporary_token };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user with verified phone' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 401, description: 'Invalid temporary token' })
  async register(
    @Body() dto: RegisterDto,
    @Headers('authorization') auth: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    return this.authService.register(dto, token);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with phone and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account deactivated' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.userId);
    return { message: 'Logged out' };
  }
}
