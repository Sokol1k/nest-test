import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'

describe('Reset password endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let resetLink: string

  beforeAll(async () => {
    jest.setTimeout(30000)

    await mongoose.connect('mongodb://127.0.0.1:27017/nest-test', { useNewUrlParser: true, useUnifiedTopology: true })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile()

    userModel = mongoose.model('User', UserSchema)

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe())
    await app.init()
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        secondName: 'Jones',
        email: 'bob.jones-reset@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })
    await request(app.getHttpServer())
      .post('/auth/forget')
      .send({
          email: 'bob.jones-reset@gmail.com',
      })
    const user = await userModel.findOne({ email: 'bob.jones-reset@gmail.com' })
    resetLink = user.resetLink
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: 'bob.jones-reset@gmail.com' })
  })

  it('should restore password', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/reset')
      .send({
        resetLink: resetLink,
        password: 'qwerty',
        confirmPassword: 'qwerty'
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Password changed successfully')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/reset')
      .send({
        resetLink: '',
        password: '',
        confirmPassword: ''
      })
    expect(res.statusCode).toEqual(422)
    expect(res.body.resetLink).not.toBeUndefined()
    expect(res.body.password).not.toBeUndefined()
    expect(res.body.confirmPassword).not.toBeUndefined()
  })
})