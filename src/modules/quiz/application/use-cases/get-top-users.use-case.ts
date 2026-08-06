import { Injectable } from '@nestjs/common';

import { Paginator } from '@/core/types/common';
import { IUseCase } from '@/core/types/use-case';

import { GetTopUsersQueryParamsDto } from '../../dto/pair-game.dto';
import { PairGameQueryRepository } from '../../infrastructure/pair-game-query.repository';
import { TopUserStatisticViewModel } from '../../models/pair-game.model';

@Injectable()
export class GetTopUsersUseCase implements IUseCase<
  GetTopUsersQueryParamsDto,
  Paginator<TopUserStatisticViewModel[]>
> {
  constructor(private readonly pairGameQueryRepository: PairGameQueryRepository) {}

  execute(query: GetTopUsersQueryParamsDto): Promise<Paginator<TopUserStatisticViewModel[]>> {
    return this.pairGameQueryRepository.getTopUsers(query);
  }
}
