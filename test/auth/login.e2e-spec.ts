import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'
import { register } from '../utils/register'

describe('Login endpoint:', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  const userConfig = {
    firstName: 'Bob',
    secondName: 'Jones',
    email: 'bob.jones-login@gmail.com',
    password: '123456',
    confirmPassword: '123456'
  }

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/nest-test', { useNewUrlParser: true, useUnifiedTopology: true })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();

    userModel = mongoose.model('User', UserSchema)

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    await register(app, userConfig)
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: userConfig.email })
  })

  it('should authorize the user', async (): Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userConfig.email,
        password: userConfig.password,
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body.token).not.toBeUndefined()
  })

  it('should return an error that the login or password is incorrect', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
          email: 'bob.jones-login+1@gmail.com',
          password: userConfig.password,
      })
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Invalid login information!')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/login')

    expect(res.statusCode).toEqual(422)
    expect(res.body.email).not.toBeUndefined()
    expect(res.body.password).not.toBeUndefined()
  })
})