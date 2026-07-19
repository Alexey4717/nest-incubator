import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { UserModel } from '../models/user.model';
import { UserEntity } from './user.entity';
import { toDomain, toOrm } from './user.mapper';

type UpdateUserConfirmationCodeInputType = {
  userId: string;
  newCode: string;
};

type ChangeUserPasswordArgs = {
  userId: string;
  passwordHash: string;
};

type SetUserRecoveryDataInputType = {
  userId: string;
  recoveryCode: string;
  recoveryExpiration: Date;
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(newUser: UserModel): Promise<UserModel> {
    try {
      const entity = toOrm(newUser);
      const saved = await this.usersRepository.save(entity);
      return toDomain(saved);
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
          throw new BadRequestException({
            message: errs,
            error: 'Bad Request',
          });
        }
      }
      console.log(`usersRepository.createUser error is occurred: ${error}`);
      throw error;
    }
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
      const result = await this.usersRepository.delete({ id });
      return (result.affected ?? 0) === 1;
    } catch (error) {
      console.log(`usersRepository.deleteUserById error is occurred: ${error}`);
      return false;
    }
  }

  async updateConfirmation(userId: string): Promise<boolean> {
    const result = await this.usersRepository.update({ id: userId }, { isConfirmed: true });
    return (result.affected ?? 0) === 1;
  }

  async changeUserPasswordAndNullifyRecoveryData({
    userId,
    passwordHash,
  }: ChangeUserPasswordArgs): Promise<boolean> {
    const result = await this.usersRepository.update(
      { id: userId },
      {
        passwordHash,
        recoveryCode: null,
        recoveryExpiration: null,
      },
    );
    return (result.affected ?? 0) === 1;
  }

  async setUserRecoveryData({
    userId,
    recoveryCode,
    recoveryExpiration,
  }: SetUserRecoveryDataInputType): Promise<boolean> {
    const result = await this.usersRepository.update(
      { id: userId },
      {
        recoveryCode,
        recoveryExpiration,
      },
    );
    return (result.affected ?? 0) === 1;
  }

  async updateUserConfirmationCode({
    userId,
    newCode,
  }: UpdateUserConfirmationCodeInputType): Promise<boolean> {
    const result = await this.usersRepository.update({ id: userId }, { confirmationCode: newCode });
    return (result.affected ?? 0) === 1;
  }
}
