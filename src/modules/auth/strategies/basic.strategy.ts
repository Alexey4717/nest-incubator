import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { Request } from 'express';
import { basicConstants } from '../constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor() {
    super({ passReqToCallback: true });
  }

  validate(req: Request, username: string, password: string): boolean {
    if (
      username === basicConstants.userName &&
      password === basicConstants.password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  }
}
