import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lookup, resolve4 } from 'dns';
import { join } from 'path';
import * as tls from 'tls';

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;
const SMTP_ALT_IPV4_HOSTS = [
  'alt1.gmail-smtp-in.l.google.com',
  'alt2.gmail-smtp-in.l.google.com',
  'alt3.gmail-smtp-in.l.google.com',
];

function tryResolveIpv4(host: string): Promise<string | null> {
  return new Promise((resolve) => {
    resolve4(host, (resolveError, addresses) => {
      if (!resolveError && addresses.length > 0) {
        resolve(addresses[0]);
        return;
      }

      lookup(host, { family: 4 }, (lookupError, address) => {
        resolve(lookupError ? null : address);
      });
    });
  });
}

async function resolveSmtpIpv4(): Promise<string> {
  const primaryAddress = await tryResolveIpv4(SMTP_HOST);
  if (primaryAddress) {
    return primaryAddress;
  }

  for (const altHost of SMTP_ALT_IPV4_HOSTS) {
    const altAddress = await tryResolveIpv4(altHost);
    if (altAddress) {
      return altAddress;
    }
  }

  throw new Error(`Failed to resolve IPv4 address for ${SMTP_HOST}`);
}

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private user = this.configService.get<string>('NODEMAILER_USER_TRANSPORT');
  private pass = this.configService.get<string>('NODEMAILER_PASSWORD_TRANSPORT');

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        ignoreTLS: true,
        secure: true,
        connectionTimeout: 15_000,
        auth: {
          user: this.user,
          pass: this.pass,
        },
        // smtp.gmail.com часто резолвится только в AAAA; IPv6 у провайдера может не работать.
        getSocket(_options, callback) {
          void resolveSmtpIpv4()
            .then((address) => {
              const socket = tls.connect({
                host: address,
                port: SMTP_PORT,
                servername: SMTP_HOST,
              });

              callback(null, { connection: socket, secured: true });
            })
            .catch((error: Error) => {
              callback(error);
            });
        },
      },
      defaults: {
        from: 'Alex-4717 it-incubator APP',
      },
      preview: false,
      template: {
        dir: join(__dirname, '../../modules/email/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
