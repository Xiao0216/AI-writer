import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('${mod}')
@ApiBearerAuth()
@Controller('${mod}')
export class $(tr '[:lower:]' '[:upper:]' <<< ${mod:0:1})${mod:1}Controller {
  @Get()
  health() { return { status: 'ok', module: '${mod}' }; }
}
