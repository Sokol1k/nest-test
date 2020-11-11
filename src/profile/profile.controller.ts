import { Controller, Get, Put, Req, Body, Res, HttpStatus} from '@nestjs/common';
import { ProfileService } from './profile.service'
import { IRequest } from '../interfaces/request.interface'
import { Response } from 'express'
import { EditDto } from './dto/edit.dto'
import { ChangePasswordDto } from './dto/changePassword.dto'

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  index(@Req() req: IRequest, @Res() res: Response): void {
    res.status(HttpStatus.OK).send(req.user)
  }

  @Put()
  async edit(@Req() req: IRequest, @Body() editDto: EditDto, @Res() res: Response): Promise<void> {
    await this.profileService.edit(req.user.id, editDto)
    res.status(HttpStatus.OK).send({
      message: 'Profile updated successfully'
    })
  }

  @Put('/password')
  async changePassword(@Req() req: IRequest, @Body() changePasswordDto: ChangePasswordDto, @Res() res: Response): Promise<void> {
    await this.profileService.changePassword(req.user.id, changePasswordDto)
    res.status(HttpStatus.OK).send({
      message: 'Password changed successfully'
    })
  }
}
