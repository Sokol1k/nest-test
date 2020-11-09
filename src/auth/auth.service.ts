import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { User, UserDocument } from '../schemas/user.schema'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ForgetDto } from './dto/forget.dto'
import { sendMail } from '../utils/sendMail';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(registerDto: RegisterDto): Promise<void> {
    try {
      const user =  await this.userModel.findOne({ email: registerDto.email })

      if (user) {
        throw new HttpException({
          email: 'This email is not free'
        }, HttpStatus.FORBIDDEN)
      }

      registerDto.password = await bcrypt.hash(registerDto.password, 12)
      const data = new this.userModel(registerDto)
      await data.save()
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    try {
      const user =  await this.userModel.findOne({ email: loginDto.email })

      if (!user) {
        throw new HttpException({
          message: "Invalid login information!"
        }, HttpStatus.FORBIDDEN)
      }

      const isMatch = await bcrypt.compare(loginDto.password, user.password)

      if (!isMatch) {
        throw new HttpException({
          message: "Invalid login information!"
        }, HttpStatus.FORBIDDEN)
      }

      return {
        token: jwt.sign({ id: user.id, email: user.email, firstName: user.firstName, secondName: user.secondName }, process.env.JWT_SECRET, { expiresIn: '1d' })
      }
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async forget(forgetDto: ForgetDto): Promise<void> {
    try {
      const user =  await this.userModel.findOne({ email: forgetDto.email })

      if (!user) {
        throw new HttpException({
          message: "No such email exists"
        }, HttpStatus.FORBIDDEN)
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_RESET_SECRET, { expiresIn: '10m' })

      await sendMail(forgetDto.email, `${process.env.URL}/reset/${token}`)

      user.resetLink = token
      await user.save()
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
