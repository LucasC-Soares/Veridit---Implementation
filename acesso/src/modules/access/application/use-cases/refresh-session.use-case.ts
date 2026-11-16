import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshSessionDto } from '../dtos/access.dto';
import { LoginResponseDto } from '../dtos/access-response.dto';
import { AccessService } from '../services/access.service';

@Injectable()
export class RefreshSessionUseCase {
  constructor(private readonly service: AccessService) {}

  async execute(input: RefreshSessionDto): Promise<LoginResponseDto> {
    const session = await this.service.refresh(input.refreshToken);
    if (!session)
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    return {
      success: true,
      data: session,
      message: 'Sessão renovada com sucesso.',
    };
  }
}
