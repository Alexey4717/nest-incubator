import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/core/types/use-case';

import { FindUserByIdUseCase } from '@/modules/user/application/use-cases/find-user-by-id.use-case';

import { MeViewModel } from '../../types/view-models';

@Injectable()
export class GetMeUseCase implements IUseCase<string, MeViewModel | null> {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  async execute(userId: string): Promise<MeViewModel | null> {
    const fullUser = await this.findUserByIdUseCase.execute(userId);
    if (!fullUser) return null;
    return {
      userId: fullUser.id,
      login: fullUser.login,
      email: fullUser.email,
    };
  }
}
