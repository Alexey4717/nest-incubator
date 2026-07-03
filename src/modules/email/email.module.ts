import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

import { EmailConfig } from './email.config';
import { EmailService } from './email.service';
import { MailerConfig } from './mailer.config';

@Module({
  imports: [MailerModule],
  providers: [EmailConfig, MailerConfig, EmailService],
  exports: [EmailConfig, MailerConfig, EmailService],
})
export class EmailModule {}
