import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'
import { PostDocument, PostSchema } from '../../src/schemas/post.schema'
import { register } from '../utils/register'
import { login } from '../utils/login'
import { createPost } from '../utils/createPost'

describe('Get post by id endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let postModel: mongoose.Model<PostDocument>
  let token: string
  let postId: string
  const userConfig = {
    firstName: 'Bob',
    secondName: 'Jones',
    email: 'bob.jones-post-get@gmail.com',
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
    postModel = mongoose.model('Post', PostSchema)

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe())
    await app.init()

    await register(app, userConfig)

    const res : any = await login(app, userConfig)
    token = res.body.token

    await createPost(app, token)

    const user = await userModel.findOne({ email: userConfig.email })
    const post = await postModel.findOne({ userId: user._id})
    postId = post._id
  })

  afterAll(async () => {
    await app.close()
    const user = await userModel.findOneAndDelete({ email: userConfig.email })
    await postModel.findOneAndDelete({ userId: user._id })
  })

  it('should return all posts', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get(`/post/${postId}`)
      .set('Authorization', 'bearer ' + token)

    expect(res.statusCode).toEqual(200)
    expect(res.body._id).not.toBeUndefined()
    expect(res.body.title).not.toBeUndefined()
    expect(res.body.description).not.toBeUndefined()
    expect(res.body.userId).not.toBeUndefined()
    expect(res.body.createdAt).not.toBeUndefined()
    expect(res.body.updatedAt).not.toBeUndefined()
  })

  it('should return an error that the user is not authorized', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get(`/post/${postId}`)

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Access Denied')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .get('/post/1')
      .set('Authorization', 'bearer ' + token)

    expect(res.statusCode).toEqual(422)
    expect(res.body.id).not.toBeUndefined()
  })
})