import { LikesRepository } from './likes/likes.repository';
import { Likes, LikesSchema } from './likes/schemas/likes.schema';
import { SecurityController } from './security/security.controller';
import { PasswordRecoveryRepository } from './auth/password-recovery.repository';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './auth/schemas/password-recovery.schema';
import { Email } from './email/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
const configModule = ConfigModule.forRoot({
  isGlobal: true,
});
import { Auth, AuthSchema } from './auth/schemas/auth.schema';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenStrategy } from './auth/strategies/refreshToken.strategy';
import { AccessTokenStrategy } from './auth/strategies/accessToken.strategy';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { AuthService } from './auth/auth.service';
import { TestingController } from './testing/testing.controller';
import { CommentsService } from './comments/comments.service';
import { Post, PostSchema } from './posts/schemas/post.schema';
import { PostsRepository } from './posts/posts.repository';
import { PostsService } from './posts/posts.service';
import { UsersService } from './users/users.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersRepository } from './users/users.repository';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/schemas/blog.schema';
import { BlogsRepository } from './blogs/blogs.repository';
import { User, UserSchema } from './users/schemas/user.schema';
import { PostsController } from './posts/posts.controller';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { Comment, CommentSchema } from './comments/schemas/comment.schema';
import { AuthController } from './auth/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthRepository } from './auth/auth.repository';
import { MailerModule } from '@nestjs-modules/mailer';
import { LikesService } from './likes/likes.service';


@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(new ConfigService().get('MONGO_LOCAL')),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: PasswordRecovery.name, schema: PasswordRecoverySchema },
      { name: Likes.name, schema: LikesSchema },
    ]),
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          auth: {
            user: config.get('NODEMAILER_EMAIL'),
            pass: config.get('NODEMAILER_PASS'),
          },
          tls: { rejectUnauthorized: false },
          secure: false,
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
    SecurityController,
  ],
  providers: [
    AuthService,
    AppService,
    AuthRepository,
    Email,
    PasswordRecoveryRepository,
    UsersService,
    UsersRepository,
    BlogsRepository,
    BlogsService,
    PostsService,
    PostsRepository,
    CommentsService,
    CommentsRepository,
    PassportModule,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    LikesService,
    LikesRepository,
  ],
})
export class AppModule { }
