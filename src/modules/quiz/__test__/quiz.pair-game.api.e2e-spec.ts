import { constants } from 'http2';
import request from 'supertest';

import { E2eContext, initSettings } from '@/__test__/setup/init-settings';
import { clearAllData } from '@/__test__/utils/db.helper';

import { createSaUser, loginAndGetToken } from '@/modules/auth/__test__/auth.helper';
import { QuizTestManager } from '@/modules/quiz/__test__/quiz-test-manager';

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

  function getMyGames(token: string, query: Record<string, string | number> = {}) {
    return request(ctx.httpServer)
      .get('/pair-game-quiz/pairs/my')
      .query(query)
      .set('Authorization', `Bearer ${token}`);
  }

  function getMyStatistic(token: string) {
    return request(ctx.httpServer)
      .get('/pair-game-quiz/users/my-statistic')
      .set('Authorization', `Bearer ${token}`);
  }

  function getTopUsers(query: Record<string, string | number | string[]> = {}) {
    return request(ctx.httpServer).get('/pair-game-quiz/users/top').query(query);
  }

  async function finishDrawGame(firstToken: string, secondToken: string): Promise<PairGameView> {
    await connect(firstToken);
    const gameRes = await connect(secondToken);
    const game = gameRes.body as PairGameView;
    const questions = game.questions!;

    for (let i = 0; i < 5; i++) {
      const answer = i < 2 ? correctAnswerFor(questions[i]) : 'wrong';
      await submitAnswer(firstToken, answer);
    }

    for (let i = 0; i < 5; i++) {
      const answer = i < 3 ? correctAnswerFor(questions[i]) : 'wrong';
      await submitAnswer(secondToken, answer);
    }

    const finished = await getById(firstToken, game.id).expect(constants.HTTP_STATUS_OK);
    return finished.body as PairGameView;
  }

  async function finishBWinsGame(firstToken: string, secondToken: string): Promise<PairGameView> {
    await connect(firstToken);
    const gameRes = await connect(secondToken);
    const game = gameRes.body as PairGameView;
    const questions = game.questions!;

    for (let i = 0; i < 5; i++) {
      await submitAnswer(firstToken, 'wrong');
    }

    await submitAnswer(secondToken, correctAnswerFor(questions[0]));
    for (let i = 1; i < 5; i++) {
      await submitAnswer(secondToken, 'wrong');
    }

    const finished = await getById(secondToken, game.id).expect(constants.HTTP_STATUS_OK);
    return finished.body as PairGameView;
  }

  it('401 without JWT on public endpoints', async () => {
    await request(ctx.httpServer)
      .post('/pair-game-quiz/pairs/connection')
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    await request(ctx.httpServer)
      .get('/pair-game-quiz/pairs/my-current')
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    await request(ctx.httpServer)
      .get('/pair-game-quiz/pairs/my')
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
    await request(ctx.httpServer)
      .get('/pair-game-quiz/users/my-statistic')
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
    await connect(token1).expect(constants.HTTP_STATUS_OK);

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

  it('POST connection when already PendingSecondPlayer — 403', async () => {
    await connect(token1);
    await connect(token1).expect(constants.HTTP_STATUS_FORBIDDEN);
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
    const finished = await finishBWinsGame(token1, token2);
    expect(finished.firstPlayerProgress.score).toBe(0);
    expect(finished.secondPlayerProgress!.score).toBe(1);
  });

  it('GET my and my-statistic: history includes pending, statistic only finished', async () => {
    await finishDrawGame(token1, token2);
    await connect(token1).expect(constants.HTTP_STATUS_OK);

    const history = await getMyGames(token1).expect(constants.HTTP_STATUS_OK);
    expect(history.body.totalCount).toBe(2);
    expect(history.body.items).toHaveLength(2);
    const statuses = history.body.items.map((item: PairGameView) => item.status).sort();
    expect(statuses).toEqual(['Finished', 'PendingSecondPlayer']);

    const statistic = await getMyStatistic(token1).expect(constants.HTTP_STATUS_OK);
    expect(statistic.body).toEqual({
      sumScore: 3,
      avgScores: 3,
      gamesCount: 1,
      winsCount: 0,
      lossesCount: 0,
      drawsCount: 1,
    });
  });

  it('GET my: sortBy=status uses secondary pairCreatedDate desc', async () => {
    const olderFinished = await finishDrawGame(token1, token2);
    const newerFinished = await finishBWinsGame(token1, token2);

    const history = await getMyGames(token1, {
      sortBy: 'status',
      sortDirection: 'asc',
    }).expect(constants.HTTP_STATUS_OK);

    expect(history.body.totalCount).toBe(2);
    expect(history.body.items[0].status).toBe('Finished');
    expect(history.body.items[1].status).toBe('Finished');
    expect(history.body.items[0].id).toBe(newerFinished.id);
    expect(history.body.items[1].id).toBe(olderFinished.id);
  });

  it('GET my: pageSize=1 paginates', async () => {
    await finishDrawGame(token1, token2);
    await connect(token1);

    const page1 = await getMyGames(token1, { pageSize: 1, pageNumber: 1 }).expect(
      constants.HTTP_STATUS_OK,
    );
    const page2 = await getMyGames(token1, { pageSize: 1, pageNumber: 2 }).expect(
      constants.HTTP_STATUS_OK,
    );

    expect(page1.body.totalCount).toBe(2);
    expect(page1.body.pagesCount).toBe(2);
    expect(page1.body.items).toHaveLength(1);
    expect(page2.body.items).toHaveLength(1);
    expect(page1.body.items[0].id).not.toBe(page2.body.items[0].id);
  });

  it('GET my-statistic: win/loss/draw and avgScores without .00', async () => {
    await finishDrawGame(token1, token2);
    await finishBWinsGame(token1, token2);

    const statistic = await getMyStatistic(token1).expect(constants.HTTP_STATUS_OK);
    expect(statistic.body).toEqual({
      sumScore: 3,
      avgScores: 1.5,
      gamesCount: 2,
      winsCount: 0,
      lossesCount: 1,
      drawsCount: 1,
    });
    expect(JSON.stringify(statistic.body.avgScores)).not.toContain('.00');

    const statistic2 = await getMyStatistic(token2).expect(constants.HTTP_STATUS_OK);
    expect(statistic2.body).toEqual({
      sumScore: 4,
      avgScores: 2,
      gamesCount: 2,
      winsCount: 1,
      lossesCount: 0,
      drawsCount: 1,
    });
    expect(statistic2.body.avgScores).toBe(2);
  });

  it('GET users/top: public, default order by avgScores then sumScore', async () => {
    await finishDrawGame(token1, token2);
    await finishBWinsGame(token1, token2);

    const top = await getTopUsers().expect(constants.HTTP_STATUS_OK);

    expect(top.body.totalCount).toBe(2);
    expect(top.body.items).toHaveLength(2);
    expect(top.body.items[0]).toEqual({
      sumScore: 4,
      avgScores: 2,
      gamesCount: 2,
      winsCount: 1,
      lossesCount: 0,
      drawsCount: 1,
      player: { id: user2Id, login: 'player2' },
    });
    expect(top.body.items[1]).toEqual({
      sumScore: 3,
      avgScores: 1.5,
      gamesCount: 2,
      winsCount: 0,
      lossesCount: 1,
      drawsCount: 1,
      player: { id: user1Id, login: 'player1' },
    });
  });

  it('GET users/top: multi-sort and pagination', async () => {
    await finishDrawGame(token1, token2);
    await finishBWinsGame(token1, token2);

    const byWins = await getTopUsers({
      sort: ['winsCount desc', 'lossesCount asc'],
    }).expect(constants.HTTP_STATUS_OK);

    expect(
      byWins.body.items.map((item: { player: { login: string } }) => item.player.login),
    ).toEqual(['player2', 'player1']);

    const page1 = await getTopUsers({ pageSize: 1, pageNumber: 1 }).expect(
      constants.HTTP_STATUS_OK,
    );
    const page2 = await getTopUsers({ pageSize: 1, pageNumber: 2 }).expect(
      constants.HTTP_STATUS_OK,
    );

    expect(page1.body.totalCount).toBe(2);
    expect(page1.body.pagesCount).toBe(2);
    expect(page1.body.items).toHaveLength(1);
    expect(page2.body.items).toHaveLength(1);
    expect(page1.body.items[0].player.login).toBe('player2');
    expect(page2.body.items[0].player.login).toBe('player1');
  });

  it('GET users/top: excludes users without Finished games', async () => {
    await finishDrawGame(token1, token2);
    await connect(token3).expect(constants.HTTP_STATUS_OK);

    const top = await getTopUsers().expect(constants.HTTP_STATUS_OK);

    expect(top.body.totalCount).toBe(2);
    expect(
      top.body.items.map((item: { player: { login: string } }) => item.player.login).sort(),
    ).toEqual(['player1', 'player2']);
  });

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  it('finish timeout via GET: auto-finishes with Incorrect for unanswered', async () => {
    await connect(token1);
    const gameRes = await connect(token2);
    const game = gameRes.body as PairGameView;
    const questions = game.questions!;

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token1, correctAnswerFor(questions[i])).expect(constants.HTTP_STATUS_OK);
    }

    await submitAnswer(token2, correctAnswerFor(questions[0])).expect(constants.HTTP_STATUS_OK);

    await sleep(10_500);

    // Access token TTL in testing is ~10s; refresh after waiting for game timeout.
    const freshToken1 = await loginAndGetToken(ctx.app, 'player1', 'Password1!');

    await getMyCurrent(freshToken1).expect(constants.HTTP_STATUS_NOT_FOUND);

    const finished = await getById(freshToken1, game.id).expect(constants.HTTP_STATUS_OK);
    const body = finished.body as PairGameView;

    expect(body.status).toBe('Finished');
    expect(body.finishGameDate).toEqual(expect.any(String));
    expect(body.firstPlayerProgress.answers).toHaveLength(5);
    expect(body.secondPlayerProgress!.answers).toHaveLength(5);
    expect(body.secondPlayerProgress!.answers[0].answerStatus).toBe('Correct');
    expect(
      body.secondPlayerProgress!.answers.slice(1).every((a) => a.answerStatus === 'Incorrect'),
    ).toBe(true);
    expect(body.firstPlayerProgress.score).toBe(6);
    expect(body.secondPlayerProgress!.score).toBe(1);
  }, 30000);

  it('finish timeout blocks POST answers with 403', async () => {
    await connect(token1);
    const gameRes = await connect(token2);
    const game = gameRes.body as PairGameView;

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token1, correctAnswerFor(game.questions![i])).expect(
        constants.HTTP_STATUS_OK,
      );
    }

    await sleep(10_500);

    const freshToken2 = await loginAndGetToken(ctx.app, 'player2', 'Password1!');

    await submitAnswer(freshToken2, 'too-late').expect(constants.HTTP_STATUS_FORBIDDEN);

    const finished = await getById(freshToken2, game.id).expect(constants.HTTP_STATUS_OK);
    expect(finished.body.status).toBe('Finished');
    expect(finished.body.secondPlayerProgress.answers).toHaveLength(5);
    expect(
      finished.body.secondPlayerProgress.answers.every(
        (a: { answerStatus: string }) => a.answerStatus === 'Incorrect',
      ),
    ).toBe(true);
  }, 30000);

  it('second player finishes within 10s window — normal Finished', async () => {
    await connect(token1);
    const gameRes = await connect(token2);
    const game = gameRes.body as PairGameView;
    const questions = game.questions!;

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token1, correctAnswerFor(questions[i])).expect(constants.HTTP_STATUS_OK);
    }

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token2, correctAnswerFor(questions[i])).expect(constants.HTTP_STATUS_OK);
    }

    const finished = await getById(token1, game.id).expect(constants.HTTP_STATUS_OK);
    const body = finished.body as PairGameView;

    expect(body.status).toBe('Finished');
    expect(body.firstPlayerProgress.answers).toHaveLength(5);
    expect(body.secondPlayerProgress!.answers).toHaveLength(5);
    expect(body.secondPlayerProgress!.answers.every((a) => a.answerStatus === 'Correct')).toBe(
      true,
    );
    expect(body.firstPlayerProgress.score).toBe(6);
    expect(body.secondPlayerProgress!.score).toBe(5);
  });

  it('after finish timeout both players can connect again', async () => {
    await connect(token1);
    const gameRes = await connect(token2);
    const game = gameRes.body as PairGameView;

    for (let i = 0; i < 5; i++) {
      await submitAnswer(token1, correctAnswerFor(game.questions![i])).expect(
        constants.HTTP_STATUS_OK,
      );
    }

    await sleep(10_500);

    const freshToken1 = await loginAndGetToken(ctx.app, 'player1', 'Password1!');
    const freshToken2 = await loginAndGetToken(ctx.app, 'player2', 'Password1!');

    const reconnect1 = await connect(freshToken1).expect(constants.HTTP_STATUS_OK);
    expect(reconnect1.body.status).toBe('PendingSecondPlayer');
    expect(reconnect1.body.id).not.toBe(game.id);

    const reconnect2 = await connect(freshToken2).expect(constants.HTTP_STATUS_OK);
    expect(reconnect2.body.status).toBe('Active');
    expect(reconnect2.body.id).toBe(reconnect1.body.id);
  }, 30000);
});
