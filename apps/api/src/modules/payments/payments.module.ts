import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { MembershipModule } from '../membership/membership.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [HttpModule, MembershipModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
