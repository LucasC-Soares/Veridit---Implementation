export type CaptureStatus =
  'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export class ContentRecord {
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly title: string,
    readonly siteUrl: string,
    public status: CaptureStatus = 'PENDING',
    public details: Record<string, unknown> | null = null,
    readonly createdAt = new Date(),
  ) {}
}
