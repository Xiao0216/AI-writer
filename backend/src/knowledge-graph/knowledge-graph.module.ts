import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeGraphController } from './knowledge-graph.controller';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { Character, WorldSetting, TimelineEvent, Foreshadowing } from './entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Character, WorldSetting, TimelineEvent, Foreshadowing])],
  controllers: [KnowledgeGraphController],
  providers: [KnowledgeGraphService],
  exports: [KnowledgeGraphService],
})
export class KnowledgeGraphModule {}
