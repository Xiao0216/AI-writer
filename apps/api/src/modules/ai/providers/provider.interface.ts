import type { GenerationType } from '@prisma/client';

export type ProviderGenerateInput = {
  type: GenerationType;
  prompt: string;
  title?: string;
  genre?: string;
  instruction?: string;
};

export type ProviderGenerateOutput = {
  model: string;
  outputs: string[];
};

export interface AiProvider {
  readonly key: string;
  generate(input: ProviderGenerateInput): Promise<ProviderGenerateOutput>;
}
