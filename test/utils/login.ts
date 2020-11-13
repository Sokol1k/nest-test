import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IUser } from './interface/user.interface'

export async function login(app: INestApplication, user: IUser) {
  return await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: user.password,
    })
}