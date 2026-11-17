import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type LogContext = Record<string, string | number | boolean | undefined>;

@Injectable()
export class ObservabilityService {
  private readonly startedAt = Date.now();

  correlationId(): string {
    return randomUUID();
  }

  log(message: string, context: LogContext = {}): void {
    this.write('info', message, context);
  }

  error(message: string, context: LogContext = {}): void {
    this.write('error', message, context);
  }

  metrics(): Record<string, number> {
    return {
      uptime_seconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  private write(level: 'info' | 'error', message: string, context: LogContext) {
    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    });
    (level === 'error' ? console.error : console.log)(line);
  }
}
