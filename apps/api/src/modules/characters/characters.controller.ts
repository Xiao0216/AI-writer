import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { CharactersService } from './characters.service';

class CharacterDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  identity?: string;

  @IsOptional()
  @IsString()
  personality?: string;

  @IsOptional()
  @IsString()
  appearance?: string;

  @IsOptional()
  @IsString()
  background?: string;
}

@UseGuards(AuthGuard)
@Controller('novels/:novelId/characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('novelId') novelId: string) {
    return this.charactersService.list(user.id, novelId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Body() body: CharacterDto,
  ) {
    return this.charactersService.create(user.id, novelId, body);
  }

  @Patch(':characterId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('characterId') characterId: string,
    @Body() body: CharacterDto,
  ) {
    return this.charactersService.update(user.id, novelId, characterId, body);
  }

  @Delete(':characterId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('characterId') characterId: string,
  ) {
    return this.charactersService.remove(user.id, novelId, characterId);
  }
}
