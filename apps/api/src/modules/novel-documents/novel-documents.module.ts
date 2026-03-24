import { Module } from '@nestjs/common';

import { NovelDocumentsController } from './novel-documents.controller';
import { NovelDocumentsService } from './novel-documents.service';

@Module({
  controllers: [NovelDocumentsController],
  providers: [NovelDocumentsService],
  exports: [NovelDocumentsService],
})
export class NovelDocumentsModule {}
