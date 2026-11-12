import { Global, Module } from '@nestjs/common';
import { MAILER } from './domain/mailer.port';
import { LogMailer } from './infrastructure/log-mailer';

@Global()
@Module({
  providers: [{ provide: MAILER, useClass: LogMailer }],
  exports: [MAILER],
})
export class NotificationModule {}
