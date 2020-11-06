import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'

describe('Login endpoint:', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        secondName: 'Jones',
        email: 'bob.jones@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })
  })

  afterAll(async () => {
    await app.close()
    await mongoose.connect(
      'mongodb://127.0.0.1:27017/nest-test',
      { useNewUrlParser: true, useUnifiedTopology: true },
      function(){
        mongoose.connection.db.dropDatabase();
      })
  })

  it('should authorize the user', async (): Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'bob.jones@gmail.com',
        password: '123456',
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body.token).not.toBeUndefined()
  })

  it('should return an error that the login or password is incorrect', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
          email: 'bob.jones+1@gmail.com',
          password: '123456',
      })
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).not.toBeUndefined()
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/login')

    expect(res.statusCode).toEqual(422)
    expect(res.body.email).not.toBeUndefined()
    expect(res.body.password).not.toBeUndefined()
  })
})