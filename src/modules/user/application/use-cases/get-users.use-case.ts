import { Injectable } from '@nestjs/common';

import { Paginator } from '@/core/types/common';
import { IUseCase } from '@/core/types/use-case';

import { GetUsersQueryParamsDto } from '../../dto/get-users-query-params.dto';
import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { UserModel } from '../../models/user.model';

@Injectable()
export class GetUsersUseCase implements IUseCase<GetUsersQueryParamsDto, Paginator<UserModel[]>> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  execute(input: GetUsersQueryParamsDto): Promise<Paginator<UserModel[]>> {
    return this.userQueryRepository.getUsers(input);
  }
}
