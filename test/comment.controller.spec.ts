import { StatusLike } from './../src/likes/schemas/likes.schema';
import { INestApplication, ValidationPipe, BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer, Length } from 'class-validator';
import cookieParser = require('cookie-parser');
import supertest from 'supertest';
import { HttpExceptionFilter } from '../src/http-exception.filter';
import { AppModule } from '../src/app.module';

const BASIC_AUTH = {
  headerName: 'Authorization',
  payload: 'Basic YWRtaW46cXdlcnR5',
};

const BLOG_MODEL = {
  name: 'Test in jest',
  description: 'blogDescription',
  websiteUrl: 'https://someurl1.com',
};

const BLOG_MODEL_TWO = {
  name: 'LOG_MODEL_TWO',
  description: 'blogDescription',
  websiteUrl: 'https://someurl1.com',
};

const BLOG_MODEL_THREE = {
  name: 'LOG_MODEL_TWO',
  description: 'blogDescription',
  websiteUrl: 'https://someurl1.com',
};

const POST_MODEL_1 = {
  title: 'post 1',
  shortDescription: 'postDescription2',
  content: 'i like js in too much',
};

const POST_MODEL_2 = {
  title: 'post 2',
  shortDescription: 'postDescription2',
  content: 'i like js in too much',
};

const POST_MODEL_3 = {
  title: 'post 3',
  shortDescription: 'postDescription2',
  content: 'i like js in too much',
};

const POST_MODEL_4 = {
  title: 'post 4',
  shortDescription: 'postDescription2',
  content: 'i like js in too much',
};

const POST_MODEL_5 = {
  title: 'post 5',
  shortDescription: 'postDescription2',
  content: 'i like js in too much',
};

const POST_MODEL_6 = {
  title: 'post 6',
  shortDescription: 'postDescription2',
  content: 'i like js in too much',
};

const COMMENT_CONTENT_1 = {
  content: 'content 1 fds fs df s',
};

const COMMENT_CONTENT_2 = {
  content: 'content 2 dfg dfs gdfs g',
};

