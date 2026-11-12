import { Injectable } from '@nestjs/common';
import { ForgotPasswordDto } from '../dtos/access.dto';
import { EmptyAccessResponseDto } from '../dtos/access-response.dto';
import { AccessService } from '../services/access.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(private readonly service: AccessService) {}

  async execute(input: ForgotPasswordDto): Promise<EmptyAccessResponseDto> {
    await this.service.forgotPassword(input.email);
    return {
      success: true,
      data: null,
      message:
        'Se o email estiver cadastrado, enviaremos instruções de recuperação.',
    };
  }
}
