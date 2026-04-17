import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsAdmin } from '../auth/decorators/is-admin.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get()
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get paginated user list (dispatcher+)' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getUsers(@Query() query: QueryUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @Roles(UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get user by ID (dispatcher+)' })
  @ApiResponse({ status: 200, description: 'User by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @IsAdmin()
  @ApiOperation({ summary: 'Update user by admin' })
  @ApiResponse({ status: 200, description: 'User updated by admin' })
  @ApiResponse({ status: 403, description: 'Forbidden / self-action blocked' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updateUser(id, dto, user.userId);
  }
}
