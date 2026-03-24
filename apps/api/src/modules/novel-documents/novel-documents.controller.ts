import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { NovelDocumentsService } from './novel-documents.service';

class UpdateNovelDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

@UseGuards(AuthGuard)
@Controller('novels/:novelId/documents')
export class NovelDocumentsController {
  constructor(private readonly novelDocumentsService: NovelDocumentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('novelId') novelId: string) {
    return this.novelDocumentsService.list(user.id, novelId);
  }

  @Patch(':documentId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
    @Param('documentId') documentId: string,
    @Body() body: UpdateNovelDocumentDto,
  ) {
    return this.novelDocumentsService.update(
      user.id,
      novelId,
      documentId,
      body,
    );
  }
}
