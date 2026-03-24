import Link from "next/link";
import { ArrowRight, Flame, LibraryBig, Radar } from "lucide-react";

import type { NovelSummary } from "@/lib/types";

export function NovelCard({ novel }: { novel: NovelSummary }) {
  const chapterCount = novel._count?.chapters ?? 0;
  const heat = chapterCount >= 8 ? "升温" : chapterCount >= 3 ? "成形" : "起稿中";
  const stageLabel =
    novel.stage === "ALIGNMENT"
      ? "立项对齐"
      : novel.stage === "OUTLINE_READY"
        ? "待开章节"
        : "章节推进";

  return (
    <Link
      href={`/novels/${novel.id}`}
      className="group control-panel paper-grid rounded-[2rem] p-6 transition hover:-translate-y-1.5 hover:border-[rgba(139,30,30,0.28)] hover:shadow-[0_28px_60px_rgba(54,34,25,0.12)]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-[rgba(201,143,74,0.16)] text-[var(--accent-soft)]">
          <LibraryBig className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-[rgba(48,35,24,0.1)] bg-[rgba(255,252,247,0.86)] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-[var(--ink-soft)] uppercase">
          {novel.genre}
        </span>
      </div>
      <p className="meta-kicker">Project Room</p>
      <h3 className="panel-title mt-3 text-[2rem] font-semibold leading-tight">{novel.title}</h3>
      <p className="mt-3 line-clamp-3 min-h-18 text-sm leading-7 text-[var(--ink-soft)]">
        {novel.synopsis || "还没有填写作品简介。"}
      </p>
      <div className="editorial-rule mt-6" />
      <div className="mt-5 grid gap-3 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
        <div className="rounded-2xl bg-[rgba(255,252,247,0.7)] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">字数</p>
          <p className="mt-2 font-serif text-xl text-stone-950">{novel.totalWordCount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-[rgba(255,252,247,0.7)] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">章节</p>
          <p className="mt-2 font-serif text-xl text-stone-950">{chapterCount}</p>
        </div>
        <div className="rounded-2xl bg-[rgba(255,252,247,0.7)] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">热度</p>
          <p className="mt-2 inline-flex items-center gap-2 font-medium text-stone-950">
            {heat === "升温" ? <Flame className="h-4 w-4 text-[var(--accent)]" /> : <Radar className="h-4 w-4 text-[var(--accent-soft)]" />}
            {heat}
          </p>
        </div>
      </div>
      <div className="mt-4 inline-flex rounded-full bg-[rgba(139,30,30,0.08)] px-3 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">
        {stageLabel}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">下一步</p>
          <p className="mt-1 text-[var(--ink-soft)]">{novel.nextAction || "进入项目作战页，检查章节推进与控制文件。"}</p>
          {novel.latestWritebackSummary ? (
            <p className="mt-2 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--ink-soft)]">
              最近写回：{novel.latestWritebackSummary}
            </p>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-2 font-medium text-stone-950">
          进入作品
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
