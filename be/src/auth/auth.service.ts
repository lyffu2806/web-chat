import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) return { success: false, message: 'Email đã được sử dụng' };

    const existingUsername = await this.usersService.findByUsername(username);
    if (existingUsername) return { success: false, message: 'Username đã được sử dụng' };

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, username, hashed);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { success: true, access_token: token, user: { id: user.id, email: user.email, username: user.username } };
  }

  async login(username: string, password: string) {
  const user = await this.usersService.findByUsername(username);
  if (!user) return { success: false, message: 'Tên tài khoản hoặc mật khẩu không đúng' };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { success: false, message: 'Tên tài khoản hoặc mật khẩu không đúng' };

  await this.usersService.setOnline(user.id);

  const token = this.jwtService.sign({ sub: user.id, email: user.email });
  return { success: true, access_token: token, user: { id: user.id, email: user.email, username: user.username } };
}

async logout(userId: string) {
  await this.usersService.setOffline(userId);
  return { success: true };
}

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return { success: false, message: 'Không tìm thấy người dùng' };
    return { success: true, id: user.id, email: user.email, username: user.username };
  }
  async heartbeat(userId: string) {
  await this.usersService.setOnline(userId);
  return { success: true };
}
}