import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dtos/access.dto';
import { RegisterResponseDto } from '../dtos/access-response.dto';
import { AccessService } from '../services/access.service';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly service: AccessService) {}

  async execute(input: RegisterDto): Promise<RegisterResponseDto> {
    const user = await this.service.register(input);
    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      message: 'Usuário cadastrado com sucesso.',
    };
  }
}
