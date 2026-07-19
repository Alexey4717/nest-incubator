import { Injectable } from '@nestjs/common';

import { Paginator } from '@/core/types/common';
import { IUseCase } from '@/core/types/use-case';

import { GetUsersQueryParamsDto } from '../../dto/get-users-query-params.dto';
import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserViewModel } from '../../types/view-models';
import { toUserViewModel } from '../../utils/user.view-mapper';

@Injectable()
export class GetUsersUseCase implements IUseCase<
  GetUsersQueryParamsDto,
  Paginator<UserViewModel[]>
> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(input: GetUsersQueryParamsDto): Promise<Paginator<UserViewModel[]>> {
    const resData = await this.userQueryRepository.getUsers(input);

    return {
      ...resData,
      items: resData.items.map(toUserViewModel),
    };
  }
}
