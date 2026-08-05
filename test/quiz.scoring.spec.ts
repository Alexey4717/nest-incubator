import { calculateFinalScores } from '../src/modules/quiz/models/pair-game.model';

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
});
