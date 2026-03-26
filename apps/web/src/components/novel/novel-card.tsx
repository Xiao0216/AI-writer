import Link from "next/link";
import { ArrowRight, Flame, LibraryBig, Radar, Siren } from "lucide-react";

import { getStageLabel } from "@/lib/control-station";
import type { NovelSummary } from "@/lib/types";

export function NovelCard({ novel }: { novel: NovelSummary }) {
  const chapterCount = novel._count?.chapters ?? 0;
  const completedCount = novel.completedChapterCount ?? 0;
  const heat = chapterCount >= 8 ? "升温" : chapterCount >= 3 ? "成形" : "待点火";

  return (
    <Link
      href={`/novels/${novel.id}`}
      className="group station-frame control-panel paper-grid rounded-[2.2rem] p-6 transition hover:-translate-y-1.5 hover:border-[rgba(207,141,53,0.32)] hover:shadow-[0_28px_60px_rgba(5,12,18,0.2)]"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-[rgba(207,141,53,0.18)] bg-[rgba(255,243,224,0.76)] text-[var(--accent-strong)]">
          <LibraryBig className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-[rgba(43,56,67,0.1)] bg-[rgba(252,249,243,0.88)] px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-[var(--ink-soft)] uppercase">
          {novel.genre}
        </span>
      </div>

      <p className="meta-kicker">Project Room</p>
      <h3 className="panel-title mt-3 text-[2rem] font-semibold leading-tight">{novel.title}</h3>
      <p className="mt-3 line-clamp-3 min-h-18 text-sm leading-7 text-[var(--ink-soft)]">
        {novel.synopsis || "还没有写下作品简介，建议先在作品资料里明确这本书的核心承诺。"}
      </p>

      <div className="editorial-rule mt-6" />

      <div className="mt-5 grid gap-3 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
        <div className="rounded-[1.3rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">字数</p>
          <p className="mt-2 font-serif text-xl text-[var(--paper-ink)]">{novel.totalWordCount.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">章节</p>
          <p className="mt-2 font-serif text-xl text-[var(--paper-ink)]">{chapterCount}</p>
        </div>
        <div className="rounded-[1.3rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">热度</p>
          <p className="mt-2 inline-flex items-center gap-2 font-medium text-[var(--paper-ink)]">
            {heat === "升温" ? (
              <Flame className="h-4 w-4 text-[var(--accent-strong)]" />
            ) : (
              <Radar className="h-4 w-4 text-[var(--accent-cyan)]" />
            )}
            {heat}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex rounded-full border border-[rgba(207,141,53,0.18)] bg-[rgba(255,243,224,0.76)] px-3 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--paper-ink)]">
          {getStageLabel(novel.stage)}
        </span>
        <span className="inline-flex rounded-full border border-[rgba(87,157,174,0.16)] bg-[rgba(230,244,247,0.74)] px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--paper-ink)]">
          已闭环 {completedCount}
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="rounded-[1.3rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] px-4 py-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">
            <Siren className="h-3.5 w-3.5 text-[var(--accent-danger)]" />
            下一步
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--paper-ink)]">
            {novel.nextAction || "进入项目页，处理作品资料、章节债务和写回状态。"}
          </p>
        </div>

        {novel.latestWritebackSummary ? (
          <div className="rounded-[1.3rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.78)] px-4 py-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">
              最近写回摘要
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--paper-ink)]">{novel.latestWritebackSummary}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p className="text-[var(--ink-soft)]">进入作品控制室</p>
        <span className="inline-flex items-center gap-2 font-medium text-[var(--paper-ink)]">
          打开
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
