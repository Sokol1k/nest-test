import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'
import { PostDocument, PostSchema } from '../../src/schemas/post.schema'

describe('Get all posts endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let postModel: mongoose.Model<PostDocument>
  let token: string

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/nest-test', { useNewUrlParser: true, useUnifiedTopology: true })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
    }).compile();

    userModel = mongoose.model('User', UserSchema)
    postModel = mongoose.model('Post', PostSchema)

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        secondName: 'Jones',
        email: 'bob.jones-post-get-all@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })

    const res : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'bob.jones-post-get-all@gmail.com',
        password: '123456',
      })

    token = res.body.token

    await request(app.getHttpServer())
      .post('/post')
      .set('Authorization', 'bearer ' + token)
      .send({
        title: 'title',
        description: 'description'
      })
  })

  afterAll(async () => {
    await app.close()
    const user = await userModel.findOneAndDelete({ email: 'bob.jones-post-get-all@gmail.com' })
    await postModel.findOneAndDelete({ userId: user._id })
  })

  it('should return all posts', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get('/post')
      .set('Authorization', 'bearer ' + token)

    expect(res.statusCode).toEqual(200)
    expect(Array.isArray(res.body)).toBeTruthy()
    expect(res.body.length).not.toEqual(0)
  })

  it('should return an error that the user is not authorized', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get('/post')

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Access Denied')
  })
})