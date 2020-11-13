import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IUser } from './interface/user.interface'

export async function forget(app: INestApplication, user: IUser) {
  await request(app.getHttpServer())
    .post('/auth/forget')
    .send({
        email: user.email,
    })
}