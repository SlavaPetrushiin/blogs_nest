import { CreatePostByBlogIdDto } from 'src/posts/dto/create-post.dto';
import { UpdateBlogDto } from './../src/blogs/dto/update-blog.dto';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
// import cookieParser = require('cookie-parser');
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/http-exception.filter';
import { AppModule } from '../src/app.module';
import { CreateBlogDto } from 'src/blogs/dto/create-blog.dto';
import { v4 as uuidv4 } from 'uuid';

const CREATE_BLOG_DTO: CreateBlogDto = {
  name: 'First blog',
  description: 'First blog description',
  websiteUrl: 'https://vercel.com/slavapetrushiin/blogs',
};

const UPDATE_BLOG_DTO: UpdateBlogDto = {
  name: 'First blog updates',
  description: 'First blog description updated',
  websiteUrl: 'https://vercel.com/slavapetrushiin/blogs',
};

const CREATE_POST_DTO: CreatePostByBlogIdDto = {
  content: 'test post content',
  shortDescription: 'test post shortDescription',
  title: 'Test post title',
};

jest.setTimeout(15000);
describe('AppController', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        exceptionFactory: (errors) => {
          const customErrors = [];
          errors.forEach((e) => {
            const keys = Object.keys(e.constraints);
            keys.forEach((k) => {
              customErrors.push({
                message: e.constraints[k],
                field: e.property,
              });
            });
          });
          throw new BadRequestException(customErrors);
        },
      }),
    );
    // app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    app.close();
  });

  let first_blog;
  let first_post;

  describe('blogger-controller', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });

    it('/blogs Create blog.', async () => {
      const response = await request(server)
        .post('/blogs')
        .send(CREATE_BLOG_DTO);

      first_blog = response.body;
    });

    it('/blogs Get created blog', async () => {
      const blog = await request(server).get(`/blogs/${first_blog.id}`);
      expect(blog.body).toStrictEqual(first_blog);
    });

    it('/blogs Update created blog', async () => {
      await request(server)
        .put(`/blogs/${first_blog.id}`)
        .send(UPDATE_BLOG_DTO)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/blogs Get updated blog', async () => {
      const response = await request(server).get(`/blogs/${first_blog.id}`);
      const updatedBlog = response.body;
      expect(updatedBlog).toStrictEqual({
        ...first_blog,
        ...UPDATE_BLOG_DTO,
      });
    });

    it('/blogs get status Not found blog ', () => {
      return request(server)
        .get(`/blogs/${uuidv4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/blogs/:blogId/posts create post by blogId ', async () => {
      const response = await request(server)
        .post(`/blogs/${first_blog.id}/posts`)
        .send(CREATE_POST_DTO);

      first_post = response.body;
    });

    it('/blogs/:blogId/posts get posts by blogId ', async () => {
      const response = await request(server).get(
        `/blogs/${first_blog.id}/posts`,
      );
      const posts = response.body;
      console.log(first_post);
      expect(posts).toStrictEqual({
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 1,
        items: [
          {
            title: first_post.title,
            shortDescription: first_post.shortDescription,
            content: first_post.content,
            blogId: first_blog.id,
            blogName: first_post.blogName,
            id: first_post.id,
            createdAt: first_post.createdAt,
            extendedLikesInfo: {
              dislikesCount: 0,
              likesCount: 0,
              myStatus: 'None',
              newestLikes: [],
            },
          },
        ],
      });
    });
  });

  describe('post-controller', () => {
    it('/posts Get post by post id', async () => {
      const response = await request(server).get('/posts/' + first_post.id);

      expect(response.body).toStrictEqual({
        title: first_post.title,
        shortDescription: first_post.shortDescription,
        content: first_post.content,
        blogId: first_blog.id,
        blogName: first_post.blogName,
        id: first_post.id,
        createdAt: first_post.createdAt,
        extendedLikesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
  });

  it('deleted blog', () => {
    return request(server)
      .delete('/blogs/' + first_blog.id)
      .expect(HttpStatus.NO_CONTENT);
  });
});
