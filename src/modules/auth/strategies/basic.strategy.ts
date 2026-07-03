import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { BasicStrategy as Strategy } from 'passport-http';

import { AuthConfig } from '../auth.config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private readonly authConfig: AuthConfig) {
    super({ passReqToCallback: true });
  }

  validate(req: Request, username: string, password: string): boolean {
    if (username === this.authConfig.SA_LOGIN && password === this.authConfig.SA_PASSWORD) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
