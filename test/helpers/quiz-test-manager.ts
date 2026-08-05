import { INestApplication } from '@nestjs/common';
import { constants } from 'http2';
import request from 'supertest';

import { ADMIN_BASIC_AUTH_HEADER } from './basic-auth.helper';

export type QuizQuestionResponse = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export class QuizTestManager {
  constructor(private readonly app: INestApplication) {}

  createQuestion(body: string, correctAnswers: string[]): Promise<QuizQuestionResponse> {
    return request(this.app.getHttpServer())
      .post('/sa/quiz/questions')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ body, correctAnswers })
      .expect(constants.HTTP_STATUS_CREATED)
      .then((res) => res.body as QuizQuestionResponse);
  }

  publishQuestion(id: string, published = true): Promise<void> {
    return request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}/publish`)
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .send({ published })
      .expect(constants.HTTP_STATUS_NO_CONTENT)
      .then(() => undefined);
  }

  deleteQuestion(id: string): Promise<void> {
    return request(this.app.getHttpServer())
      .delete(`/sa/quiz/questions/${id}`)
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .expect(constants.HTTP_STATUS_NO_CONTENT)
      .then(() => undefined);
  }

  getQuestions(query: Record<string, string | number> = {}): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .get('/sa/quiz/questions')
      .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
      .query(query);
  }
}
