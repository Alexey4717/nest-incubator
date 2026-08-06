import { calculateFinalScores, roundAvgScores } from './pair-game.model';

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
