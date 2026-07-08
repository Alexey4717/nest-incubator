import { Injectable } from '@nestjs/common';

import { IUseCase } from '@/shared/types/use-case';

import { CreateUserDTO } from '../../dto/create-user.dto';
import { UserRepository } from '../../infrastructure/user.repository';
import { UserModel } from '../../models/user.model';
import { UserFactoryService } from '../services/user-factory.service';

@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserDTO, UserModel> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userFactory: UserFactoryService,
  ) {}

  async execute(input: CreateUserDTO): Promise<UserModel> {
    const { login, email, password } = input;
    const newUser = await this.userFactory.createNewUser({
      login,
      email,
      password,
      isConfirmed: true,
    });

    return this.userRepository.createUser(newUser);
  }
}
