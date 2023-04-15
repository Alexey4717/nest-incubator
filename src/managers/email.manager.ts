import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { Types } from 'mongoose';

import { GetUserOutputModelFromMongoDB } from '../modules/user/models/GetUserOutputModel';
import { UserRepository } from '../modules/user/infrastructure/user.repository';
import { UserQueryRepository } from '../modules/user/infrastructure/user-query.repository';
import { EmailService } from '../services/email.service';

type SendEmailConfirmationMessageInputType = {
  user: GetUserOutputModelFromMongoDB;
  confirmationCode?: string;
};

@Injectable()
export class EmailManager {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly emailService: EmailService,
  ) {}

  async sendPasswordRecoveryMessage(email: string): Promise<boolean> {
    const foundUser = await this.userQueryRepository.findByLoginOrEmail(email);
    // Even if current email is not registered (for prevent user's email detection)
    if (!foundUser) return true;

    const recoveryData = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), { days: 1 }),
    };

    const result = await this.userRepository.setUserRecoveryData({
      userId: new Types.ObjectId(foundUser._id),
      recoveryData,
    });
    // Even if current email is not registered (for prevent user's email detection)
    if (!result) return true;

    return await this.emailService.sendEmailConfirmationMessage({
      email,
      subject: 'Password recovery',
      message: `
                <h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                    <a href='${process.env.MAIN_URL}/password-recovery?recoveryCode=${recoveryData.recoveryCode}'>
                        recovery password
                    </a>
                </p>
            `,
    });
  }

  async sendEmailConfirmationMessage({
    user,
    confirmationCode,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    if (confirmationCode) {
      const result = await this.userRepository.updateUserConfirmationCode({
        userId: new Types.ObjectId(user._id),
        newCode: confirmationCode,
      });
      if (!result) return false;
    }

    return await this.emailService.sendPasswordRecoveryMessage({
      email: user.accountData.email,
      subject: 'Registration confirmation',
      message: `
                <p>To confirm registration please follow the link below:
                    <a href='${
                      process.env.MAIN_URL
                    }/confirm-registration?code=${
        confirmationCode || user.emailConfirmation.confirmationCode
      }'>
                        confirm registration
                    </a>
                </p>
            `,
    });
  }
}
