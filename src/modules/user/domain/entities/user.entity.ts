import { randomUUID } from 'crypto';
import { add } from 'date-fns';

import { DomainExceptionCode } from '@/core/errors/domain-exception-code.enum';
import { DomainException } from '@/core/errors/domain.exception';
import { generatePublicId } from '@/core/utils/public-id.generator';

import { UserOrmEntity } from '../../infrastructure/user.orm-entity';

export type UserCreateProps = {
  login: string;
  email: string;
  passwordHash: string;
  isConfirmed: boolean;
};

export type UserDb = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  confirmationCode: string | null;
  confirmationExpiration: Date | null;
  isConfirmed: boolean;
  recoveryCode: string | null;
  recoveryExpiration: Date | null;
};

export type UserRecoveryData = {
  recoveryCode: string;
  recoveryExpiration: Date;
};

export class UserEntity {
  private constructor(private data: UserDb) {}

  static create(props: UserCreateProps): UserEntity {
    return new UserEntity({
      id: generatePublicId(),
      login: props.login,
      email: props.email,
      passwordHash: props.passwordHash,
      createdAt: new Date(),
      confirmationCode: randomUUID(),
      confirmationExpiration: add(new Date(), { hours: 1 }),
      isConfirmed: props.isConfirmed,
      recoveryCode: null,
      recoveryExpiration: null,
    });
  }

  static reconstitute(raw: UserOrmEntity | UserDb): UserEntity {
    return new UserEntity({
      id: 'publicId' in raw ? raw.publicId : raw.id,
      login: raw.login,
      email: raw.email,
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt : new Date(raw.createdAt),
      confirmationCode: raw.confirmationCode,
      confirmationExpiration: raw.confirmationExpiration,
      isConfirmed: raw.isConfirmed,
      recoveryCode: raw.recoveryCode,
      recoveryExpiration: raw.recoveryExpiration,
    });
  }

  get id(): string {
    return this.data.id;
  }

  get login(): string {
    return this.data.login;
  }

  get email(): string {
    return this.data.email;
  }

  get confirmationCode(): string | null {
    return this.data.confirmationCode;
  }

  toDb(): UserDb {
    return { ...this.data };
  }

  isEmailConfirmed(): boolean {
    return this.data.isConfirmed;
  }

  assertNotConfirmed(): void {
    if (this.isEmailConfirmed()) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'email already confirmed', field: 'email' },
      ]);
    }
  }

  confirmEmail(code: string): void {
    if (this.isEmailConfirmed()) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }
    if (
      this.data.confirmationCode !== code ||
      !this.data.confirmationExpiration ||
      this.data.confirmationExpiration <= new Date()
    ) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Confirmation code incorrect', field: 'code' },
      ]);
    }
    this.data = { ...this.data, isConfirmed: true };
  }

  validateRecoveryCode(recoveryCode: string): void {
    if (
      !this.data.recoveryCode ||
      this.data.recoveryCode !== recoveryCode ||
      !this.data.recoveryExpiration ||
      this.data.recoveryExpiration <= new Date()
    ) {
      throw new DomainException(DomainExceptionCode.BadRequest, [
        { message: 'Invalid recovery code', field: 'recoveryCode' },
      ]);
    }
  }

  changePassword(passwordHash: string): void {
    this.data = {
      ...this.data,
      passwordHash,
      recoveryCode: null,
      recoveryExpiration: null,
    };
  }

  setRecoveryData(recoveryData: UserRecoveryData): void {
    this.data = {
      ...this.data,
      recoveryCode: recoveryData.recoveryCode,
      recoveryExpiration: recoveryData.recoveryExpiration,
    };
  }

  updateConfirmationCode(newCode: string): void {
    this.data = {
      ...this.data,
      confirmationCode: newCode,
      confirmationExpiration: add(new Date(), { hours: 1 }),
    };
  }
}
