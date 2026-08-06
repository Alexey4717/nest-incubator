import { AnswerStatus, PairGameStatus } from '../domain/pair-game-status.enum';

export type PlayerInGameView = {
  id: string;
  login: string;
};

export type AnswerInProgressView = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
};

export type PlayerProgressView = {
  player: PlayerInGameView;
  answers: AnswerInProgressView[];
  score: number;
};

export type QuestionInGameView = {
  id: string;
  body: string;
};

export type PairGameViewModel = {
  id: string;
  status: PairGameStatus;
  firstPlayerProgress: PlayerProgressView;
  secondPlayerProgress: PlayerProgressView | null;
  questions: QuestionInGameView[] | null;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};

export type AnswerResultViewModel = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
};

export const PAIR_GAME_QUESTIONS_COUNT = 5;

export type UserStatisticViewModel = {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
};

export function calculateFinalScores(
  firstCorrectCount: number,
  secondCorrectCount: number,
  firstFinishedAt: Date,
  secondFinishedAt: Date,
): { firstScore: number; secondScore: number } {
  let firstScore = firstCorrectCount;
  let secondScore = secondCorrectCount;

  const firstFinishedFirst = firstFinishedAt.getTime() <= secondFinishedAt.getTime();

  if (firstFinishedFirst) {
    if (firstCorrectCount >= 1) {
      firstScore += 1;
    }
  } else if (secondCorrectCount >= 1) {
    secondScore += 1;
  }

  return { firstScore, secondScore };
}

export function roundAvgScores(sumScore: number, gamesCount: number): number {
  if (gamesCount <= 0) {
    return 0;
  }
  return Number((sumScore / gamesCount).toFixed(2));
}

export function isAnswerCorrect(answer: string, correctAnswers: string[]): boolean {
  const normalized = answer.trim();
  return correctAnswers.some((correct) => correct.trim() === normalized);
}
