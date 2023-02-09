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

const mongoUrl =
  'mongodb+srv://admin:Atg-CC6-y2A-B5H@cluster0.uk9jguo.mongodb.net/blogs-production-nest?retryWrites=true&w=majority';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUrl),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
  ],
  providers: [
    AppService,
    UsersService,
    UsersRepository,
    BlogsRepository,
    BlogsService,
    PostsService,
    PostsRepository,
    CommentsService,
    CommentsRepository,
  ],
})
export class AppModule {}
