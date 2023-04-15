import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

import { UserRepository } from '../modules/user/infrastructure/user.repository';
import { UserQueryRepository } from '../modules/user/infrastructure/user-query.repository';
import { ConfigService } from '@nestjs/config';

type SendEmailInputType = {
  email: string;
  subject: string;
  message: string;
};

@Injectable()
export class EmailAdapter {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail({
    email,
    subject,
    message,
  }: SendEmailInputType): Promise<boolean> {
    try {
      const user = this.configService.get('NODEMAILER_USER_TRANSPORT');
      const pass = this.configService.get('NODEMAILER_PASSWORD_TRANSPORT');

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      await transport.sendMail({
        from: `Alexey <${user}>`,
        to: email,
        subject,
        html: message,
      });

      return true;
    } catch (error) {
      console.error(`emailAdapter.sendEmail error is occurred: ${error}`);
      return false;
    }
  }
}
