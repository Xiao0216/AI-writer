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
export class QwenProvider implements AiProvider {
  readonly key = 'qwen';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generate(
    input: ProviderGenerateInput,
  ): Promise<ProviderGenerateOutput> {
    const apiKey = this.configService.get<string>('QWEN_API_KEY');
    const baseUrl = this.configService.get<string>(
      'QWEN_BASE_URL',
      'https://dashscope.aliyuncs.com/compatible-mode/v1',
    );
    const model = this.configService.get<string>('QWEN_MODEL', 'qwen-plus');

    if (!apiKey) {
      return {
        model: 'qwen-mock-fallback',
        outputs: [`[通义千问未配置]\n${input.prompt.slice(0, 500)}`],
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
