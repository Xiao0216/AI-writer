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
export class ClaudeProvider implements AiProvider {
  readonly key = 'claude';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generate(
    input: ProviderGenerateInput,
  ): Promise<ProviderGenerateOutput> {
    const apiKey = this.configService.get<string>('CLAUDE_API_KEY');
    const baseUrl = this.configService.get<string>(
      'CLAUDE_BASE_URL',
      'https://api.anthropic.com',
    );
    const model = this.configService.get<string>(
      'CLAUDE_MODEL',
      'claude-3-5-sonnet-latest',
    );

    if (!apiKey) {
      return {
        model: 'claude-mock-fallback',
        outputs: [`[Claude 未配置]\n${input.prompt.slice(0, 500)}`],
      };
    }

    const response = await firstValueFrom(
      this.httpService.post<{
        content?: Array<{ type: string; text?: string }>;
      }>(
        `${baseUrl}/v1/messages`,
        {
          model,
          max_tokens: 1800,
          messages: [{ role: 'user', content: input.prompt }],
        },
        {
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        },
      ),
    );

    return {
      model,
      outputs: [
        response.data.content
          ?.map((block) => block.text || '')
          .join('\n')
          .trim() || '',
      ],
    };
  }
}
