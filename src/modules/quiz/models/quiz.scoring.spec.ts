import {
  calculateFinalScores,
  getPairFinishDeadline,
  isAnswerCorrect,
  isPairFinishTimeoutExpired,
  PAIR_GAME_FINISH_TIMEOUT_MS,
  roundAvgScores,
} from './pair-game.model';

describe('Quiz scoring', () => {
  const t1 = new Date('2024-01-01T00:00:00.000Z');
  const t2 = new Date('2024-01-01T00:01:00.000Z');

  it('draw when first player gets speed bonus (example 1)', () => {
    const result = calculateFinalScores(2, 3, t1, t2);
    expect(result).toEqual({ firstScore: 3, secondScore: 3 });
  });

  it('second player wins when first has zero correct (example 2)', () => {
    const result = calculateFinalScores(0, 1, t1, t2);
    expect(result).toEqual({ firstScore: 0, secondScore: 1 });
  });

  it('no speed bonus when first finisher has zero correct', () => {
    const result = calculateFinalScores(0, 1, t1, t2);
    expect(result.firstScore).toBe(0);
  });

  it('gives speed bonus to second player when second finishes first', () => {
    const result = calculateFinalScores(2, 3, t2, t1);
    expect(result).toEqual({ firstScore: 2, secondScore: 4 });
  });

  it('does not give speed bonus to second when second finishes first with zero correct', () => {
    const result = calculateFinalScores(1, 0, t2, t1);
    expect(result).toEqual({ firstScore: 1, secondScore: 0 });
  });

  describe('isAnswerCorrect', () => {
    it('matches trimmed answers case-sensitively', () => {
      expect(isAnswerCorrect('  yes  ', ['no', 'yes'])).toBe(true);
      expect(isAnswerCorrect('Yes', ['yes'])).toBe(false);
      expect(isAnswerCorrect('maybe', [' yes ', 'no '])).toBe(false);
    });
  });

  describe('pair finish timeout helpers', () => {
    const finishedAt = new Date('2024-01-01T00:00:00.000Z');

    it('getPairFinishDeadline adds 10 seconds', () => {
      expect(getPairFinishDeadline(finishedAt).toISOString()).toBe('2024-01-01T00:00:10.000Z');
      expect(PAIR_GAME_FINISH_TIMEOUT_MS).toBe(10_000);
    });

    it('isPairFinishTimeoutExpired is false before deadline', () => {
      const now = new Date(finishedAt.getTime() + PAIR_GAME_FINISH_TIMEOUT_MS - 1);
      expect(isPairFinishTimeoutExpired(finishedAt, now)).toBe(false);
    });

    it('isPairFinishTimeoutExpired is true at and after deadline', () => {
      const atDeadline = new Date(finishedAt.getTime() + PAIR_GAME_FINISH_TIMEOUT_MS);
      const afterDeadline = new Date(finishedAt.getTime() + PAIR_GAME_FINISH_TIMEOUT_MS + 1);
      expect(isPairFinishTimeoutExpired(finishedAt, atDeadline)).toBe(true);
      expect(isPairFinishTimeoutExpired(finishedAt, afterDeadline)).toBe(true);
    });
  });

  describe('roundAvgScores', () => {
    it('returns 0 when gamesCount is 0', () => {
      expect(roundAvgScores(0, 0)).toBe(0);
      expect(roundAvgScores(5, 0)).toBe(0);
    });

    it('keeps one decimal when needed', () => {
      expect(roundAvgScores(5, 2)).toBe(2.5);
    });

    it('returns integer without trailing zeros', () => {
      expect(roundAvgScores(5, 1)).toBe(5);
      expect(JSON.stringify(roundAvgScores(5, 1))).toBe('5');
    });

    it('rounds to two decimal places', () => {
      expect(roundAvgScores(8, 3)).toBe(2.67);
    });
  });
});
