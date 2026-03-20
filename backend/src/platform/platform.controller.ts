import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('platform')
@Controller('platform')
export class PlatformController {
  @Get()
  health() { return { status: 'ok' }; }
}
