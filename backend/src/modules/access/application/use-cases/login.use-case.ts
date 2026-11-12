import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dtos/access.dto';
import { LoginResponseDto } from '../dtos/access-response.dto';
import { AccessService } from '../services/access.service';

@Injectable()
export class LoginUseCase {
  constructor(private readonly service: AccessService) {}

  async execute(input: LoginDto): Promise<LoginResponseDto> {
    return {
      success: true,
      data: await this.service.login(input.email, input.password),
      message: 'Login realizado com sucesso.',
    };
  }
}
