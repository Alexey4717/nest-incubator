import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { CreateUserDTO } from '../../dto/create-user.dto';
import { UserRepository } from '../../infrastructure/user.repository.mongodb';
import { GetUserOutputModelFromMongoDB } from '../../models/GetUserOutputModel';
import { UserFactoryService } from '../services/user-factory.service';

@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserDTO, GetUserOutputModelFromMongoDB> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFactory: UserFactoryService,
  ) {}

  async execute(input: CreateUserDTO): Promise<GetUserOutputModelFromMongoDB> {
    const { login, email, password } = input;
    const newUser = await this.userFactory.createNewUser({
      login,
      email,
      password,
      isConfirmed: true,
    });

    return this.userRepository.createUser({ ...newUser });
  }
}
