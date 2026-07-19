import { constants } from 'http2';
import request from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from './helpers/basic-auth.helper';
import { clearAllData } from './helpers/db.helper';
import { E2eContext, initSettings } from './helpers/init-settings';
import { invalidInputData, validInputData } from './helpers/invalid-input-data';
import { expectPaginatorItemsCount, expectPaginatorShape } from './helpers/response.helpers';

describe('Blog API (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await initSettings();
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);
  });

  async function createBlogViaSa(overrides: Record<string, string> = {}) {
    const res = await request(ctx.httpServer)
      .post('/sa/blogs')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ ...validInputData.blog, ...overrides })
      .expect(constants.HTTP_STATUS_CREATED);

    return res.body as {
      id: string;
      name: string;
      description: string;
      websiteUrl: string;
      isMembership: boolean;
      createdAt: string;
    };
  }

  // testing get '/sa/blogs' api
  describe('GET /sa/blogs', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer).get('/sa/blogs').expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return paginated blogs — 200', async () => {
      await createBlogViaSa({ name: 'Blog A' });
      await createBlogViaSa({ name: 'Blog B' });

      const res = await request(ctx.httpServer)
        .get('/sa/blogs')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 2);
    });
  });

  // testing post '/sa/blogs' api
  describe('POST /sa/blogs', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .post('/sa/blogs')
        .send(validInputData.blog)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should create blog — 201', async () => {
      const res = await request(ctx.httpServer)
        .post('/sa/blogs')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send(validInputData.blog)
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        name: validInputData.blog.name,
        description: validInputData.blog.description,
        websiteUrl: validInputData.blog.websiteUrl,
        isMembership: false,
        createdAt: expect.any(String),
      });
    });

    it.each(invalidInputData.blog)(
      'should return 400 for invalid input — $description',
      async ({ payload, expectedFields }) => {
        const res = await request(ctx.httpServer)
          .post('/sa/blogs')
          .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
          .send(payload)
          .expect(constants.HTTP_STATUS_BAD_REQUEST);

        const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
        expectedFields.forEach((field) => expect(fields).toContain(field));
      },
    );
  });

  // testing put '/sa/blogs/:id' api
  describe('PUT /sa/blogs/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .put('/sa/blogs/00000000-0000-0000-0000-000000000001')
        .send(validInputData.blog)
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update blog — 204', async () => {
      const blog = await createBlogViaSa();

      await request(ctx.httpServer)
        .put(`/sa/blogs/${blog.id}`)
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({
          name: 'Updated name',
          description: 'Updated description',
          websiteUrl: 'https://updated.com',
        })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const res = await request(ctx.httpServer)
        .get(`/blogs/${blog.id}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.name).toBe('Updated name');
    });

    it('should return 404 for non-existent blog', async () => {
      await request(ctx.httpServer)
        .put('/sa/blogs/00000000-0000-0000-0000-000000000001')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send(validInputData.blog)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing delete '/sa/blogs/:id' api
  describe('DELETE /sa/blogs/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .delete('/sa/blogs/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should delete blog — 204', async () => {
      const blog = await createBlogViaSa();

      await request(ctx.httpServer)
        .delete(`/sa/blogs/${blog.id}`)
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      await request(ctx.httpServer)
        .get(`/blogs/${blog.id}`)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  // testing get '/blogs' api
  describe('GET /blogs', () => {
    it('should return paginated public blogs — 200', async () => {
      await createBlogViaSa({ name: 'Public A' });
      await createBlogViaSa({ name: 'Public B' });

      const res = await request(ctx.httpServer).get('/blogs').expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 2);
    });

    it('should support search by name', async () => {
      await createBlogViaSa({ name: 'SearchableBlog' });
      await createBlogViaSa({ name: 'OtherBlog' });

      const res = await request(ctx.httpServer)
        .get('/blogs?searchNameTerm=Search')
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
      expect(res.body.items[0].name).toBe('SearchableBlog');
    });
  });

  // testing get '/blogs/:id' api
  describe('GET /blogs/:id', () => {
    it('should return blog by id — 200', async () => {
      const blog = await createBlogViaSa();

      const res = await request(ctx.httpServer)
        .get(`/blogs/${blog.id}`)
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.id).toBe(blog.id);
      expect(res.body.name).toBe(blog.name);
    });

    it('should return 404 for non-existent blog', async () => {
      await request(ctx.httpServer)
        .get('/blogs/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });
});
