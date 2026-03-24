import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { CharactersModule } from './modules/characters/characters.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { ExportModule } from './modules/export/export.module';
import { MembershipModule } from './modules/membership/membership.module';
import { NovelDocumentsModule } from './modules/novel-documents/novel-documents.module';
import { NovelsModule } from './modules/novels/novels.module';
import { OutlinesModule } from './modules/outlines/outlines.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NovelsModule,
    NovelDocumentsModule,
    ChaptersModule,
    OutlinesModule,
    CharactersModule,
    ComplianceModule,
    MembershipModule,
    PaymentsModule,
    ExportModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
