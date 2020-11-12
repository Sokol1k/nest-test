import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import * as mongoose from 'mongoose'
import { AppModule } from '../../src/app.module'
import { ValidationPipe } from '../../src/pipes/validation.pipe'
import { UserDocument, UserSchema } from '../../src/schemas/user.schema'
import { PostDocument, PostSchema } from '../../src/schemas/post.schema'

describe('Edit post endpoint', () => {
  let app: INestApplication
  let userModel: mongoose.Model<UserDocument>
  let postModel: mongoose.Model<PostDocument>
  let token1: string
  let token2: string
  let postId1: string
  let postId2: string

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
        email: 'bob.jones-post-edit+1@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Bob',
        secondName: 'Jones',
        email: 'bob.jones-post-edit+2@gmail.com',
        password: '123456',
        confirmPassword: '123456'
      })

    const res1: any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'bob.jones-post-edit+1@gmail.com',
        password: '123456',
      })

    token1 = res1.body.token

    const res2 : any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'bob.jones-post-edit+2@gmail.com',
        password: '123456',
      })

    token2 = res2.body.token

    await request(app.getHttpServer())
      .post('/post')
      .set('Authorization', 'bearer ' + token1)
      .send({
        title: 'title',
        description: 'description'
      })

    await request(app.getHttpServer())
      .post('/post')
      .set('Authorization', 'bearer ' + token2)
      .send({
        title: 'title',
        description: 'description'
      })

    const user1 = await userModel.findOne({ email: 'bob.jones-post-edit+1@gmail.com' })
    const post1 = await postModel.findOne({ userId: user1._id})
    postId1 = post1._id

    const user2 = await userModel.findOne({ email: 'bob.jones-post-edit+2@gmail.com' })
    const post2 = await postModel.findOne({ userId: user2._id})
    postId2 = post2._id
  })

  afterAll(async () => {
    await app.close()

    const user1 = await userModel.findOneAndDelete({ email: 'bob.jones-post-edit+1@gmail.com' })
    await postModel.findOneAndDelete({ userId: user1._id })

    const user2 = await userModel.findOneAndDelete({ email: 'bob.jones-post-edit+2@gmail.com' })
    await postModel.findOneAndDelete({ userId: user2._id })
  })

  it('should edit a post', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put(`/post/${postId1}`)
      .set('Authorization', 'bearer ' + token1)
      .send({
        title: 'title1',
        description: 'description1'
      })

    expect(res.statusCode).toEqual(200)
    expect(res.body._id).not.toBeUndefined()
    expect(res.body.title).not.toBeUndefined()
    expect(res.body.description).not.toBeUndefined()
    expect(res.body.userId).not.toBeUndefined()
    expect(res.body.createdAt).not.toBeUndefined()
    expect(res.body.updatedAt).not.toBeUndefined()
  })

  it('should return an error because the user does not have permission to edit this post', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put(`/post/${postId2}`)
      .set('Authorization', 'bearer ' + token1)
      .send({
        title: 'title1',
        description: 'description1'
      })

    expect(res.statusCode).toEqual(403)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('This is not your post')
  })

  // it('should return an error because no such post exists', async () : Promise<void> => {
  //   const res : any = await request(app.getHttpServer())
  //     .put('/post/1')
  //     .set('Authorization', 'bearer ' + token1)
  //     .send({
  //       title: 'title1',
  //       description: 'description1'
  //     })

  //   expect(res.statusCode).toEqual(404)
  //   expect(res.body.message).not.toBeUndefined()
  //   expect(res.body.message).toBe('There is no such post')
  // })

  it('should return an error that the user is not authorized', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put(`/post/${postId1}`)

    expect(res.statusCode).toEqual(401)
    expect(res.body.message).not.toBeUndefined()
    expect(res.body.message).toBe('Access Denied')
  })

  it('should return an error that the validation failed', async () : Promise<void> => {
    const res : any = await request(app.getHttpServer())
      .put(`/post/${postId1}`)
      .set('Authorization', 'bearer ' + token1)

    expect(res.statusCode).toEqual(422)
    expect(res.body.title).not.toBeUndefined()
    expect(res.body.description).not.toBeUndefined()
  })
})