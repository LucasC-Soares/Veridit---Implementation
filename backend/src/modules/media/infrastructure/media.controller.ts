import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../../access/infrastructure/guards/access-token.guard';
import { MediaService } from '../application/media.service';

@ApiTags('Mídia')
@Controller('media')
@UseGuards(AccessTokenGuard)
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('records/:id/capture')
  capture(
    @Param('id', ParseIntPipe) recordId: number,
    @Body('siteUrl') siteUrl: string,
  ) {
    return this.media.capturePage(recordId, siteUrl);
  }
}
