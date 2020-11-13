import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function register(app: INestApplication, user: any) {
  await request(app.getHttpServer())
    .post('/auth/register')
    .send(user)
}