"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";

import type { Character, GenerationResponse, Outline } from "@/lib/types";

import { GenerationForm } from "./generation-form";
import { GenerationResult } from "./generation-result";

type GenerationType =
  | "OUTLINE"
  | "OPENING"
  | "CONTINUATION"
  | "INSPIRATION"
  | "EXPAND"
  | "SHORTEN"
  | "REWRITE";

export function GenerationDrawer({
  outlines,
  characters,
  result,
  onGenerate,
  onInsert,
  onReplace,
  onSaveAsOutline,
}: {
  outlines: Outline[];
  characters: Character[];
  result: GenerationResponse | null;
  onGenerate: (payload: {
    type: GenerationType;
    outlineId?: string;
    characterIds: string[];
    instruction?: string;
  }) => Promise<void>;
  onInsert: (content: string) => void;
  onReplace: (content: string) => void;
  onSaveAsOutline: (content: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <aside className="control-panel space-y-5 rounded-[2rem] p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(201,143,74,0.14)] text-[var(--accent-soft)]">
          <WandSparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="meta-kicker">Chapter Control</p>
          <h3 className="panel-title text-2xl font-semibold">AI 辅助创作</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
            自动注入大纲、角色设定与当前章节上下文，不做脱离项目的随意续写。
          </p>
        </div>
      </div>

      <GenerationForm
        outlines={outlines}
        characters={characters}
        onSubmit={async (payload) => {
          setBusy(true);
          try {
            await onGenerate(payload);
          } finally {
            setBusy(false);
          }
        }}
      />

      {busy ? (
        <div className="rounded-2xl bg-[rgba(255,252,247,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
          正在生成，请稍候...
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[rgba(255,252,247,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            当前模型：{result.model}，今日已用 {result.usage.usedToday} 次
          </div>
          {result.outputs.map((output, index) => (
            <GenerationResult
              key={`${result.model}-${index}`}
              output={output}
              index={index}
              onInsert={onInsert}
              onReplace={onReplace}
              onSaveAsOutline={onSaveAsOutline}
            />
          ))}
        </div>
      ) : null}
    </aside>
  );
}
