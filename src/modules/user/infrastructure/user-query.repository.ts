import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { PaginatedViewDto } from '@/core/dto/paginated-view.dto';
import { Paginator } from '@/core/types/common';
import { applyPagination, applySort } from '@/core/utils/typeorm-pagination';

import { GetUsersQueryParamsDto, SortUsersBy } from '../dto/get-users-query-params.dto';
import { UserModel } from '../models/user.model';
import { toDomain } from './user.mapper';
import { UserOrmEntity } from './user.orm-entity';

const SORT_COLUMN_MAP: Record<SortUsersBy, keyof UserOrmEntity> = {
  createdAt: 'createdAt',
  login: 'login',
  email: 'email',
};

@Injectable()
export class UserQueryRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly usersRepository: Repository<UserOrmEntity>,
  ) {}

  async getUsers(query: GetUsersQueryParamsDto): Promise<Paginator<UserModel[]>> {
    const { searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize } = query;

    const qb = this.usersRepository.createQueryBuilder('user');

    if (searchLoginTerm && !searchEmailTerm) {
      qb.andWhere('user.login ILIKE :loginTerm', { loginTerm: `%${searchLoginTerm}%` });
    } else if (searchEmailTerm && !searchLoginTerm) {
      qb.andWhere('user.email ILIKE :emailTerm', { emailTerm: `%${searchEmailTerm}%` });
    } else if (searchLoginTerm && searchEmailTerm) {
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('user.login ILIKE :loginTerm', { loginTerm: `%${searchLoginTerm}%` })
            .orWhere('user.email ILIKE :emailTerm', { emailTerm: `%${searchEmailTerm}%` });
        }),
      );
    }

    const sortColumn = SORT_COLUMN_MAP[sortBy] ?? 'createdAt';
    applySort(qb, 'user', sortColumn, sortDirection);
    applyPagination(qb, query.calculateSkip(), pageSize);

    const [entities, totalCount] = await qb.getManyAndCount();

    return PaginatedViewDto.mapToView({
      items: entities.map(toDomain),
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }

  async findUserById(id: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({ where: { id } });
    return entity ? toDomain(entity) : null;
  }

  async findUserLoginById(id: string): Promise<string | null> {
    const entity = await this.usersRepository.findOne({
      where: { id },
      select: { login: true },
    });
    return entity?.login ?? null;
  }

  async findUserByLogin(login: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({ where: { login } });
    return entity ? toDomain(entity) : null;
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({ where: { email } });
    return entity ? toDomain(entity) : null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return entity ? toDomain(entity) : null;
  }

  async findByConfirmationCode(code: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({ where: { confirmationCode: code } });
    return entity ? toDomain(entity) : null;
  }

  async findUserByRecoveryCode(code: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({ where: { recoveryCode: code } });
    return entity ? toDomain(entity) : null;
  }
}
