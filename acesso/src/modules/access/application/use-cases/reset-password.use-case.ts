import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from '../dtos/access.dto';
import { EmptyAccessResponseDto } from '../dtos/access-response.dto';
import { AccessService } from '../services/access.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly service: AccessService) {}

  async execute(input: ResetPasswordDto): Promise<EmptyAccessResponseDto> {
    await this.service.resetPassword(input.token, input.password);
    return {
      success: true,
      data: null,
      message: 'Senha alterada com sucesso.',
    };
  }
}
