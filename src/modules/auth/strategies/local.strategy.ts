import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { UserService } from '@/modules/user/application/user.service';

import { IAuthenticatedUserId } from '../models/authenticated-user.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({ usernameField: 'loginOrEmail', passwordField: 'password' });
  }

  async validate(loginOrEmail: string, password: string): Promise<IAuthenticatedUserId> {
    const user = await this.userService.checkCredentials({
      loginOrEmail,
      password,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id };
  }
}
