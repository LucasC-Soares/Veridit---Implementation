import { IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateCaptureDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title!: string;

  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  siteUrl!: string;
}
