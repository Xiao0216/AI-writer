import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type CharacterInput = {
  name: string;
  identity?: string;
  personality?: string;
  appearance?: string;
  background?: string;
};

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, novelId: string) {
    await this.assertNovelOwner(userId, novelId);
    return this.prisma.character.findMany({
      where: { novelId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, novelId: string, input: CharacterInput) {
    await this.assertNovelOwner(userId, novelId);
    return this.prisma.character.create({
      data: {
        novelId,
        ...input,
      },
    });
  }

  async update(
    userId: string,
    novelId: string,
    characterId: string,
    input: CharacterInput,
  ) {
    await this.assertNovelOwner(userId, novelId);
    return this.prisma.character.update({
      where: { id: characterId },
      data: input,
    });
  }

  async remove(userId: string, novelId: string, characterId: string) {
    await this.assertNovelOwner(userId, novelId);
    await this.prisma.character.delete({ where: { id: characterId } });
    return { success: true };
  }

  private async assertNovelOwner(
    userId: string,
    novelId: string,
  ): Promise<void> {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });
    if (!novel) {
      throw new NotFoundException('作品不存在');
    }
    if (novel.userId !== userId) {
      throw new ForbiddenException('无权操作该作品');
    }
  }
}
