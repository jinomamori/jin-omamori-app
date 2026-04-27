import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
