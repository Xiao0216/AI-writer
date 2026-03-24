"use client";

import type { GenerationOutput } from "@/lib/types";

export function GenerationResult({
  output,
  index,
  onInsert,
  onReplace,
  onSaveAsOutline,
}: {
  output: GenerationOutput;
  index: number;
  onInsert: (content: string) => void;
  onReplace: (content: string) => void;
  onSaveAsOutline: (content: string) => void;
}) {
  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-lg font-semibold">候选版本 {index + 1}</h4>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700"
            onClick={() => onInsert(output.content)}
          >
            插入文末
          </button>
          <button
            type="button"
            className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700"
            onClick={() => onReplace(output.content)}
          >
            替换正文
          </button>
          <button
            type="button"
            className="rounded-full bg-amber-200 px-3 py-2 text-xs font-medium text-amber-950"
            onClick={() => onSaveAsOutline(output.content)}
          >
            存为大纲
          </button>
        </div>
      </div>
      <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-stone-50 p-4 font-sans text-sm leading-7 text-stone-700">
        {output.content}
      </pre>
      {output.findings.length > 0 ? (
        <p className="mt-3 text-xs text-rose-600">
          检测到敏感词：{output.findings.map((item) => item.word).join("、")}
        </p>
      ) : null}
    </article>
  );
}
