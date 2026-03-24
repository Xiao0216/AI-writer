import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';

import { AuthGuard } from '../../common/guards/auth.guard';
import { ComplianceService } from './compliance.service';

class ScanDto {
  @IsString()
  content!: string;
}

@UseGuards(AuthGuard)
@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('scan')
  scan(@Body() body: ScanDto) {
    return this.complianceService.scan(body.content);
  }
}
