import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('studio')
@Controller('studio')
export class StudioController {
  @Get()
  health() { return { status: 'ok' }; }
}
