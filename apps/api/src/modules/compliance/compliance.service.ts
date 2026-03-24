import { Injectable } from '@nestjs/common';

import { SENSITIVE_WORDS } from './sensitive-words';

export type ScanFinding = {
  word: string;
  start: number;
  end: number;
  suggestion: string;
};

@Injectable()
export class ComplianceService {
  scan(content: string): { findings: ScanFinding[] } {
    const findings: ScanFinding[] = [];

    for (const word of SENSITIVE_WORDS) {
      let cursor = content.indexOf(word);
      while (cursor !== -1) {
        findings.push({
          word,
          start: cursor,
          end: cursor + word.length,
          suggestion: '*'.repeat(word.length),
        });
        cursor = content.indexOf(word, cursor + word.length);
      }
    }

    return { findings };
  }
}
