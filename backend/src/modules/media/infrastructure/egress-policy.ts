import { BadRequestException, Injectable } from '@nestjs/common';
import { EgressPolicy } from '../domain/egress-policy.port';

@Injectable()
export class PrivateNetworkEgressPolicy implements EgressPolicy {
  validate(value: string): void {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new BadRequestException('URL inválida.');
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new BadRequestException('Somente HTTP e HTTPS são permitidos.');
    }
    const host = url.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '::1' ||
      host.endsWith('.localhost') ||
      host.startsWith('10.') ||
      host.startsWith('127.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === '169.254.169.254'
    ) {
      throw new BadRequestException('A URL aponta para uma rede privada.');
    }
  }
}
