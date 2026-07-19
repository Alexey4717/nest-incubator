import { INestApplication } from '@nestjs/common';
import { constants } from 'http2';
import request from 'supertest';

import { createSaUser, loginAndGetToken } from './auth.helper';
import { ADMIN_BASIC_AUTH_HEADER } from './basic-auth.helper';
import { clearAllData } from './db.helper';
import { validInputData } from './invalid-input-data';

export type CommentE2eSetup = {
  ownerToken: string;
  otherToken: string;
  postId: string;
  ownerCommentId: string;
  otherCommentId: string;
  ownerLogin: string;
  otherLogin: string;
};

export async function setupCommentE2eContext(app: INestApplication): Promise<CommentE2eSetup> {
  await clearAllData(app);

  const ownerLogin = 'cmntowner';
  const otherLogin = 'cmntother';
  const password = 'qwerty12';

  const blogRes = await request(app.getHttpServer())
    .post('/sa/blogs')
    .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
    .send(validInputData.blog)
    .expect(constants.HTTP_STATUS_CREATED);

  const postRes = await request(app.getHttpServer())
    .post('/posts')
    .set('Authorization', ADMIN_BASIC_AUTH_HEADER)
    .send({ ...validInputData.post, blogId: blogRes.body.id })
    .expect(constants.HTTP_STATUS_CREATED);

  await createSaUser(app, {
    login: ownerLogin,
    email: 'cmntowner@test.dev',
    password,
  });
  await createSaUser(app, {
    login: otherLogin,
    email: 'cmntother@test.dev',
    password,
  });

  const ownerToken = await loginAndGetToken(app, ownerLogin, password);
  const otherToken = await loginAndGetToken(app, otherLogin, password);

  const ownerCommentRes = await request(app.getHttpServer())
    .post(`/posts/${postRes.body.id}/comments`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ content: 'Owner comment content here' })
    .expect(constants.HTTP_STATUS_CREATED);

  const otherCommentRes = await request(app.getHttpServer())
    .post(`/posts/${postRes.body.id}/comments`)
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ content: 'Other user comment content' })
    .expect(constants.HTTP_STATUS_CREATED);

  return {
    ownerToken,
    otherToken,
    postId: postRes.body.id,
    ownerCommentId: ownerCommentRes.body.id,
    otherCommentId: otherCommentRes.body.id,
    ownerLogin,
    otherLogin,
  };
}
