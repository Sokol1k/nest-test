import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'

describe('Edit profile endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let token: string

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

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        secondName: 'Jones',
        email: 'bob.jones-profile-edit+1@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        secondName: 'Jones',
        email: 'bob.jones-profile-edit+2@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })

    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'bob.jones-profile-edit+1@gmail.com',
        password: '123456',
      })

    token = res.body.token
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: 'bob.jones-profile-edit+1@gmail.com' })
    await userModel.findOneAndDelete({ email: 'bob.jones-profile-edit+2@gmail.com' })
  })

  it('should update profile', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile')
      .set('Authorization', 'bearer ' + token)
      .send({
        firstName: 'Bob 1',
        secondName: 'Jones 1',
        email: 'bob.jones-profile-edit+1@gmail.com',
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
        email: 'bob.jones-profile-edit+2@gmail.com',
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