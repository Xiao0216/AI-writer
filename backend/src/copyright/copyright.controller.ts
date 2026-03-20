import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('copyright')
@Controller('copyright')
export class CopyrightController {
  @Get()
  health() { return { status: 'ok' }; }
}
