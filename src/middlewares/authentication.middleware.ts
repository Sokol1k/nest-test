import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common'
import { IRequest } from '../interfaces/request.interface'
import { Response } from 'express'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  use(req: IRequest, res: Response, next: Function) {
    try {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        throw new HttpException({
          message: 'Access Denied'
        }, HttpStatus.UNAUTHORIZED)
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      throw error.status ? error : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

