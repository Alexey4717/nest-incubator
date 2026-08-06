import { constants } from 'http2';
import request from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from './helpers/basic-auth.helper';
import { clearAllData } from './helpers/db.helper';
import { E2eContext, initSettings } from './helpers/init-settings';
import { QuizTestManager } from './helpers/quiz-test-manager';
import { expectPaginatorItemsCount } from './helpers/response.helpers';

describe('Quiz SA API (e2e)', () => {
  let ctx: E2eContext;
  let quiz: QuizTestManager;

  beforeAll(async () => {
    ctx = await initSettings();
    quiz = new QuizTestManager(ctx.app);
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);
  });

  describe('GET /sa/quiz/questions', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .get('/sa/quiz/questions')
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should return paginated questions — 200', async () => {
      await quiz.createQuestion('Question A', ['A']);
      await quiz.createQuestion('Question B', ['B']);

      const res = await quiz.getQuestions();
      expect(res.status).toBe(constants.HTTP_STATUS_OK);
      expectPaginatorItemsCount(res.body, 2);
    });

    it('should filter by bodySearchTerm and publishedStatus', async () => {
      const q1 = await quiz.createQuestion('Capital of France', ['Paris']);
      await quiz.createQuestion('Capital of Germany', ['Berlin']);
      await quiz.publishQuestion(q1.id);

      const publishedRes = await quiz.getQuestions({ publishedStatus: 'published' });
      expectPaginatorItemsCount(publishedRes.body, 1);

      const searchRes = await quiz.getQuestions({ bodySearchTerm: 'France' });
      expectPaginatorItemsCount(searchRes.body, 1);
    });

    it('should accept empty-string query params like homework checker — 200', async () => {
      await quiz.createQuestion('question body01', ['correct1']);

      const res = await request(ctx.httpServer)
        .get('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .query({
          pageNumber: '',
          pageSize: '',
          sortBy: '',
          sortDirection: '',
          publishedStatus: '',
          bodySearchTerm: '',
        })
        .expect(constants.HTTP_STATUS_OK);

      expect(res.body.items[0].updatedAt).toBeNull();
    });

    it('should accept repeated query params (array values) like some HTTP clients — 200', async () => {
      await quiz.createQuestion('question body02', ['correct2']);

      const res = await request(ctx.httpServer)
        .get('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .query({
          pageNumber: ['1'],
          pageSize: ['10'],
          sortBy: ['createdAt'],
          sortDirection: ['desc'],
          publishedStatus: ['all'],
        })
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
    });

    it('should accept bracket-style array query params — 200', async () => {
      await quiz.createQuestion('question body03', ['correct3']);

      const res = await request(ctx.httpServer)
        .get(
          '/sa/quiz/questions?pageNumber[]=1&pageSize[]=10&sortBy[]=createdAt&sortDirection[]=desc&publishedStatus[]=all',
        )
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
    });

    it('should accept unknown sortBy like homework checker — 200', async () => {
      await quiz.createQuestion('question body04', ['correct4']);

      const res = await request(ctx.httpServer)
        .get('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .query({ sortBy: '111' })
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(res.body, 1);
    });

    it('should accept response-field sortBy values — 200', async () => {
      await quiz.createQuestion('question body05', ['correct5']);

      const byUpdatedAt = await request(ctx.httpServer)
        .get('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .query({ sortBy: 'updatedAt' })
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(byUpdatedAt.body, 1);

      const byBody = await request(ctx.httpServer)
        .get('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .query({ sortBy: 'body' })
        .expect(constants.HTTP_STATUS_OK);

      expectPaginatorItemsCount(byBody.body, 1);
    });
  });

  describe('POST /sa/quiz/questions', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .post('/sa/quiz/questions')
        .send({ body: 'Q', correctAnswers: ['A'] })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should create question — 201', async () => {
      const res = await request(ctx.httpServer)
        .post('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({ body: 'What is 2+2?', correctAnswers: ['4'] })
        .expect(constants.HTTP_STATUS_CREATED);

      expect(res.body).toEqual({
        id: expect.any(String),
        body: 'What is 2+2?',
        correctAnswers: ['4'],
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
      });
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(ctx.httpServer)
        .post('/sa/quiz/questions')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({ body: 'short', correctAnswers: [] })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);

      const fields = res.body.errorsMessages.map((e: { field: string }) => e.field);
      expect(fields).toContain('body');
      expect(fields).toContain('correctAnswers');
    });
  });

  describe('PUT /sa/quiz/questions/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .put('/sa/quiz/questions/00000000-0000-0000-0000-000000000001')
        .send({ body: 'Q', correctAnswers: ['A'] })
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should update question — 204', async () => {
      const created = await quiz.createQuestion('Old question body', ['old']);

      await request(ctx.httpServer)
        .put(`/sa/quiz/questions/${created.id}`)
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({ body: 'Updated question body', correctAnswers: ['new'] })
        .expect(constants.HTTP_STATUS_NO_CONTENT);

      const list = await quiz.getQuestions({ bodySearchTerm: 'Updated question body' });
      expect(list.body.items[0].body).toBe('Updated question body');
      expect(list.body.items[0].updatedAt).toEqual(expect.any(String));
    });

    it('should return 404 for non-existent question', async () => {
      await request(ctx.httpServer)
        .put('/sa/quiz/questions/00000000-0000-0000-0000-000000000001')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({ body: 'Valid body!', correctAnswers: ['A'] })
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });

  describe('PUT /sa/quiz/questions/:id/publish', () => {
    it('should return 400 when publishing without correctAnswers', async () => {
      const created = await quiz.createQuestion('Unpublishable', ['temp']);

      await request(ctx.httpServer)
        .put(`/sa/quiz/questions/${created.id}`)
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .send({ body: 'Unpublishable', correctAnswers: [] })
        .expect(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it('should publish question with correctAnswers — 204', async () => {
      const created = await quiz.createQuestion('Publish me', ['yes']);
      await quiz.publishQuestion(created.id);

      const list = await quiz.getQuestions({ publishedStatus: 'published' });
      expect(list.body.items[0].published).toBe(true);
      expect(list.body.items[0].updatedAt).toEqual(expect.any(String));
    });
  });

  describe('DELETE /sa/quiz/questions/:id', () => {
    it('should return 401 if not auth', async () => {
      await request(ctx.httpServer)
        .delete('/sa/quiz/questions/00000000-0000-0000-0000-000000000001')
        .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it('should delete question — 204', async () => {
      const created = await quiz.createQuestion('To delete!', ['x']);
      await quiz.deleteQuestion(created.id);

      const list = await quiz.getQuestions();
      expectPaginatorItemsCount(list.body, 0);
    });

    it('should return 404 for non-existent question', async () => {
      await request(ctx.httpServer)
        .delete('/sa/quiz/questions/00000000-0000-0000-0000-000000000001')
        .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
        .expect(constants.HTTP_STATUS_NOT_FOUND);
    });
  });
});
