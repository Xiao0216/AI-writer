import { Module } from '@nestjs/common';

import { NovelDocumentsModule } from '../novel-documents/novel-documents.module';
import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';

@Module({
  imports: [NovelDocumentsModule],
  controllers: [NovelsController],
  providers: [NovelsService],
  exports: [NovelsService],
})
export class NovelsModule {}
