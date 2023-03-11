import { UpdatePostDto } from './../src/posts/dto/update-post.dto';
import { CreateCommentByPostIdDto } from './../src/posts/dto/create-comment-by-postId.dto';
import { CreateUserDto } from './../src/users/dto/create-user.dto';
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
import cookieParser = require('cookie-parser');
import supertest from 'supertest';
import { HttpExceptionFilter } from '../src/http-exception.filter';
import { AppModule } from '../src/app.module';
import { CreateBlogDto } from '../src/blogs/dto/create-blog.dto';
import { v4 as uuidv4 } from 'uuid';

const FIRST_USER: CreateUserDto = {
  login: 'slava',
  password: '123456',
  email: 'test@yandex.ru',
};

const SECOND_USER: CreateUserDto = {
  login: 'ivan',
  password: '123456',
  email: 'test2@yandex.ru',
};

const CREATE_BLOG_DTO: CreateBlogDto = {
  name: 'First blog',
  description: 'First blog description',
  websiteUrl: 'https://vercel.com/slavapetrushiin/blogs',
};

const UPDATE_BLOG_DTO: UpdateBlogDto = {
  name: 'Update blog',
  description: 'First blog description updated',
  websiteUrl:
    'https://www.mongodb.com/docs/manual/reference/operator/query/in/',
};

const CREATE_POST_DTO: CreatePostByBlogIdDto = {
  content: 'test post content',
  shortDescription: 'test post shortDescription',
  title: 'Test post title',
};

const UPDATE_POST_DTO: UpdatePostDto = {
  content: 'test post content update',
  shortDescription: 'test post shortDescription update',
  title: 'Test post title update',
  blogId: '',
};

const BASIC_AUTH = {
  headerName: 'Authorization',
  payload: 'Basic YWRtaW46cXdlcnR5',
};

const CREATE_COMMENT_DTO: CreateCommentByPostIdDto = {
  content: 'Created comment',
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
    app.use(cookieParser());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    server = app.getHttpServer();

    await supertest(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    app.close();
  });

  let first_user, second_user;
  let first_user_token, second_user_token;
  let first_blog;
  let first_post;

  describe('Create users. Check the existence of the created user.', () => {
    it('Get status UnauthorizedException in create user', async () => {
      return supertest(server)
        .post('/users')
        .send(FIRST_USER)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('Create first user', async () => {
      const response = await supertest(server)
        .post('/users')
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .send(FIRST_USER);

      first_user = response.body;

      expect(first_user).toStrictEqual({
        id: expect.any(String),
        login: FIRST_USER.login,
        email: FIRST_USER.email,
        createdAt: expect.any(String),
      });
    });

    it('Create second user', async () => {
      const response = await supertest(server)
        .post('/users')
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .send(SECOND_USER);

      second_user = response.body;

      expect(second_user).toStrictEqual({
        id: expect.any(String),
        login: SECOND_USER.login,
        email: SECOND_USER.email,
        createdAt: expect.any(String),
      });
    });

    it('Get all created users', async () => {
      const response = await supertest(server)
        .get('/users')
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload);

      expect(response.body).toStrictEqual({
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            login: SECOND_USER.login,
            email: SECOND_USER.email,
            createdAt: expect.any(String),
          },
          {
            id: expect.any(String),
            login: FIRST_USER.login,
            email: FIRST_USER.email,
            createdAt: expect.any(String),
          },
        ],
      });
    });
  });

  describe('blogger-controller', () => {
    it('/blogs Create blog.', async () => {
      const response = await supertest(server)
        .post('/blogs')
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .send(CREATE_BLOG_DTO);

      first_blog = response.body;
    });

    it('/blogs Get created blog', async () => {
      const blog = await supertest(server).get(`/blogs/${first_blog.id}`);
      expect(blog.body).toStrictEqual(first_blog);
    });

    it('/blogs Update created blog', async () => {
      await supertest(server)
        .put(`/blogs/${first_blog.id}`)
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .send(UPDATE_BLOG_DTO)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/blogs Get updated blog', async () => {
      const response = await supertest(server).get(`/blogs/${first_blog.id}`);
      const updatedBlog = response.body;
      expect(updatedBlog).toStrictEqual({
        ...first_blog,
        ...UPDATE_BLOG_DTO,
      });
    });

    it('/blogs get status Not found blog ', () => {
      return supertest(server)
        .get(`/blogs/${uuidv4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('/blogs/:blogId/posts create post by blogId ', async () => {
      const response = await supertest(server)
        .post(`/blogs/${first_blog.id}/posts`)
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .send(CREATE_POST_DTO);

      first_post = response.body;
    });

    it('/blogs/:blogId/posts get posts by blogId ', async () => {
      const response = await supertest(server).get(
        `/blogs/${first_blog.id}/posts`,
      );
      const posts = response.body;
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
      const response = await supertest(server).get('/posts/' + first_post.id);

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

    it('/update post', async () => {
      return supertest(server)
        .put('/posts/' + first_post.id)
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .send({
          ...UPDATE_POST_DTO,
          blogId: first_blog.id,
        })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('/delete post', async () => {
      return supertest(server)
        .delete('/posts/' + first_post.id)
        .set(BASIC_AUTH.headerName, BASIC_AUTH.payload)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('get deleted post', async () => {
      return supertest(server)
        .get('/posts/' + first_post.id)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
