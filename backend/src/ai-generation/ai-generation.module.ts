import { Module } from '@nestjs/common';
import { AiGenerationController } from './ai-generation.controller';
import { AiGenerationService } from './ai-generation.service';

@Module({
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
