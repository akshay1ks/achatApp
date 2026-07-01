import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Conversation } from './conversations/conversation.entity';
import { Message } from './messages/message.entity';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Conversation, Message],
      // We create the schema via SQL in Supabase, so keep synchronize off.
      synchronize: false,
      ssl: { rejectUnauthorized: false },
    }),
    AuthModule,
    UsersModule,
    ConversationsModule,
    MessagesModule,
  ],
})
export class AppModule {}
