import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; username: string; password: string }) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.sub);
  }
  @UseGuards(AuthGuard('jwt'))
@Post('logout')
logout(@Request() req: any) {
  return this.authService.logout(req.user.sub);
}
@UseGuards(AuthGuard('jwt'))
@Post('heartbeat')
heartbeat(@Request() req: any) {
  return this.authService.heartbeat(req.user.sub);
}
}