import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../access/infrastructure/guards/access-token.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../../access/infrastructure/decorators/current-user.decorator';
import { PurchaseCreditsDto } from '../../application/dtos/credit.dto';
import { ListCreditPackagesUseCase } from '../../application/use-cases/list-credit-packages.use-case';
import { CreateCreditPurchaseUseCase } from '../../application/use-cases/create-credit-purchase.use-case';

@ApiTags('Créditos')
@Controller('credits')
export class CreditsController {
  constructor(
    private readonly listCreditPackagesUseCase: ListCreditPackagesUseCase,
    private readonly createCreditPurchaseUseCase: CreateCreditPurchaseUseCase,
  ) {}

  @Get('packages')
  packages() {
    return this.listCreditPackagesUseCase.execute();
  }

  @Post('purchases')
  @UseGuards(AccessTokenGuard)
  purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PurchaseCreditsDto,
  ) {
    return this.createCreditPurchaseUseCase.execute(user.id, dto);
  }
}
