import { Module } from '@nestjs/common';

import { EmailConfig } from './email.config';
import { EmailService } from './email.service';
import { MailerConfig } from './mailer.config';

@Module({
  providers: [EmailConfig, MailerConfig, EmailService],
  exports: [EmailConfig, MailerConfig, EmailService],
})
export class EmailModule {}
