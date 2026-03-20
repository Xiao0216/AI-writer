import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('compliance')
@Controller('compliance')
export class ComplianceController {
  @Get()
  health() { return { status: 'ok' }; }
}
