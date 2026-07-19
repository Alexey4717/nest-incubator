import { INestApplication } from '@nestjs/common';
import { SuperAgentTest } from 'supertest';

import {
  confirmRegistration,
  createSupertestAgent,
  loginAndGetToken,
  loginSameUserOnTwoDevices,
  loginWithAgent,
  LoginWithAgentResult,
  recoverPassword,
  registerUser,
  RegisterUserInput,
  setNewPassword,
} from './auth.helper';
import { EmailServiceMock } from './init-settings';

export class AuthTestManager {
  constructor(
    private readonly app: INestApplication,
    private readonly emailMock: EmailServiceMock,
  ) {}

  registerUser(input: RegisterUserInput): Promise<void> {
    return registerUser(this.app, input);
  }

  confirmRegistration(): Promise<void> {
    return confirmRegistration(this.app, this.emailMock);
  }

  recoverPassword(email: string): Promise<void> {
    return recoverPassword(this.app, email);
  }

  setNewPassword(newPassword: string): Promise<void> {
    return setNewPassword(this.app, this.emailMock, newPassword);
  }

  loginAndGetToken(loginOrEmail: string, password: string): Promise<string> {
    return loginAndGetToken(this.app, loginOrEmail, password);
  }

  createSupertestAgent(): SuperAgentTest {
    return createSupertestAgent(this.app);
  }

  loginWithAgent(
    agent: SuperAgentTest,
    loginOrEmail: string,
    password: string,
    options?: { userAgent?: string },
  ): Promise<LoginWithAgentResult> {
    return loginWithAgent(agent, loginOrEmail, password, options);
  }

  loginSameUserOnTwoDevices(
    loginOrEmail: string,
    password: string,
    userAgents: [string, string],
  ): Promise<{ agent1: SuperAgentTest; agent2: SuperAgentTest }> {
    return loginSameUserOnTwoDevices(this.app, loginOrEmail, password, userAgents);
  }
}
