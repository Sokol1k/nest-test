import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response): Promise<void> {
    await this.authService.register(registerDto)
    res.status(HttpStatus.CREATED).send({
      message: 'User has been registered!'
    })
  }
}
