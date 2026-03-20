import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlotEngineController } from './plot-engine.controller';
import { PlotEngineService } from './plot-engine.service';
import { PlotNode, PlotOutline } from './entities/plot-node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlotNode, PlotOutline])],
  controllers: [PlotEngineController],
  providers: [PlotEngineService],
  exports: [PlotEngineService],
})
export class PlotEngineModule {}
