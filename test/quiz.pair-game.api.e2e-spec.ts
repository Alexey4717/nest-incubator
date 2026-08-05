import { constants } from 'http2';
import request from 'supertest';

import { createSaUser, loginAndGetToken } from './helpers/auth.helper';
import { clearAllData } from './helpers/db.helper';
import { E2eContext, initSettings } from './helpers/init-settings';
import { QuizTestManager } from './helpers/quiz-test-manager';

type PairGameView = {
  id: string;
  status: string;
  firstPlayerProgress: {
    player: { id: string; login: string };
    answers: { questionId: string; answerStatus: string; addedAt: string }[];
    score: number;
  };
  secondPlayerProgress: {
    player: { id: string; login: string };
    answers: { questionId: string; answerStatus: string; addedAt: string }[];
    score: number;
  } | null;
  questions: { id: string; body: string }[] | null;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};

describe('Quiz Pair Game API (e2e)', () => {
  let ctx: E2eContext;
  let quiz: QuizTestManager;
  let token1: string;
  let token2: string;
  let token3: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    ctx = await initSettings();
    quiz = new QuizTestManager(ctx.app);
  }, 120000);

  afterAll(async () => {
    await ctx.app?.close?.();
  });

  beforeEach(async () => {
    await clearAllData(ctx.app);

    const user1 = await createSaUser(ctx.app, {
      login: 'player1',
      password: 'Password1!',
      email: 'player1@test.com',
    });
    const user2 = await createSaUser(ctx.app, {
      login: 'player2',
      password: 'Password1!',
      email: 'player2@test.com',
    });
    await createSaUser(ctx.app, {
      login: 'player3',
      password: 'Password1!',
      email: 'player3@test.com',
    });

    user1Id = user1.id;
    user2Id = user2.id;
    token1 = await loginAndGetToken(ctx.app, 'player1', 'Password1!');
    token2 = await loginAndGetToken(ctx.app, 'player2', 'Password1!');
    token3 = await loginAndGetToken(ctx.app, 'player3', 'Password1!');

    for (let i = 1; i <= 5; i++) {
      const q = await quiz.createQuestion(`Question ${i}`, [`Answer ${i}`]);
      await quiz.publishQuestion(q.id);
    }
  });

  function connect(token: string) {
    return request(ctx.httpServer)
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${token}`);
  }

  function getMyCurrent(token: string) {
    return request(ctx.httpServer)
      .get('/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${token}`);
  }

  function getById(token: string, id: string) {
    return request(ctx.httpServer)
      .get(`/pair-game-quiz/pairs/${id}`)
      .set('Authorization', `Bearer ${token}`);
  }

  function submitAnswer(token: string, answer: string) {
    return request(ctx.httpServer)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ answer });
  }

  it('401 without JWT on public endpoints', async () => {
    await request(ctx.httpServer)
      .post('/pair-game-quiz/pairs/connection')
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    await request(ctx.httpServer)
      .get('/pair-game-quiz/pairs/my-current')
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });

  it('User1 connects — PendingSecondPlayer', async () => {
    const res = await connect(token1).expect(constants.HTTP_STATUS_OK);
    const body = res.body as PairGameView;

    expect(body.status).toBe('PendingSecondPlayer');
    expect(body.secondPlayerProgress).toBeNull();
    expect(body.questions).toBeNull();
    expect(body.pairCreatedDate).toEqual(expect.any(String));
    expect(body.startGameDate).toBeNull();
    expect(body.finishGameDate).toBeNull();
    expect(body.firstPlayerProgress.player.id).toBe(user1Id);
    expect(body.firstPlayerProgress.answers).toEqual([]);
    expect(body.firstPlayerProgress.score).toBe(0);
  });

  function correctAnswerFor(question: { body: string }): string {
    const match = question.body.match(/Question (\d+)/);
    return match ? `Answer ${match[1]}` : 'wrong';
  }

  it('User2 connects — Active with 5 questions', async () => {
    const res1 = await connect(token1).expect(constants.HTTP_STATUS_OK);
    const res1Again = await connect(token1).expect(constants.HTTP_STATUS_OK);
    expect(res1Again.body.id).toBe(res1.body.id);

    const res2 = await connect(token2).expect(constants.HTTP_STATUS_OK);
    const game = res2.body as PairGameView;

    expect(game.status).toBe('Active');
    expect(game.secondPlayerProgress?.player.id).toBe(user2Id);
    expect(game.questions).toHaveLength(5);
    expect(game.startGameDate).toEqual(expect.any(String));
  });

  it('GET my-current and GET by id return progress structure', async () => {
    const created = await connect(token1);
    await connect(token2);

    const myCurrent = await getMyCurrent(token1).expect(constants.HTTP_STATUS_OK);
    expect(myCurrent.body.firstPlayerProgress.player.login).toBe('player1');

    const byId = await getById(token1, created.body.id).expect(constants.HTTP_STATUS_OK);
    expect(byId.body.id).toBe(created.body.id);
  });

  it('GET by id with invalid UUID — 400', async () => {
    const res = await getById(token1, 'not-a-uuid').expect(constants.HTTP_STATUS_BAD_REQUEST);
    expect(res.body.errorsMessages).toBeDefined();
  });

  it('GET by id for non-participant — 403', async () => {
    const created = await connect(token1);
    await connect(token2);

    await getById(token3, created.body.id).expect(constants.HTTP_STATUS_FORBIDDEN);
  });

  it('GET my-current without active pair — 404', async () => {
    await getMyCurrent(token1).expect(constants.HTTP_STATUS_NOT_FOUND);
  });

  it('POST connection when already Active — 403', async () => {
    await connect(token1);
    await connect(token2);

    await connect(token1).expect(constants.HTTP_STATUS_FORBIDDEN);
  });

  it('POST answers returns AnswerResultView only', async () => {
    await connect(token1);
    const game = await connect(token2);
    const question = game.body.questions[0];

    const res = await submitAnswer(token1, correctAnswerFor(question)).expect(
      constants.HTTP_STATUS_OK,
    );
    expect(res.body).toEqual({
      questionId: question.id,
      answerStatus: 'Correct',
      addedAt: expect.any(String),
    });
    expect(res.body.id).toBeUndefined();
  });

  it('403 when all 5 questions answered', async () => {
    await connect(token1);
    const game = await connect(token2);

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token1, correctAnswerFor(game.body.questions[i])).expect(
        constants.HTTP_STATUS_OK,
      );
    }

    await submitAnswer(token1, 'extra').expect(constants.HTTP_STATUS_FORBIDDEN);
  });

  it('draw scenario — scores 3:3', async () => {
    await connect(token1);
    const gameRes = await connect(token2);
    const game = gameRes.body as PairGameView;
    const questions = game.questions!;

    for (let i = 0; i < 5; i++) {
      const answer = i < 2 ? correctAnswerFor(questions[i]) : 'wrong';
      await submitAnswer(token1, answer);
    }

    for (let i = 0; i < 5; i++) {
      const answer = i < 3 ? correctAnswerFor(questions[i]) : 'wrong';
      await submitAnswer(token2, answer);
    }

    const finished = await getById(token1, game.id).expect(constants.HTTP_STATUS_OK);
    expect(finished.body.status).toBe('Finished');
    expect(finished.body.firstPlayerProgress.score).toBe(3);
    expect(finished.body.secondPlayerProgress.score).toBe(3);
  });

  it('B wins scenario — scores 0:1', async () => {
    await connect(token1);
    const gameRes = await connect(token2);
    const game = gameRes.body as PairGameView;
    const questions = game.questions!;

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token1, 'wrong');
    }

    await submitAnswer(token2, correctAnswerFor(questions[0]));
    for (let i = 1; i < 5; i++) {
      await submitAnswer(token2, 'wrong');
    }

    const finished = await getById(token2, game.id).expect(constants.HTTP_STATUS_OK);
    expect(finished.body.firstPlayerProgress.score).toBe(0);
    expect(finished.body.secondPlayerProgress.score).toBe(1);
  });
});
