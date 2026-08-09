import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';

import { UserEntity } from '../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';
import { UserPersistenceMapper } from './user.persistence-mapper';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly usersRepository: Repository<UserOrmEntity>,
  ) {}

  async createUser(newUser: UserEntity): Promise<UserEntity> {
    try {
      const entity = UserPersistenceMapper.toPersistence(newUser);
      const saved = await this.usersRepository.save(entity);
      return UserPersistenceMapper.toDomain(saved);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError as {
          code?: string;
          detail?: string;
          constraint?: string;
        };
        if (pgError?.code === '23505') {
          const errs = this.uniqueViolationToErrorsMessages(
            pgError.detail ?? '',
            pgError.constraint ?? '',
          );
          throw new DomainException(DomainExceptionCode.BadRequest, errs);
        }
      }
      console.log(`usersRepository.createUser error is occurred: ${error}`);
      throw error;
    }
  }

  async save(user: UserEntity): Promise<boolean> {
    const data = user.toDb();
    const result = await this.usersRepository.update(
      { publicId: data.id },
      {
        login: data.login,
        email: data.email,
        passwordHash: data.passwordHash,
        confirmationCode: data.confirmationCode,
        confirmationExpiration: data.confirmationExpiration,
        isConfirmed: data.isConfirmed,
        recoveryCode: data.recoveryCode,
        recoveryExpiration: data.recoveryExpiration,
      },
    );
    return (result.affected ?? 0) === 1;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const entity = await this.usersRepository.findOne({ where: { publicId: id } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async findByConfirmationCode(code: string): Promise<UserEntity | null> {
    const entity = await this.usersRepository.findOne({ where: { confirmationCode: code } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async findByRecoveryCode(code: string): Promise<UserEntity | null> {
    const entity = await this.usersRepository.findOne({ where: { recoveryCode: code } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  private uniqueViolationToErrorsMessages(
    detail: string,
    constraint: string,
  ): { message: string; field: string }[] {
    const out: { message: string; field: string }[] = [];
    const normalized = `${detail} ${constraint}`.toLowerCase();

    if (normalized.includes('login')) {
      out.push({
        message: 'This login already exists',
        field: 'login',
      });
    }
    if (normalized.includes('email')) {
      out.push({
        message: 'This email already exists',
        field: 'email',
      });
    }
    if (normalized.includes('recovery')) {
      out.push({
        message: 'Recovery data conflict',
        field: 'recoveryCode',
      });
    }
    if (out.length === 0) {
      return [{ message: 'Duplicate key constraint violated', field: 'login' }];
    }
    return out;
  }

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const result = await this.usersRepository.delete({ publicId: id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`usersRepository.deleteUserById error is occurred: ${error}`);
      return false;
    }
  }
}
