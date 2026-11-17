import { Global, Module } from '@nestjs/common';
import { MAILER } from './domain/mailer.port';
import { SmtpMailer } from './infrastructure/smtp-mailer';

@Global()
@Module({
  providers: [{ provide: MAILER, useClass: SmtpMailer }],
  exports: [MAILER],
})
export class NotificationModule {}
