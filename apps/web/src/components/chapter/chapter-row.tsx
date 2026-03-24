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
  return (
    <Link
      href={`/novels/${novelId}/chapters/${chapter.id}`}
      className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-[rgba(48,35,24,0.1)] bg-[rgba(255,252,247,0.72)] px-5 py-4 transition hover:-translate-y-0.5 hover:border-[rgba(139,30,30,0.28)] hover:bg-[rgba(255,252,247,0.96)]"
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,30,30,0.08)] text-[var(--accent)]">
          {chapter.wordCount > 0 ? <Target className="h-4 w-4" /> : <FileClock className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium text-stone-950">{chapter.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
            <span>{chapter.wordCount} 字</span>
            <span>序号 {chapter.sortOrder + 1}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              chapter.status === "COMPLETED"
                ? "bg-[rgba(46,125,50,0.12)] text-[#2f6b2f]"
                : "bg-[rgba(139,30,30,0.08)] text-[var(--accent)]"
            }`}>
              {chapter.status === "COMPLETED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {chapter.status === "COMPLETED" ? "已写回" : "草稿中"}
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-stone-500" />
    </Link>
  );
}
