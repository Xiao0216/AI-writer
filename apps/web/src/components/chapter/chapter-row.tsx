import Link from "next/link";
import { CheckCircle2, ChevronRight, FileClock, Target } from "lucide-react";

import type { Chapter } from "@/lib/types";

export function ChapterRow({
  novelId,
  chapter,
}: {
  novelId: string;
  chapter: Chapter;
}) {
  const completed = chapter.status === "COMPLETED";

  return (
    <Link
      href={`/novels/${novelId}/chapters/${chapter.id}`}
      className="group flex items-center justify-between gap-4 rounded-[1.7rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] px-5 py-4 transition hover:-translate-y-0.5 hover:border-[rgba(207,141,53,0.24)] hover:bg-[rgba(252,249,243,0.96)]"
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl ${
          completed
            ? "bg-[rgba(230,244,247,0.8)] text-[var(--accent-cyan)]"
            : "bg-[rgba(255,243,224,0.78)] text-[var(--accent-strong)]"
        }`}>
          {chapter.wordCount > 0 ? <Target className="h-4 w-4" /> : <FileClock className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium text-[var(--paper-ink)]">{chapter.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
            <span>{chapter.wordCount} 字</span>
            <span>序号 {chapter.sortOrder + 1}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.14em] uppercase ${
                completed
                  ? "bg-[rgba(230,244,247,0.8)] text-[var(--paper-ink)]"
                  : "bg-[rgba(255,243,224,0.78)] text-[var(--paper-ink)]"
              }`}
            >
              {completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {completed ? "已写回" : "待推进"}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-[var(--ink-soft)] transition group-hover:translate-x-0.5" />
    </Link>
  );
}
