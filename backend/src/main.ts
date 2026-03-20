import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // API 版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('文枢AI API')
    .setDescription('文枢AI - 小说全流程创作平台 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证授权')
    .addTag('users', '用户管理')
    .addTag('works', '作品管理')
    .addTag('chapters', '章节管理')
    .addTag('knowledge-graph', '知识图谱')
    .addTag('plot-engine', '剧情管控')
    .addTag('ai-generation', 'AI生成')
    .addTag('style-engine', '文风引擎')
    .addTag('compliance', '合规检测')
    .addTag('copyright', '版权服务')
    .addTag('platform', '平台适配')
    .addTag('membership', '会员系统')
    .addTag('studio', '工作室管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 文枢AI后端服务已启动: http://localhost:${port}`);
  console.log(`📚 API文档地址: http://localhost:${port}/api/docs`);
}

bootstrap();
