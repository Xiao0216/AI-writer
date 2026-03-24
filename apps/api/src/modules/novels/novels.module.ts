import { Module } from '@nestjs/common';

import { NovelsController } from './novels.controller';
import { NovelsService } from './novels.service';

@Module({
  controllers: [NovelsController],
  providers: [NovelsService],
  exports: [NovelsService],
})
export class NovelsModule {}
