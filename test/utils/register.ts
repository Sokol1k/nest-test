import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IUser } from './interface/user.interface'

export async function register(app: INestApplication, user: IUser) {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(user)
}