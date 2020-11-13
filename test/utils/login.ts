import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function login(app: INestApplication, user: any) {
  return await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: user.email,
      password: user.password,
    })
}