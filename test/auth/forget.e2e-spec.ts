import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'

describe('Forget password endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>

  beforeEach(async () => {
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
        email: 'bob.jones-forget@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })
  })

  afterAll(async () => {
    await app.close()
    await userModel.findOneAndDelete({ email: 'bob.jones-forget@gmail.com' })
  })

  it('should send a message to the mail for reset password', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/forget')
      .send({
          email: 'bob.jones-forget@gmail.com',
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('A message has been sent to the mail to reset your password')
  })

  it('should return an error that the email is incorrect', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/forget')
      .send({
          email: 'bob.jones-forget+1@gmail.com',
      })
    expect(res.statusCode).toEqual(403)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('No such email exists')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .post('/auth/forget')

    expect(res.statusCode).toEqual(422)
    expect(res.body.email).not.toBeUndefined()
  })
})