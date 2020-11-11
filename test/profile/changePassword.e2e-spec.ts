import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'

describe('Change password endpoint', () => {
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
        email: 'bob.jones-profile-change-password@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })

    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'bob.jones-profile-change-password@gmail.com',
        password: '123456',
      })

    token = res.body.token
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: 'bob.jones-profile-change-password@gmail.com' })
  })

  it('should change the password', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile/password')
      .set('Authorization', 'bearer ' + token)
      .send({
        oldPassword: "123456",
        password: "qwerty",
        confirmPassword: "qwerty"
      })

    expect(res.statusCode).toEqual(200)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Password changed successfully')
  })

  it('should return an error that the old password is incorrect', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile/password')
      .set('Authorization', 'bearer ' + token)
      .send({
        oldPassword: "123456",
        password: "qwerty",
        confirmPassword: "qwerty"
      })

    expect(res.statusCode).toEqual(403)
    expect(res.body.oldPassword).not.toBeUndefined()
    expect(res.body.oldPassword).toBe('Incorrect password')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile/password')
      .set('Authorization', 'bearer ' + token)

    expect(res.statusCode).toEqual(422)
    expect(res.body.oldPassword).not.toBeUndefined()
    expect(res.body.password).not.toBeUndefined()
    expect(res.body.confirmPassword).not.toBeUndefined()
  })

  it('should return an error that the user is not authorized', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put('/profile/password')

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Access Denied')
  })
})