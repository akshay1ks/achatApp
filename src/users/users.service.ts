import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { normalizeIndianPhone } from '../common/phone.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  // Called after login to make sure the signed-in user exists in our table.
  async upsertFromAuth(id: string, phone: string): Promise<User> {
    let user = await this.repo.findOne({ where: { id } });
    if (!user) {
      user = this.repo.create({ id, phone, display_name: null });
      await this.repo.save(user);
    } else if (user.phone !== phone) {
      user.phone = phone;
      await this.repo.save(user);
    }
    return user;
  }

  async updateProfile(id: string, displayName: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.display_name = displayName;
    return this.repo.save(user);
  }

  async findByPhone(rawPhone: string): Promise<User> {
    const phone = normalizeIndianPhone(rawPhone);
    if (!phone) throw new NotFoundException('Invalid Indian phone number');
    const user = await this.repo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('No user with that phone number');
    return user;
  }

  findOthers(meId: string): Promise<User[]> {
    return this.repo.find({ where: { id: Not(meId) }, order: { created_at: 'DESC' } });
  }
}
