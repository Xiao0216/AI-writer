import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiGenerationController } from './ai-generation.controller';
import { AiGenerationService } from './ai-generation.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}
