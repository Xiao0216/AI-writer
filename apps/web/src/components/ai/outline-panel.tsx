import { Sparkles } from "lucide-react";

import type { Outline } from "@/lib/types";

export function OutlinePanel({ outlines }: { outlines: Outline[] }) {
  return (
    <section className="control-panel rounded-[2rem] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(201,143,74,0.14)] text-[var(--accent-soft)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="meta-kicker">Outline Room</p>
          <h3 className="panel-title text-xl font-semibold">大纲版本</h3>
          <p className="text-sm text-[var(--ink-soft)]">在生成正文前，先锁定一本书当前的推进版本。</p>
        </div>
      </div>
      <div className="space-y-3">
        {outlines.length > 0 ? (
          outlines.map((outline) => (
            <article key={outline.id} className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Version {outline.version}
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-700">{outline.content}</p>
            </article>
          ))
        ) : (
          <p className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] px-4 py-5 text-sm text-[var(--ink-soft)]">
            还没有保存的大纲版本，可以在写作页用 AI 直接生成。
          </p>
        )}
      </div>
    </section>
  );
}
