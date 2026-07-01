import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Call once right after login to sync the auth user into our DB.
  @Post('me/sync')
  sync(@CurrentUser() me: AuthUser) {
    return this.users.upsertFromAuth(me.id, me.phone);
  }

  @Post('me/profile')
  updateProfile(
    @CurrentUser() me: AuthUser,
    @Body('displayName') displayName: string,
  ) {
    return this.users.updateProfile(me.id, displayName);
  }

  // Find a contact by phone number to start a chat.
  @Get('lookup')
  lookup(@Query('phone') phone: string) {
    return this.users.findByPhone(phone);
  }

  @Get()
  list(@CurrentUser() me: AuthUser) {
    return this.users.findOthers(me.id);
  }
}
