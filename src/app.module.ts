import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthenticationMiddleware } from './middlewares/authentication.middleware'
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${
        process.env.NODE_ENV === 'test' ?
        process.env.MONGO_TEST_DATABASE :
        process.env.MONGO_DATABASE}`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    ),
    AuthModule,
    ProfileModule,
    PostModule
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes('profile', 'post')
  }
}
