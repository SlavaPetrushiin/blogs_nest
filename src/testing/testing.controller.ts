import { UsersRepository } from './../users/users.repository';
import { BlogsRepository } from './../blogs/blogs.repository';
import { CommentsRepository } from './../comments/comments.repository';
import { PostsRepository } from './../posts/posts.repository';
import { Controller, Delete, HttpStatus, HttpCode } from '@nestjs/common';

@Controller('testing')
export class TestingController {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDB() {
    const b = await this.blogsRepository.deleteMany();
    const p = await this.postsRepository.deleteMany();
    const u = await this.usersRepository.deleteMany();
    const c = await this.commentsRepository.deleteMany();
    // const s = authDevicesSessions.deleteMany({});
    // const bp = badPractice.deleteMany({});
    // const l = LikesModel.deleteMany({});

    await Promise.all([b, p, u, c]);
  }
}
