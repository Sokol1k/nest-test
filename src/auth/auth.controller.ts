import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgetDto } from './dto/forget.dto'

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

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const data = await this.authService.login(loginDto)
    res.status(HttpStatus.OK).send(data)
  }

  @Post('forget')
  async forget(@Body() forgetDto: ForgetDto, @Res() res: Response): Promise<void> {
    await this.authService.forget(forgetDto)
    res.status(HttpStatus.OK).send({
      message: 'A message has been sent to the mail to reset your password'
    })
  }
}
