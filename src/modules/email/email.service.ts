import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  private emailConfirmationUrl = this.configService.get<string>('MAIN_URL');

  async sendRegistrationEmail(
    email: string,
    login: string,
    confirmationCode: string,
  ) {
    // const result = await this.userRepository.updateUserConfirmationCode({
    //   userId: user?.id,
    //   newCode: confirmationCode,
    // });
    // if (!result) return false;

    const confirmUrl = `${this.emailConfirmationUrl}/registration-confirmation?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Registration confirmation',
      template: './registration',
      context: {
        name: login,
        confirmUrl,
      },
    });
  }

  async sendEmailWithNewConfirmationCode(
    email: string,
    login: string,
    confirmationCode: string,
  ) {
    // const result = await this.userRepository.updateUserConfirmationCode({
    //   userId: user?.id,
    //   newCode: confirmationCode,
    // });
    // if (!result) return false;

    const confirmUrl = `${this.emailConfirmationUrl}/registration-confirmation?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Resending registration confirmation',
      template: './email-resending',
      context: {
        name: login,
        confirmUrl,
      },
    });
  }

  async sendPasswordRecoveryCode(
    email: string,
    login: string,
    recoveryCode: string,
  ) {
    // const foundUser = await this.userQueryRepository.findByLoginOrEmail(email);
    // // Even if current email is not registered (for prevent user's email detection)
    // if (!foundUser) return true;
    //
    // const recoveryData = {
    //   recoveryCode: uuidv4(),
    //   expirationDate: add(new Date(), { days: 1 }),
    // };
    //
    // const result = await this.userRepository.setUserRecoveryData({
    //   userId: foundUser?.id,
    //   recoveryData,
    // });
    // // Even if current email is not registered (for prevent user's email detection)
    // if (!result) return true;

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
