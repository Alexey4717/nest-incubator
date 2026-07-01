import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private emailConfirmationUrl = this.configService.get<string>('MAIN_URL');

  private async sendConfirmationEmail(
    email: string,
    login: string,
    confirmationCode: string,
    options: { subject: string; template: string },
  ) {
    const confirmUrl = `${this.emailConfirmationUrl}/registration-confirmation?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: options.subject,
      template: options.template,
      context: {
        name: login,
        confirmUrl,
      },
    });
  }

  async sendRegistrationEmail(email: string, login: string, confirmationCode: string) {
    await this.sendConfirmationEmail(email, login, confirmationCode, {
      subject: 'Registration confirmation',
      template: './registration',
    });
  }

  async sendEmailWithNewConfirmationCode(email: string, login: string, confirmationCode: string) {
    await this.sendConfirmationEmail(email, login, confirmationCode, {
      subject: 'Resending registration confirmation',
      template: './email-resending',
    });
  }

  async sendPasswordRecoveryCode(email: string, login: string, recoveryCode: string) {
    const recoveryUrl = `${this.emailConfirmationUrl}/password-recovery?recoveryCode=${recoveryCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password recovery',
      template: './password-recovery',
      context: {
        name: login,
        recoveryUrl,
      },
    });
  }
}
