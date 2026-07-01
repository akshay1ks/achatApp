import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto';

@Controller('conversations/:id/messages')
@UseGuards(SupabaseAuthGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(@CurrentUser() me: AuthUser, @Param('id') convoId: string) {
    return this.messages.list(convoId, me.id);
  }

  @Post()
  send(
    @CurrentUser() me: AuthUser,
    @Param('id') convoId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.send(convoId, me.id, dto.body);
  }
}
