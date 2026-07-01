import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
@UseGuards(SupabaseAuthGuard)
export class ConversationsController {
  constructor(private readonly convos: ConversationsService) {}

  @Get()
  list(@CurrentUser() me: AuthUser) {
    return this.convos.listForUser(me.id);
  }

  // Start (or reuse) a 1:1 conversation with another user.
  @Post()
  start(@CurrentUser() me: AuthUser, @Body('otherUserId') otherUserId: string) {
    return this.convos.getOrCreate(me.id, otherUserId);
  }
}
