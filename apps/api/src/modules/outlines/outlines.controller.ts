import {
  Body,
  Controller,
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
import { OutlinesService } from './outlines.service';

class UpsertOutlineDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  content!: string;
}

@UseGuards(AuthGuard)
@Controller('novels/:novelId/outlines')
export class OutlinesController {
  constructor(private readonly outlinesService: OutlinesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('novelId') novelId: string) {
    return this.outlinesService.list(user.id, novelId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Body() body: UpsertOutlineDto,
  ) {
    return this.outlinesService.create(user.id, novelId, body);
  }

  @Patch(':outlineId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('outlineId') outlineId: string,
    @Body() body: UpsertOutlineDto,
  ) {
    return this.outlinesService.update(user.id, novelId, outlineId, body);
  }
}
