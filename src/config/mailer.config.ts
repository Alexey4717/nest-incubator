import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private user = this.configService.get<string>('NODEMAILER_USER_TRANSPORT');
  private pass = this.configService.get<string>(
    'NODEMAILER_PASSWORD_TRANSPORT',
  );

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: this.user,
          pass: this.pass,
        },
      },
      defaults: {
        from: 'Alex-4717 it-incubator APP',
      },
      preview: false,
      template: {
        dir: join(__dirname, '../modules/email/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
