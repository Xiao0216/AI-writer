import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('style-engine')
@Controller('style-engine')
export class StyleEngineController {
  @Get()
  health() { return { status: 'ok' }; }
}
