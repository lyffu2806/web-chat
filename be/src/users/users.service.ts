import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const user = this.usersRepository.create({ email, username, password });
    return this.usersRepository.save(user);
  }

  async findOnline(
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      where: { isOnline: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { username: 'ASC' },
      select: ['id', 'email', 'username', 'isOnline', 'lastSeen'],
    });
    return { data, total };
  }

  async setOnline(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      isOnline: true,
      lastSeen: new Date(),
      lastHeartbeat: new Date(),
    });
  }

  async setOffline(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  async findOne(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'username', 'isOnline', 'lastSeen'],
    });
    return user;
  }

  @Cron('*/30 * * * * *')
  async checkOfflineUsers() {
    const threshold = new Date(Date.now() - 2 * 60 * 1000);
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ isOnline: false })
      .where('"isOnline" = true AND "lastHeartbeat" < :threshold', {
        threshold,
      })
      .execute();
  }
}