jest.setTimeout(15000);
describe('Comments', () => {
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
  });

  afterAll(async () => {
    app.close();
  });

  //Users
  const inputModelUser1 = {
    login: 'login-1',
    password: 'password-1',
    email: 'test@yandex.by',
  };
  const inputModelUser2 = {
    login: 'login-2',
    password: 'password-2',
    email: 'test2@yandex.by',
  };
  const inputModelUser3 = {
    login: 'login-3',
    password: 'password-3',
    email: 'test3@yandex.by',
  };
  const inputModelUser4 = {
    login: 'login-4',
    password: 'password-4',
    email: 'test4@yandex.by',
  };

  //UsersLogins
  const correctInputModelAuth1 = {
    loginOrEmail: 'login-1',
    password: 'password-1',
  };
  const correctInputModelAuth2 = {
    loginOrEmail: 'login-2',
    password: 'password-2',
  };
  const correctInputModelAuth3 = {
    loginOrEmail: 'login-3',
    password: 'password-3',
  };
  const correctInputModelAuth4 = {
    loginOrEmail: 'login-4',
    password: 'password-4',
  };

  //Tokens
  const tokens = {
    token_user_1: '',
    token_user_2: '',
    token_user_3: '',
    token_user_4: '',
  };

  let post_1, post_2, post_3, post_4, post_5, post_6;
  const postId1 = '',
    postId2 = '';
  // postId3 = '',
  // postId4 = '',
  // postId5 = '',
  // postId6 = '';
  let comment_1, comment_2, comment_4;
  let commentId1, commentId2, commentId4;
  let cookie1, cookie2, cookie4;
  let users;
  let blogId, secondBlogId;

  it('should delete all data', async () => {
    await supertest(server).delete('/testing/all-data').expect(204);
  });

  it('created 4 user, one blog, 2 posts', async () => {
    //Registration users
    // await supertest(server).post('/auth/registration').send(inputModelUser1).expect(204);
    // await supertest(server).post('/auth/registration').send(inputModelUser2).expect(204);
    // await supertest(server).post('/auth/registration').send(inputModelUser3).expect(204);
    // await supertest(server).post('/auth/registration').send(inputModelUser4).expect(204);

    await supertest(server).post('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`).send(inputModelUser1).expect(201);
    await supertest(server).post('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`).send(inputModelUser2).expect(201);
    await supertest(server).post('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`).send(inputModelUser3).expect(201);
    await supertest(server).post('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`).send(inputModelUser4).expect(201);

    //Auth
    const auth_user_1 = await supertest(server).post('/auth/login').set('user-agent', 'Mozilla').send(correctInputModelAuth1);
    const auth_user_2 = await supertest(server).post('/auth/login').set('user-agent', 'AppleWebKit').send(correctInputModelAuth2);
    const auth_user_3 = await supertest(server).post('/auth/login').set('user-agent', 'Chrome').send(correctInputModelAuth3);
    const auth_user_4 = await supertest(server).post('/auth/login').set('user-agent', 'Safari').send(correctInputModelAuth4);

    tokens.token_user_1 = auth_user_1.body.accessToken;
    tokens.token_user_2 = auth_user_2.body.accessToken;
    tokens.token_user_3 = auth_user_3.body.accessToken;
    tokens.token_user_4 = auth_user_4.body.accessToken;

    cookie1 = auth_user_1.header['set-cookie'];
    cookie2 = auth_user_2.header['set-cookie'];
    cookie4 = auth_user_4.header['set-cookie'];

    console.log({ tokens });

    const blog = await supertest(server).post('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_1}`).send(BLOG_MODEL).expect(201);
    const secondBlog = await supertest(server).post('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_1}`).send(BLOG_MODEL_TWO).expect(201);
    blogId = blog.body.id;
    secondBlogId = secondBlog.body.id;

    // //CREATE POSTS
    // post_1 = await supertest(server).post(`/blogger/blogs/${blogID}/posts`).set('Authorization', `Bearer ${tokens.token_user_1}`).send(POST_MODEL_1);
    // post_2 = await supertest(server).post(`/blogger/blogs/${blogID}/posts`).set('Authorization', `Bearer ${tokens.token_user_1}`).send(POST_MODEL_2);
    // postId1 = post_1.body.id;
    // postId2 = post_2.body.id;

    // console.log({ postId1: post_1.body });

    // //CREATE  COMMENTS
    // comment_1 = await supertest(server).post(`/posts/${postId1}/comments`).set('Authorization', `Bearer ${tokens.token_user_1}`).send(COMMENT_CONTENT_1);
    // comment_2 = await supertest(server).post(`/posts/${postId1}/comments`).set('Authorization', `Bearer ${tokens.token_user_2}`).send(COMMENT_CONTENT_2);
    // comment_4 = await supertest(server).post(`/posts/${postId1}/comments`).set('Authorization', `Bearer ${tokens.token_user_4}`).send(COMMENT_CONTENT_2);
    // commentId1 = comment_1.body.id;
    // commentId2 = comment_2.body.id;
    // commentId4 = comment_4.body.id;

    // post_3 = await supertest(server)
    //   .post(`/blogs/${blogID}/posts`)
    //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    //   .send(POST_MODEL_3);
    // postId3 = post_3.body.id;

    // post_4 = await supertest(server)
    //   .post(`/blogs/${blogID}/posts`)
    //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    //   .send(POST_MODEL_4);
    // postId4 = post_4.body.id;

    // post_5 = await supertest(server)
    //   .post(`/blogs/${blogID}/posts`)
    //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    //   .send(POST_MODEL_5);
    // postId5 = post_5.body.id;

    // post_6 = await supertest(server)
    //   .post(`/blogs/${blogID}/posts`)
    //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    //   .send(POST_MODEL_6);
    // postId6 = post_6.body.id;
  });

  it('Shoud created two blogs', async function () {
    const blogs = await supertest(server).get('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_1}`);
    const firstBlogId = blogs.body.items[0].id;
    const secondBlogId = blogs.body.items[1].id;

    const isBanBlog = await supertest(server)
      .put(`/sa/blogs/${secondBlogId}/ban`)
      .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
      .send({ isBanned: true })
      .expect(204);

    // const isUnBanBlog = await supertest(server)
    //   .put(`/sa/blogs/${secondBlogId}/ban`)
    //   .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    //   .send({ isBanned: false })
    //   .expect(204);

    const secondBlog = await supertest(server).get(`/blogs/${secondBlogId}`);
    expect(secondBlog.body.id).toBe(secondBlogId);
  });

  it('shoud find all user for bannd blog', async () => {
    const users = await supertest(server).get('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`);

    await supertest(server)
      .put(`/blogger/users/${users.body.items[0].id}/ban`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send({ isBanned: true, banReason: 'banReason banReason banReason', blogId: blogId })
      .expect(204);

    await supertest(server)
      .put(`/blogger/users/${users.body.items[1].id}/ban`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send({ isBanned: true, banReason: 'banReason banReason banReason', blogId: blogId })
      .expect(204);

    await supertest(server)
      .put(`/blogger/users/${users.body.items[2].id}/ban`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send({ isBanned: true, banReason: 'banReason banReason banReason', blogId: blogId })
      .expect(204);

    const allUsersForBannedBlog = await supertest(server).get(`/blogger/users/blog/${blogId}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
    expect(allUsersForBannedBlog.body.items.length).toBe(3);
  });

  it('shoud retur status code 404 , if user not exist', async () => {
    await supertest(server)
      .put(`/blogger/users/${new Date().toISOString()}/ban`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send({ isBanned: true, banReason: 'banReason banReason banReason', blogId: blogId })
      .expect(404);
  });

  it('get all comments', async () => {
    const post_1 = await supertest(server)
      .post(`/blogger/blogs/${secondBlogId}/posts`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send(POST_MODEL_1)
      .expect(201);

    const post_2 = await supertest(server)
      .post(`/blogger/blogs/${secondBlogId}/posts`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send(POST_MODEL_2)
      .expect(201);

    const post_3 = await supertest(server)
      .post(`/blogger/blogs/${secondBlogId}/posts`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send(POST_MODEL_3)
      .expect(201);

    const response = await supertest(server).get(`/blogger/blogs/${secondBlogId}/posts`).set('Authorization', `Bearer ${tokens.token_user_1}`);
    expect(response.body.items.length).toBe(3);

    const comment1ByPost1 = await supertest(server)
      .post(`/posts/${post_1.body.id}/comments`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send(COMMENT_CONTENT_1)
      .expect(201);

    const comment2ByPost1 = await supertest(server)
      .post(`/posts/${post_1.body.id}/comments`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send(COMMENT_CONTENT_2)
      .expect(201);

    const comment1ByPost2 = await supertest(server)
      .post(`/posts/${post_2.body.id}/comments`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send(COMMENT_CONTENT_2)
      .expect(201);

    const allCommentsBlogger = await supertest(server).get(`/blogger/blogs/comments`).set('Authorization', `Bearer ${tokens.token_user_1}`);

    await supertest(server)
      .put(`/posts/${post_1.body.id}/like-status`)
      .set('Authorization', `Bearer ${tokens.token_user_1}`)
      .send({ likeStatus: StatusLike.Like })
      .expect(HttpStatus.NO_CONTENT);

    await supertest(server)
      .put(`/posts/${post_2.body.id}/like-status`)
      .set('Authorization', `Bearer ${tokens.token_user_2}`)
      .send({ likeStatus: StatusLike.Dislike })
      .expect(HttpStatus.NO_CONTENT);

    await supertest(server)
      .put(`/posts/${post_3.body.id}/like-status`)
      .set('Authorization', `Bearer ${tokens.token_user_3}`)
      .send({ likeStatus: StatusLike.Like })
      .expect(HttpStatus.NO_CONTENT);

    await supertest(server)
      .put(`/posts/${post_1.body.id}/like-status`)
      .set('Authorization', `Bearer ${tokens.token_user_4}`)
      .send({ likeStatus: StatusLike.Like })
      .expect(HttpStatus.NO_CONTENT);
  });

  // it('Should get users', async function () {
  //   const responseUsers = await supertest(server).get('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`);
  //   expect(responseUsers.body.items.length).toBe(4);
  //   users = responseUsers.body.items;
  // });

  // it('shoud get my blogs', async () => {
  //   await supertest(server).post('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_1}`).send(BLOG_MODEL_TWO).expect(201);
  //   await supertest(server).post('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_2}`).send(BLOG_MODEL_THREE).expect(201);
  //   await supertest(server).post('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_4}`).send(BLOG_MODEL_THREE).expect(201);

  //   const blogsFirstUser = await supertest(server).get('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_1}`);
  //   expect(blogsFirstUser.body.items.length).toBe(2);
  // });

  // it('should posts length == 2', async () => {
  //   const response = await supertest(server).get(`/posts`).set('Authorization', `Bearer ${tokens.token_user_1}`);
  //   const posts = response.body;
  //   expect(posts.totalCount).toBe(2);
  // });

  // it('should comments by postId length == 3', async () => {
  //   const response = await supertest(server).get(`/posts/${postId1}/comments`).set('Authorization', `Bearer ${tokens.token_user_1}`);
  //   const comments = response.body;
  //   expect(comments.totalCount).toBe(3);
  // });

  // it('should four likes at first post', async function () {
  //   await supertest(server)
  //     .put(`/posts/${postId1}/like-status`)
  //     .set('Authorization', `Bearer ${tokens.token_user_1}`)
  //     .send({ likeStatus: StatusLike.Like })
  //     .expect(HttpStatus.NO_CONTENT);

  //   await supertest(server)
  //     .put(`/posts/${postId1}/like-status`)
  //     .set('Authorization', `Bearer ${tokens.token_user_2}`)
  //     .send({ likeStatus: StatusLike.Like })
  //     .expect(HttpStatus.NO_CONTENT);

  //   await supertest(server)
  //     .put(`/posts/${postId1}/like-status`)
  //     .set('Authorization', `Bearer ${tokens.token_user_3}`)
  //     .send({ likeStatus: StatusLike.Like })
  //     .expect(HttpStatus.NO_CONTENT);

  //   await supertest(server)
  //     .put(`/posts/${postId1}/like-status`)
  //     .set('Authorization', `Bearer ${tokens.token_user_4}`)
  //     .send({ likeStatus: StatusLike.Like })
  //     .expect(HttpStatus.NO_CONTENT);

  //   const PostByIdForFirstUser = await supertest(server).get(`/posts/${postId1}`).set('Authorization', `Bearer ${tokens.token_user_1}`);

  //   expect(PostByIdForFirstUser.body).toStrictEqual({
  //     id: expect.any(String),
  //     title: expect.any(String),
  //     shortDescription: expect.any(String),
  //     content: expect.any(String),
  //     blogId: expect.any(String),
  //     blogName: expect.any(String),
  //     createdAt: expect.any(String),
  //     extendedLikesInfo: {
  //       likesCount: 4,
  //       dislikesCount: 0,
  //       myStatus: 'Like',
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-4',
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-3',
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-2',
  //         },
  //       ],
  //     },
  //   });
  // });

  // it('should return postsbyId after dislikes', async () => {
  //   // create dislike/like for post from both users
  //   await supertest(server).put(`/posts/${postId1}/like-status`).set('Authorization', `Bearer ${tokens.token_user_1}`).send({ likeStatus: StatusLike.Dislike });
  //   await supertest(server).put(`/posts/${postId1}/like-status`).set('Authorization', `Bearer ${tokens.token_user_2}`).send({ likeStatus: StatusLike.Like });

  //   const PostByIdForFirstUser = await supertest(server).get(`/posts/${postId1}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
  //   expect(PostByIdForFirstUser.body).toStrictEqual({
  //     id: expect.any(String),
  //     title: expect.any(String),
  //     shortDescription: expect.any(String),
  //     content: expect.any(String),
  //     blogId: expect.any(String),
  //     blogName: expect.any(String),
  //     createdAt: expect.any(String),
  //     extendedLikesInfo: {
  //       likesCount: 3,
  //       dislikesCount: 1,
  //       myStatus: 'Dislike',
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-4',
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-3',
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-2',
  //         },
  //       ],
  //     },
  //   });

  //   const PostByIdForSecondUser = await supertest(server).get(`/posts/${postId1}`).set('Authorization', `Bearer ${tokens.token_user_2}`);
  //   expect(PostByIdForSecondUser.body).toStrictEqual({
  //     id: expect.any(String),
  //     title: expect.any(String),
  //     shortDescription: expect.any(String),
  //     content: expect.any(String),
  //     blogId: expect.any(String),
  //     blogName: expect.any(String),
  //     createdAt: expect.any(String),
  //     extendedLikesInfo: {
  //       likesCount: 3,
  //       dislikesCount: 1,
  //       myStatus: 'Like',
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-4',
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-3',
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           userId: expect.any(String),
  //           login: 'login-2',
  //         },
  //       ],
  //     },
  //   });
  // });

  // it('should return all posts after cancel likes', async () => {
  //   // create dislike for post and comment from first user
  //   await supertest(server)
  //     .put(`/posts/${postId1}/like-status`)
  //     .set('Authorization', `Bearer ${tokens.token_user_1}`)
  //     .send({ likeStatus: StatusLike.None })
  //     .expect(204);
  //   await supertest(server)
  //     .put(`/posts/${postId1}/like-status`)
  //     .set('Authorization', `Bearer ${tokens.token_user_2}`)
  //     .send({ likeStatus: StatusLike.None })
  //     .expect(204);

  //   const PostByIdForFirstUser = await supertest(server).get(`/posts`).set('Authorization', `Bearer ${tokens.token_user_1}`);

  //   expect(PostByIdForFirstUser.body).toStrictEqual({
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 2,
  //     items: [
  //       {
  //         id: expect.any(String),
  //         title: expect.any(String),
  //         shortDescription: expect.any(String),
  //         content: expect.any(String),
  //         blogId: expect.any(String),
  //         blogName: expect.any(String),
  //         createdAt: expect.any(String),
  //         extendedLikesInfo: {
  //           likesCount: 0,
  //           dislikesCount: 0,
  //           myStatus: 'None',
  //           newestLikes: [],
  //         },
  //       },
  //       {
  //         id: expect.any(String),
  //         title: expect.any(String),
  //         shortDescription: expect.any(String),
  //         content: expect.any(String),
  //         blogId: expect.any(String),
  //         blogName: expect.any(String),
  //         createdAt: expect.any(String),
  //         extendedLikesInfo: {
  //           likesCount: 2,
  //           dislikesCount: 0,
  //           myStatus: 'None',
  //           newestLikes: [
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: 'login-4',
  //             },
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: 'login-3',
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //   });

  //   const PostByIdForSecondUser = await supertest(server).get(`/posts`).set('Authorization', `Bearer ${tokens.token_user_2}`);
  //   expect(PostByIdForSecondUser.body).toStrictEqual({
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 2,
  //     items: [
  //       {
  //         id: expect.any(String),
  //         title: expect.any(String),
  //         shortDescription: expect.any(String),
  //         content: expect.any(String),
  //         blogId: expect.any(String),
  //         blogName: expect.any(String),
  //         createdAt: expect.any(String),
  //         extendedLikesInfo: {
  //           likesCount: 0,
  //           dislikesCount: 0,
  //           myStatus: 'None',
  //           newestLikes: [],
  //         },
  //       },
  //       {
  //         id: expect.any(String),
  //         title: expect.any(String),
  //         shortDescription: expect.any(String),
  //         content: expect.any(String),
  //         blogId: expect.any(String),
  //         blogName: expect.any(String),
  //         createdAt: expect.any(String),
  //         extendedLikesInfo: {
  //           likesCount: 2,
  //           dislikesCount: 0,
  //           myStatus: 'None',
  //           newestLikes: [
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: 'login-4',
  //             },
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: 'login-3',
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //   });
  // });

  // it('Should ban fourth user', async () => {
  //   await supertest(server)
  //     .put(`/sa/users/${users[0].id}/ban`)
  //     .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
  //     .send({ isBanned: true, banReason: 'Давно выяснено, что при оценке' })
  //     .expect(204);
  // });

  // it('Should didn`t see like fourth banned user', async () => {
  //   const PostByIdForSecondUser = await supertest(server).get(`/posts`).set('Authorization', `Bearer ${tokens.token_user_2}`);
  //   expect(PostByIdForSecondUser.body).toStrictEqual({
  //     pagesCount: 1,
  //     page: 1,
  //     pageSize: 10,
  //     totalCount: 2,
  //     items: [
  //       {
  //         id: expect.any(String),
  //         title: expect.any(String),
  //         shortDescription: expect.any(String),
  //         content: expect.any(String),
  //         blogId: expect.any(String),
  //         blogName: expect.any(String),
  //         createdAt: expect.any(String),
  //         extendedLikesInfo: {
  //           likesCount: 0,
  //           dislikesCount: 0,
  //           myStatus: 'None',
  //           newestLikes: [],
  //         },
  //       },
  //       {
  //         id: expect.any(String),
  //         title: expect.any(String),
  //         shortDescription: expect.any(String),
  //         content: expect.any(String),
  //         blogId: expect.any(String),
  //         blogName: expect.any(String),
  //         createdAt: expect.any(String),
  //         extendedLikesInfo: {
  //           likesCount: 1,
  //           dislikesCount: 0,
  //           myStatus: 'None',
  //           newestLikes: [
  //             {
  //               addedAt: expect.any(String),
  //               userId: expect.any(String),
  //               login: 'login-3',
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //   });
  // });

  // it('should delete current device, if user logout', async () => {
  //   await supertest(server).post('/auth/logout').set('Cookie', cookie1).expect(204);
  // });

  // describe('bind blog with user', () => {
  //   it('Not bind blog with user, if blog binded user', async () => {
  //     //GET USERS
  //     const users = await supertest(server).get('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`);
  //     expect(users.body.items.length).toBe(4);
  //     const userId = users.body.items[0].id;

  //     //GET BLOGS
  //     const blogsFirstUser = await supertest(server).get('/blogger/blogs').set('Authorization', `Bearer ${tokens.token_user_1}`);
  //     expect(blogsFirstUser.body.items.length).toBe(2);
  //     const blogId = blogsFirstUser.body.items[0].id;

  //     await supertest(server).put(`/sa/blogs/${blogId}/bind-with-user/${userId}`).set('Authorization', `Basic YWRtaW46cXdlcnR5`).expect(400);
  //   });
  // });

  // describe('Tokens', () => {
  //   let auth_user_1, cookieWithTokens, cookieWithUpdatedTokens;

  //   it('should register user', async () => {
  //     auth_user_1 = await supertest(server).post('/auth/login').set('user-agent', 'Mozilla').send(correctInputModelAuth1).expect(200);
  //     cookieWithTokens = auth_user_1.header['set-cookie'];
  //   });

  //   it('should refresh-token', async () => {
  //     const result = await supertest(server).post('/auth/refresh-token').set('Cookie', cookieWithTokens);
  //     cookieWithUpdatedTokens = result.header['set-cookie'];

  //     expect(result.body).toStrictEqual({
  //       accessToken: expect.any(String),
  //     });
  //   });

  //   it('LogoutTimeout', async () => {
  //     // await LogoutTimeout();
  //     await supertest(server).post('/auth/logout').set('Cookie', cookie1).expect(401);
  //   });
  // });

  // describe('Check devices', () => {
  //   const notValidRefreshToken = "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MTkiLCJpYXQiOjE2NzE4MDMxNzEsImV4cCI6MTY3MTgzOTE3MX0.qWEEdZE92hf5QGgUJDneJOzIY4rF8gIykyezL0u95hY"
  //   let userInMozilla, userInAppleWebKit, userInChrome, userInSafari;
  //   let device1, device2, device3, device4;
  //   let cookie1, cookie2, cookie3, cookie4;

  //   it('should delete all data', async () => {
  //     await supertest(server).delete('/testing/all-data').expect(204);
  //   });

  //   it('User  should login four brousers', async () => {
  //     await supertest(server).post('/auth/registration').send(inputModelUser1);

  //     userInMozilla = await supertest(server).post('/auth/login').set('user-agent', 'Mozilla').send(correctInputModelAuth1);
  //     userInAppleWebKit = await supertest(server).post('/auth/login').set('user-agent', 'AppleWebKit').send(correctInputModelAuth1);
  //     userInChrome = await supertest(server).post('/auth/login').set('user-agent', 'Chrome').send(correctInputModelAuth1);
  //     userInSafari = await supertest(server).post('/auth/login').set('user-agent', 'Safari').send(correctInputModelAuth1);

  //     cookie1 = userInMozilla.header['set-cookie'];
  //     cookie2 = userInAppleWebKit.header['set-cookie'];
  //     cookie3 = userInChrome.header['set-cookie'];
  //     cookie4 = userInSafari.header['set-cookie'];

  //     const userAuthSessions = await supertest(server).get('/security/devices').set('Cookie', cookie1);

  //     expect(userAuthSessions.body.length).toBe(4);
  //     device1 = userAuthSessions.body[0].deviceId;
  //     device2 = userAuthSessions.body[1].deviceId;
  //     device3 = userAuthSessions.body[2].deviceId;
  //     device4 = userAuthSessions.body[3].deviceId;
  //   })

  //   it('Should return error if :id from uri param not found', async () => {
  //     await supertest(server).delete(`/security/devices/ba841d88-c79c-46c0-98a0-748529aea19p`).set('Cookie', cookie1).expect(404);
  //   })

  //   it('Should return 204 status if remove exist device id', async () => {
  //     await supertest(server).delete(`/security/devices/${device1}`).set('Cookie', cookie1).expect(204);
  //     let userAuthSessions = await supertest(server).get('/security/devices').set('Cookie', cookie1);
  //     expect(userAuthSessions.body.length).toBe(3);
  //   })

  //   it('Should return 401 status if auth credentials is incorrect', async () => {
  //     await supertest(server).delete(`/security/devices/${device1}`).set('Cookie', notValidRefreshToken).expect(401);
  //   })

  //   it('Should return 403 status if deviceId belongs to someone else  user', async () => {
  //     await supertest(server).post('/auth/registration').send(inputModelUser2);
  //     const secondUserAuth = await supertest(server).post('/auth/login').set('user-agent', 'AppleWebKit').send(correctInputModelAuth2).expect(200);
  //     const secondCookie = secondUserAuth.header['set-cookie'];
  //     const secondUserSessions = await supertest(server).get('/security/devices').set('Cookie', secondCookie);
  //     const deviceIdSecondUser = secondUserSessions.body[0].deviceId;

  //     expect(secondUserSessions.body.length).toBe(1);

  //     await supertest(server).delete(`/security/devices/${deviceIdSecondUser}`).set('Cookie', cookie1).expect(403);
  //   })

  // })

  // describe("Banned user like for comment", () => {
  //   let auth, token, user, cookie1, blog, blogID, post, postId1, comment;

  //   it('should delete all data', async () => {
  //     await supertest(server).delete('/testing/all-data').expect(204);
  //   });

  //   it('Should create user', async function () {
  //     await supertest(server)
  //       .post('/sa/users')
  //       .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
  //       .send(inputModelUser1)
  //       .expect(201);

  //     const users = await supertest(server).get('/sa/users').set('Authorization', `Basic YWRtaW46cXdlcnR5`);
  //     expect(users.body).toStrictEqual({
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [
  //         {
  //           id: expect.any(String),
  //           login: expect.any(String),
  //           email: expect.any(String),
  //           createdAt: expect.any(String),
  //           banInfo: {
  //             isBanned: false,
  //             banDate: null,
  //             banReason: null,
  //           },
  //         },
  //       ],
  //     })

  //     user = users.body.items[0];
  //   })

  //   it('should login', async () => {
  //     auth = await supertest(server).post('/auth/login').set('user-agent', 'Chrome').send(correctInputModelAuth1).expect(200);
  //     token = auth.body.accessToken;
  //     cookie1 = auth.header['set-cookie'];
  //   })

  //   it('Should create blog', async function () {
  //     await supertest(server).post('/blogger/blogs').set('Authorization', `Bearer ${token}`).send(BLOG_MODEL).expect(201);

  //     const blogs = await supertest(server).get('/blogger/blogs').set('Authorization', `Bearer ${token}`).send(BLOG_MODEL);
  //     blog = blogs.body.items[0];

  //     expect(blog).toStrictEqual({
  //       id: expect.any(String),
  //       name: BLOG_MODEL.name,
  //       description: BLOG_MODEL.description,
  //       websiteUrl: BLOG_MODEL.websiteUrl,
  //       createdAt: expect.any(String),
  //       isMembership: expect.any(Boolean),
  //       isBanned: false,
  //     })

  //     blogID = blog.id;
  //   })

  //   it('Should create post', async function () {
  //     await supertest(server).post(`/blogger/blogs/${blogID}/posts`).set('Authorization', `Bearer ${token}`).send(POST_MODEL_1).expect(201);

  //     const posts = await supertest(server).get(`/blogger/blogs/${blogID}/posts`).set('Authorization', `Bearer ${token}`).send(POST_MODEL_1)
  //     expect(posts.body).toStrictEqual({
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [
  //         {
  //           id: expect.any(String),
  //           title: expect.any(String),
  //           shortDescription: expect.any(String),
  //           content: expect.any(String),
  //           blogId: expect.any(String),
  //           blogName: expect.any(String),
  //           createdAt: expect.any(String),
  //           extendedLikesInfo: {
  //             likesCount: 0,
  //             dislikesCount: 0,
  //             myStatus: 'None',
  //             newestLikes: [],
  //           },
  //         },
  //       ],
  //     })

  //     post = posts.body.items[0];
  //   })

  //   it('Should create comment', async function () {
  //     await supertest(server).post(`/posts/${post.id}/comments`).set('Authorization', `Bearer ${token}`).send(COMMENT_CONTENT_1);

  //     const commetns = await supertest(server).get(`/posts/${post.id}/comments`).set('Authorization', `Bearer ${token}`);
  //     expect(commetns.body).toStrictEqual({
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [
  //         {
  //           id: expect.any(String),
  //           content: expect.any(String),
  //           createdAt: expect.any(String),
  //           commentatorInfo: {
  //             userId: user.id,
  //             userLogin: expect.any(String),
  //           },
  //           likesInfo: {
  //             likesCount: 0,
  //             dislikesCount: 0,
  //             myStatus: StatusLike.None,
  //           },
  //         },
  //       ],
  //     })

  //     comment = commetns.body.items[0];
  //   })

  //   it('Should ban user', async () => {
  //     await supertest(server)
  //       .put(`/sa/users/${user.id}/ban`)
  //       .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
  //       .send({ isBanned: true, banReason: "Давно выяснено, что при оценке" })
  //       .expect(204)
  //   })

  //   it("Shouldn't return banned user comment", async () => {
  //     await supertest(server)
  //       .get(`/comments/${comment.id}`)
  //       .expect(404)
  //   })

  //   it("Should return user comment after remove ban", async () => {
  //     await supertest(server)
  //       .put(`/sa/users/${user.id}/ban`)
  //       .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
  //       .send({ isBanned: false, banReason: "Давно выяснено, что при оценке" })
  //       .expect(204)

  //     const commetns = await supertest(server).get(`/posts/${post.id}/comments`).set('Authorization', `Bearer ${token}`);
  //     expect(commetns.body).toStrictEqual({
  //       pagesCount: 1,
  //       page: 1,
  //       pageSize: 10,
  //       totalCount: 1,
  //       items: [
  //         {
  //           id: expect.any(String),
  //           content: expect.any(String),
  //           createdAt: expect.any(String),
  //           commentatorInfo: {
  //             userId: user.id,
  //             userLogin: expect.any(String),
  //           },
  //           likesInfo: {
  //             likesCount: 0,
  //             dislikesCount: 0,
  //             myStatus: StatusLike.None,
  //           },
  //         },
  //       ],
  //     })
  //   })
  // })
});
