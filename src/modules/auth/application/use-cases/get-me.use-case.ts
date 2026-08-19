import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { IUseCase } from '@/core/types/use-case';

import { FindUserByIdQuery } from '@/modules/user/application/queries/find-user-by-id.query';

import { MeViewModel } from '../../types/view-models';

@Injectable()
export class GetMeUseCase implements IUseCase<string, MeViewModel | null> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(userId: string): Promise<MeViewModel | null> {
    const fullUser = await this.queryBus.execute(new FindUserByIdQuery(userId));
    if (!fullUser) return null;
    return {
      userId: fullUser.id,
      login: fullUser.login,
      email: fullUser.email,
    };
  }
}
