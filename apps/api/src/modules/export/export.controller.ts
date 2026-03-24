import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { ExportService } from './export.service';

@UseGuards(AuthGuard)
@Controller('novels/:novelId/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  exportNovel(
    @CurrentUser() user: AuthUser,
    @Param('novelId') novelId: string,
  ) {
    return this.exportService.exportNovel(user.id, novelId);
  }
}
