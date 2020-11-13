import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'

describe('Register endpoint:', () => {
  let app: INestApplication;
  let userModel: mongoose.Model<UserDocument>
  const userConfig = {
    firstName: 'Bob',
    secondName: 'Jones',
    email: 'bob.jones-register@gmail.com',
    password: '123456',
    confirmPassword: '123456'
  }

  beforeAll(async () => {
    await mongoose.connect(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_TEST_DATABASE}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();

    userModel = mongoose.model('User', UserSchema)

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe())
    await app.init();
  });

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: userConfig.email })
  })

  it('should create a new user', async (): Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userConfig)

    expect(res.statusCode).toEqual(201)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('User has been registered!')
  });

  it('should return an error that email is not free', async (): Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userConfig)

    expect(res.statusCode).toEqual(403)
    expect(res.body.email).not.toBeUndefined()
    expect(res.body.email).toBe('This email is not free')
  });

  it('should return an error that the validation failed', async (): Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/register')

    expect(res.statusCode).toEqual(422)
    expect(res.body.firstName).not.toBeUndefined()
    expect(res.body.secondName).not.toBeUndefined()
    expect(res.body.email).not.toBeUndefined()
    expect(res.body.password).not.toBeUndefined()
    expect(res.body.confirmPassword).not.toBeUndefined()
  });
})