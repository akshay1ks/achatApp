import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// A 1:1 conversation. user_a_id < user_b_id is enforced so each pair has one row.
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_a_id: string;

  @Column('uuid')
  user_b_id: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
