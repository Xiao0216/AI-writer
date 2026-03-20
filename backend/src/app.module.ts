import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { WorksModule } from './works/works.module';
import { ChaptersModule } from './chapters/chapters.module';
import { KnowledgeGraphModule } from './knowledge-graph/knowledge-graph.module';
import { PlotEngineModule } from './plot-engine/plot-engine.module';
import { AiGenerationModule } from './ai-generation/ai-generation.module';
import { StyleEngineModule } from './style-engine/style-engine.module';
import { ComplianceModule } from './compliance/compliance.module';
import { CopyrightModule } from './copyright/copyright.module';
import { PlatformModule } from './platform/platform.module';
import { MembershipModule } from './membership/membership.module';
import { StudioModule } from './studio/studio.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'wenshu_ai',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
      charset: 'utf8mb4',
    }),
    AuthModule,
    UsersModule,
    WorksModule,
    ChaptersModule,
    KnowledgeGraphModule,
    PlotEngineModule,
    AiGenerationModule,
    StyleEngineModule,
    ComplianceModule,
    CopyrightModule,
    PlatformModule,
    MembershipModule,
    StudioModule,
  ],
})
export class AppModule {}
