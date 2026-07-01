import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  // Same UUID as the Supabase auth user (auth.users.id).
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  display_name: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
