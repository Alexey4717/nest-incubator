import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { TypedQuery } from '@/core/types/cqrs-augmentation';

import { MeViewModel } from '../../types/view-models';
import { GetMeUseCase } from '../use-cases/get-me.use-case';

export class GetMeQuery extends TypedQuery<MeViewModel | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, MeViewModel | null> {
  constructor(private readonly getMeUseCase: GetMeUseCase) {}

  execute(query: GetMeQuery): Promise<MeViewModel | null> {
    return this.getMeUseCase.execute(query.userId);
  }
}
