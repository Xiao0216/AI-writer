import { Module } from '@nestjs/common';

import { OutlinesController } from './outlines.controller';
import { OutlinesService } from './outlines.service';

@Module({
  controllers: [OutlinesController],
  providers: [OutlinesService],
  exports: [OutlinesService],
})
export class OutlinesModule {}
