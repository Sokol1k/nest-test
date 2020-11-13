import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'
import { register } from '../utils/register'
import { login } from '../utils/login'

describe('Edit profile endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let token: string
  const userConfig1 = {
    firstName: 'Bob',
    secondName: 'Jones',
    email: 'bob.jones-profile-edit+1@gmail.com',
    password: '123456',
    confirmPassword: '123456'
  }
  const userConfig2 = {
    firstName: 'Bob',
    secondName: 'Jones',
    email: 'bob.jones-profile-edit+2@gmail.com',
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
    await app.init()

    await register(app, userConfig1)
    await register(app, userConfig2)

    const res : any = await login(app, userConfig1)
    token = res.body.token
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: userConfig1.email })
    await userModel.findOneAndDelete({ email: userConfig2.email })
  })

  it('should update profile', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', 'bearer ' + token)
      .send({
        firstName: 'Bob 1',
        secondName: 'Jones 1',
        email: userConfig1.email,
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Profile updated successfully')
  })

  it('should return an error that the user is not authorized', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile')

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Access Denied')
  })

  it('should return an error that email is not free', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', 'bearer ' + token)
      .send({
        firstName: 'Bob 1',
        secondName: 'Jones 1',
        email: userConfig2.email,
      })
    expect(res.statusCode).toEqual(403)
    expect(res.body.email).not.toBeUndefined()
    expect(res.body.email).toBe('This email is not free')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', 'bearer ' + token)

    expect(res.statusCode).toEqual(422)
    expect(res.body.firstName).not.toBeUndefined()
    expect(res.body.secondName).not.toBeUndefined()
    expect(res.body.email).not.toBeUndefined()
  })
})