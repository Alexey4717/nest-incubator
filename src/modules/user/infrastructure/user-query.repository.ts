import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CommonQueryParamsTypes, Paginator, SortDirections } from '@/shared/types/common';
import { calculateAndGetSkipValue } from '@/shared/utils/helpers';

import { SortUsersBy } from '../models/GetUsersInputModel';
import { UserModel } from '../models/user.model';
import { UserEntity } from './user.entity';
import { toDomain } from './user.mapper';

type GetUsersArgs = CommonQueryParamsTypes & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  sortBy: SortUsersBy;
};

const SORT_COLUMN_MAP: Record<SortUsersBy, keyof UserEntity> = {
  createdAt: 'createdAt',
  login: 'login',
  email: 'email',
};

@Injectable()
export class UserQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async getUsers({
    searchLoginTerm,
    searchEmailTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetUsersArgs): Promise<Paginator<UserModel[]>> {
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
    qb.orderBy(`user.${sortColumn}`, sortDirection === SortDirections.asc ? 'ASC' : 'DESC');

    const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
    const [entities, totalCount] = await qb.skip(skipValue).take(pageSize).getManyAndCount();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      page: pageNumber,
      pageSize,
      totalCount,
      pagesCount,
      items: entities.map(toDomain),
    };
  }

  async findUserById(id: string): Promise<UserModel | null> {
    const entity = await this.usersRepository.findOne({ where: { id } });
    return entity ? toDomain(entity) : null;
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
