import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from '../schemas/user.schema'
import { RegisterDto } from './dto/register.dto'

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
}
