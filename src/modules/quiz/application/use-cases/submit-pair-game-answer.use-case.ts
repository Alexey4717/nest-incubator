import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';
import { validateOrRejectModel } from '@/core/utils/helpers';

import { SubmitPairGameAnswerDto } from '../../dto/pair-game.dto';
import { PairGameRepository } from '../../infrastructure/pair-game.repository';
import { AnswerResultViewModel } from '../../models/pair-game.model';

type SubmitPairGameAnswerInput = {
  userId: string;
  input: SubmitPairGameAnswerDto;
};

@Injectable()
export class SubmitPairGameAnswerUseCase implements IUseCase<
  SubmitPairGameAnswerInput,
  AnswerResultViewModel
> {
  constructor(private readonly pairGameRepository: PairGameRepository) {}

  async execute({ userId, input }: SubmitPairGameAnswerInput): Promise<AnswerResultViewModel> {
    await validateOrRejectModel(
      input,
      SubmitPairGameAnswerDto,
      'SubmitPairGameAnswerUseCase.execute',
    );
    return this.pairGameRepository.submitAnswer(userId, input.answer);
  }
}
