import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from '../schemas/user.schema'
import { EditDto } from './dto/edit.dto'
import { ChangePasswordDto } from './dto/changePassword.dto'

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async edit(id: string, editDto: EditDto): Promise<void> {
    try {
      const user = await this.userModel.findById(id)

      if (!(user.email === editDto.email)) {
        const other = await this.userModel.findOne({ email: editDto.email })

        if (other) {
          throw new HttpException({
            email: 'This email is not free'
          }, HttpStatus.FORBIDDEN)
        }
      }

      await this.userModel.findByIdAndUpdate(id, editDto)
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    try {
      const user = await this.userModel.findById(id)

      if (user) {
        const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password)

        if (!isMatch) {
          throw new HttpException({
            oldPassword: 'Incorrect password'
          }, HttpStatus.FORBIDDEN)
        }

        user.password = await bcrypt.hash(changePasswordDto.password, 12)
        await user.save()
      } else {
        throw new HttpException({
          message: 'Access Denied'
        }, HttpStatus.UNAUTHORIZED)
      }
    } catch(error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
