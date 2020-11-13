import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { AppModule } from '../../src/app.module'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'
import { register } from '../utils/register'
import { login } from '../utils/login'

describe('Get profile endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let token: string
  const userConfig = {
    firstName: 'Bob',
    secondName: 'Jones',
    email: 'bob.jones-profile-index@gmail.com',
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
    await app.init()

    await register(app, userConfig)

    const res : any = await login(app, userConfig)
    token = res.body.token
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: userConfig.email })
  })

  it('should return user profile', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', 'bearer ' + token)

    expect(res.statusCode).toEqual(200)
    expect(res.body.firstName).not.toBeUndefined()
    expect(res.body.secondName).not.toBeUndefined()
    expect(res.body.email).not.toBeUndefined()
  })

  it('should return an error that the user is not authorized', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get('/profile')

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Access Denied')
  })
})