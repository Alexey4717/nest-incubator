import { Injectable } from '@nestjs/common';

import { EmailAdapter } from '../adapters/email.adapter';

type SendEmailConfirmationMessageInputType = {
  email: string;
  subject: string;
  message: string;
};

@Injectable()
export class EmailService {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationMessage({
    email,
    subject,
    message,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    return await this.emailAdapter.sendEmail({ email, subject, message });
  }

  async sendPasswordRecoveryMessage({
    email,
    subject,
    message,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    return await this.emailAdapter.sendEmail({ email, subject, message });
  }
}
