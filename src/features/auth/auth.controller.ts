import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthPayload } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@CurrentUser('id') id: AuthPayload['id']) {
    // Có 2 option:
    // 1) Gọi service để lấy user đầy đủ từ DB
    return this.authService.getMe(id);

    // 2) Hoặc nếu guard đã gắn đủ info rồi:
    // return currentUser; (dùng @CurrentUser() currentUser)
  }
}
