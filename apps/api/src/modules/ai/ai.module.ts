import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { ComplianceModule } from '../compliance/compliance.module';
import { MembershipModule } from '../membership/membership.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClaudeProvider } from './providers/claude.provider';
import { DeepseekProvider } from './providers/deepseek.provider';
import { QwenProvider } from './providers/qwen.provider';

@Module({
  imports: [ConfigModule, HttpModule, MembershipModule, ComplianceModule],
  controllers: [AiController],
  providers: [AiService, ClaudeProvider, QwenProvider, DeepseekProvider],
})
export class AiModule {}
