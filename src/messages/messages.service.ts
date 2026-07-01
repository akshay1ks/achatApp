import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly repo: Repository<Message>,
    private readonly convos: ConversationsService,
  ) {}

  async list(convoId: string, meId: string): Promise<Message[]> {
    await this.convos.assertMember(convoId, meId);
    return this.repo.find({
      where: { conversation_id: convoId },
      order: { created_at: 'ASC' },
      take: 200,
    });
  }

  async send(convoId: string, meId: string, body: string): Promise<Message> {
    await this.convos.assertMember(convoId, meId);
    const msg = this.repo.create({
      conversation_id: convoId,
      sender_id: meId,
      body,
    });
    const saved = await this.repo.save(msg);
    await this.convos.touch(convoId, saved.created_at);
    return saved;
  }
}
