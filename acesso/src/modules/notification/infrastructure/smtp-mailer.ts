import { Injectable } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { Mailer, MailMessage } from '../domain/mailer.port';

@Injectable()
export class SmtpMailer implements Mailer {
  private readonly transporter: Transporter;

  constructor() {
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: process.env.SMTP_SECURE === 'true',
      ...(user && password ? { auth: { user, pass: password } } : {}),
    });
  }

  async send(message: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'no-reply@veridit.local',
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
