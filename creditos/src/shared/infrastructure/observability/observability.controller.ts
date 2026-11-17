import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ObservabilityService } from './observability.service';

@Controller()
export class ObservabilityController {
  constructor(private readonly observability: ObservabilityService) {}

  @Get('health')
  health() {
    return { status: 'ok', ...this.observability.metrics() };
  }

  @Get('metrics')
  metrics(@Res() response: Response): void {
    const metrics = this.observability.metrics();
    response.type('text/plain').send(
      Object.entries(metrics)
        .map(([name, value]) => `${name} ${value}`)
        .join('\n'),
    );
  }
}
