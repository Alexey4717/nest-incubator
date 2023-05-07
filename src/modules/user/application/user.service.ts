import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { CreateUserInsertToDBModel } from '../models/CreateUserInsertToDBModel';
import { GetUserOutputModelFromMongoDB } from '../models/GetUserOutputModel';
import { UserRepository } from '../infrastructure/user.repository';
import { UserQueryRepository } from '../infrastructure/user-query.repository';
import { randomUUID } from 'crypto';
// import { EmailManager } from '../../email/email.manager';

type CreateUserInputModel = {
  login: string;
  password: string;
  email: string;
};

type ChangeUserPasswordInputType = {
  recoveryCode: string;
  newPassword: string;
};

type CheckCredentialsInputArgs = {
  loginOrEmail: string;
  password: string;
};

type CreateUserInputType = CreateUserInputModel & {
  isConfirmed: boolean;
};

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userQueryRepository: UserQueryRepository, // private emailManager: EmailManager,
  ) {}

  async createUser({
    login,
    email,
    password,
  }: CreateUserInputModel): Promise<GetUserOutputModelFromMongoDB> {
    const newUser = await this._getNewUser({
      login,
      email,
      password,
      isConfirmed: true,
    });
    return await this.userRepository.createUser(newUser);
  }

  // async createUserAndSendConfirmationMessage({
  //   login,
  //   email,
  //   password,
  // }: CreateUserInputModel): Promise<boolean> {
  //   const newUser = await this._getNewUser({
  //     login,
  //     email,
  //     password,
  //     isConfirmed: false,
  //   });
  //   const createdUser = await this.userRepository.createUser(newUser);
  //   try {
  //     await this.emailManager.sendEmailConfirmationMessage({
  //       user: createdUser,
  //     });
  //   } catch (error) {
  //     console.error(`authService.registerUser error is occurred: ${error}`);
  //     await this.userRepository.deleteUserById(createdUser.id);
  //     return false;
  //   }
  //   return Boolean(createdUser);
  // }
  //
  // async resendConfirmationMessage(email: string): Promise<boolean> {
  //   const foundUser = await this.userQueryRepository.findByLoginOrEmail(email);
  //   if (!foundUser) return false;
  //   const confirmationCode = uuidv4();
  //   return await this.emailManager.sendEmailConfirmationMessage({
  //     user: foundUser,
  //     confirmationCode,
  //   });
  // }
  //
  // async recoveryPassword(email: string): Promise<boolean> {
  //   return await this.emailManager.sendPasswordRecoveryMessage(email);
  // }

  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.userQueryRepository.findByConfirmationCode(code);
    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.confirmationCode !== code ||
      user.emailConfirmation.expirationDate <= new Date()
    )
      return false;
    return await this.userRepository.updateConfirmation(user.id);
  }

  async changeUserPassword({
    recoveryCode,
    newPassword,
  }: ChangeUserPasswordInputType): Promise<boolean> {
    const user = await this.userQueryRepository.findUserByRecoveryCode(
      recoveryCode,
    );
    if (
      !user ||
      !user?.recoveryData ||
      user.recoveryData?.recoveryCode !== recoveryCode ||
      user.recoveryData?.expirationDate <= new Date()
    )
      return false;
    const passwordHash = await this._generateHash(newPassword);
    return await this.userRepository.changeUserPasswordAndNullifyRecoveryData({
      userId: user?.id,
      passwordHash,
    });
  }

  async deleteUserById(id: string): Promise<boolean> {
    return await this.userRepository.deleteUserById(id);
  }

  async checkCredentials({
    loginOrEmail,
    password,
  }: CheckCredentialsInputArgs): Promise<GetUserOutputModelFromMongoDB | null> {
    const foundUser = await this.userQueryRepository.findByLoginOrEmail(
      loginOrEmail,
    );
    if (!foundUser || !foundUser?.accountData?.passwordHash) return null;
    const passwordIsValid = await bcrypt.compare(
      password,
      foundUser.accountData.passwordHash,
    );
    if (!passwordIsValid) return null;
    return foundUser;
  }

  async _generateHash(password: string) {
    const passwordSalt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, passwordSalt);
  }

  // TODO dto
  async _getNewUser({
    login,
    email,
    password,
    isConfirmed,
  }: CreateUserInputType): Promise<CreateUserInsertToDBModel> {
    const passwordHash = await this._generateHash(password);
    return {
      id: randomUUID(),
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(), // generate unique id
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed,
      },
      recoveryData: null,
    };
  }
}
