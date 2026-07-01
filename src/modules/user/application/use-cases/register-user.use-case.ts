import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { UserRepository } from '../../infrastructure/user.repository.mongodb';
import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import { UserFactoryService } from '../services/user-factory.service';

type RegisterUserInput = {
  login: string;
  email: string;
  password: string;
};

@Injectable()
export class RegisterUserUseCase implements IUseCase<
  RegisterUserInput,
  GetUserOutputModelFromMongoDB
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFactory: UserFactoryService,
  ) {}

  async execute(input: RegisterUserInput): Promise<GetUserOutputModelFromMongoDB> {
    const { login, email, password } = input;
    const newUser = await this.userFactory.createNewUser({
      login,
      email,
      password,
      isConfirmed: false,
    });

    return this.userRepository.createUser({ ...newUser });
  }
}
