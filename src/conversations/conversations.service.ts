import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  private pair(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  // Get the existing 1:1 conversation or create it.
  async getOrCreate(meId: string, otherId: string): Promise<Conversation> {
    if (meId === otherId) {
      throw new ForbiddenException('Cannot start a chat with yourself');
    }
    const other = await this.users.findOne({ where: { id: otherId } });
    if (!other) throw new NotFoundException('Other user not found');

    const [a, b] = this.pair(meId, otherId);
    let convo = await this.repo.findOne({ where: { user_a_id: a, user_b_id: b } });
    if (!convo) {
      convo = this.repo.create({ user_a_id: a, user_b_id: b, last_message_at: null });
      convo = await this.repo.save(convo);
    }
    return convo;
  }

  // List my conversations with the other participant's profile attached.
  async listForUser(meId: string) {
    const convos = await this.repo
      .createQueryBuilder('c')
      .where('c.user_a_id = :me OR c.user_b_id = :me', { me: meId })
      .orderBy('c.last_message_at', 'DESC', 'NULLS LAST')
      .getMany();

    return Promise.all(
      convos.map(async (c) => {
        const otherId = c.user_a_id === meId ? c.user_b_id : c.user_a_id;
        const other = await this.users.findOne({ where: { id: otherId } });
        return {
          id: c.id,
          last_message_at: c.last_message_at,
          other: other
            ? { id: other.id, phone: other.phone, display_name: other.display_name }
            : null,
        };
      }),
    );
  }

  async assertMember(convoId: string, meId: string): Promise<Conversation> {
    const c = await this.repo.findOne({ where: { id: convoId } });
    if (!c) throw new NotFoundException('Conversation not found');
    if (c.user_a_id !== meId && c.user_b_id !== meId) {
      throw new ForbiddenException('Not a member of this conversation');
    }
    return c;
  }

  async touch(convoId: string, when: Date) {
    await this.repo.update({ id: convoId }, { last_message_at: when });
  }
}
