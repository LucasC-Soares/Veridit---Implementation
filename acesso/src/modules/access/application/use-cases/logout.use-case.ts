import { Injectable } from '@nestjs/common';
import { EmptyAccessResponseDto } from '../dtos/access-response.dto';
import { AccessService } from '../services/access.service';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly service: AccessService) {}

  async execute(
    refreshToken: string | undefined,
  ): Promise<EmptyAccessResponseDto> {
    if (refreshToken) await this.service.logout(refreshToken);
    return { success: true, data: null, message: 'Sessão encerrada.' };
  }
}
