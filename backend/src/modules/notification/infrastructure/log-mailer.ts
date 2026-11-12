import { Injectable } from '@nestjs/common';
import { ObservabilityService } from '../../../shared/infrastructure/observability/observability.service';
import { Mailer, MailMessage } from '../domain/mailer.port';

@Injectable()
export class LogMailer implements Mailer {
  constructor(private readonly observability: ObservabilityService) {}

  send(message: MailMessage): Promise<void> {
    this.observability.log('notification.email.sent', {
      recipient: message.to,
      subject: message.subject,
    });
    return Promise.resolve();
  }
}
