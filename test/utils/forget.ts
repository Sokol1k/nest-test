import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function forget(app: INestApplication, user: any) {
  await request(app.getHttpServer())
    .post('/auth/forget')
    .send({
        email: user.email,
    })
}