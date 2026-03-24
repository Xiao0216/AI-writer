import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthUser } from '../../common/types/auth-user';
import { PaymentsService } from './payments.service';

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard)
  @Get('membership-plan')
  getMembershipPlan() {
    return this.paymentsService.getMembershipPlan();
  }

  @UseGuards(AuthGuard)
  @Post('orders/membership')
  createMembershipOrder(@CurrentUser() user: AuthUser) {
    return this.paymentsService.createMembershipOrder(user.id);
  }

  @UseGuards(AuthGuard)
  @Get('orders/:orderId')
  getOrder(@CurrentUser() user: AuthUser, @Param('orderId') orderId: string) {
    return this.paymentsService.getOrderForUser(user.id, orderId);
  }

  @HttpCode(200)
  @Post('wechat/notify')
  handleWechatNotify(
    @Req() request: RawBodyRequest,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    const rawBody =
      request.rawBody?.toString('utf8') ?? JSON.stringify(request.body);
    return this.paymentsService.handleWechatNotify(rawBody, headers);
  }
}
