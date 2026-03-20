import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  @Get()
  health() { return { status: 'ok' }; }
}
