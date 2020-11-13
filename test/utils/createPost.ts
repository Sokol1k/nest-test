import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function createPost(app: INestApplication, token: any) {
  await request(app.getHttpServer())
    .post('/post')
    .set('Authorization', 'bearer ' + token)
    .send({
      title: 'title',
      description: 'description'
    })
}