import { Controller, Get, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { MembershipService } from './membership.service';

@UseGuards(AuthGuard)
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('me')
  getStatus(@CurrentUser() user: AuthUser) {
    return this.membershipService.getStatus(user.id);
  }

  @Post('mock-upgrade')
  mockUpgrade(@CurrentUser() user: AuthUser) {
    return this.membershipService.upgradeToMember(user.id);
  }
}
