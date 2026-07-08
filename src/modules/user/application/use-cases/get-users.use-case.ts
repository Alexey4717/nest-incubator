import { Injectable } from '@nestjs/common';

import { Paginator, SortDirections } from '@/shared/types/common';
import { IUseCase } from '@/shared/types/use-case';
import { normalizePaginationQuery } from '@/shared/utils/pagination';

import { UserQueryRepository } from '../../infrastructure/user-query.repository';
import { GetUsersInputModel, SortUsersBy } from '../../models/GetUsersInputModel';
import { UserViewModel } from '../../types/view-models';
import { toUserViewModel } from '../../utils/user.view-mapper';

@Injectable()
export class GetUsersUseCase implements IUseCase<GetUsersInputModel, Paginator<UserViewModel[]>> {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(input: GetUsersInputModel): Promise<Paginator<UserViewModel[]>> {
    const { searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize } = input;

    const pagination = normalizePaginationQuery<SortUsersBy>(
      { sortBy, sortDirection, pageNumber, pageSize },
      {
        sortBy: 'createdAt' as SortUsersBy,
        sortDirection: SortDirections.desc,
        pageNumber: 1,
        pageSize: 10,
      },
    );

    const resData = await this.userQueryRepository.getUsers({
      searchLoginTerm: searchLoginTerm || null,
      searchEmailTerm: searchEmailTerm || null,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    });

    const { pagesCount, page, pageSize: responsePageSize, totalCount, items } = resData || {};

    return {
      pagesCount,
      page,
      pageSize: responsePageSize,
      totalCount,
      items: items.map(toUserViewModel),
    };
  }
}
