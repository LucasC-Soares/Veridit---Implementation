import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../../access/infrastructure/guards/access-token.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../access/infrastructure/decorators/current-user.decorator';
import { CreateCaptureDto } from '../../application/dtos/capture.dto';
import { CaptureService } from '../../application/capture.service';

@ApiTags('Captura')
@Controller('captures')
@UseGuards(AccessTokenGuard)
export class CaptureController {
  constructor(private readonly captures: CaptureService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCaptureDto,
  ) {
    return this.captures.create(user.id, dto.title, dto.siteUrl);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.captures.list(user.id);
  }

  @Get(':id')
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.captures.get(user.id, id);
  }
}
