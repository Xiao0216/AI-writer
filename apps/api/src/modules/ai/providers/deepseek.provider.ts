import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type {
  AiProvider,
  ProviderGenerateInput,
  ProviderGenerateOutput,
} from './provider.interface';

@Injectable()
export class DeepseekProvider implements AiProvider {
  readonly key = 'deepseek';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generate(
    input: ProviderGenerateInput,
  ): Promise<ProviderGenerateOutput> {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const baseUrl = this.configService.get<string>(
      'DEEPSEEK_BASE_URL',
      'https://api.deepseek.com',
    );
    const model = this.configService.get<string>(
      'DEEPSEEK_MODEL',
      'deepseek-chat',
    );

    if (!apiKey) {
      return {
        model: 'deepseek-mock-fallback',
        outputs: [`[DeepSeek 未配置]\n${input.prompt.slice(0, 500)}`],
      };
    }

    const response = await firstValueFrom(
      this.httpService.post<{
        choices?: Array<{ message?: { content?: string } }>;
      }>(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [{ role: 'user', content: input.prompt }],
          temperature: 0.8,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return {
      model,
      outputs: [response.data.choices?.[0]?.message?.content?.trim() || ''],
    };
  }
}
