import type { MembershipType } from '@prisma/client';

export type AuthUser = {
  id: string;
  openid: string;
  nickname: string;
  membershipType: MembershipType;
  preferredGenre?: string | null;
  membershipExpireAt?: Date | null;
};
