"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BookText, Orbit, Radar, ScrollText } from "lucide-react";

import {
  ProgressBar,
  SectionHeading,
  StationPanel,
  StatusBadge,
} from "@/components/control-station/station-kit";
import { api } from "@/lib/api";
import {
  buildMemorySlices,
  buildPlotlineHeat,
  formatStationTime,
  getTruthCompletion,
} from "@/lib/control-station";
import type { NovelDetail } from "@/lib/types";

export default function MemoryControlPage() {
  const params = useParams<{ novelId: string }>();
  const [novel, setNovel] = useState<NovelDetail | null>(null);

  useEffect(() => {
    void api.getNovel(params.novelId).then(setNovel);
  }, [params.novelId]);

  if (!novel) {
    return <div className="text-sm text-[var(--foreground)]/72">正在加载写前回顾...</div>;
  }

  const slices = buildMemorySlices(novel);
  const heat = buildPlotlineHeat(novel);
  const truthCompletion = getTruthCompletion(novel.documents);
  const latestChapter = novel.chapters[0];

  return (
    <div className="space-y-8">
      <section className="station-hero station-frame overflow-hidden rounded-[2.8rem] px-8 py-8 xl:px-10 xl:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
          <div>
            <p className="meta-kicker text-[var(--ink-muted)]">Memory & Schema Control</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] lg:text-5xl">
              写前回顾
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(232,223,210,0.8)]">
              这一页不负责写正文，它负责确保作者和系统对整本书此刻的认知一致。人物现态、关系温度、
              动态状态和情节热度都应该从这里被快速调取，而不是靠作者临时回想。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/novels/${novel.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#0e1821]"
              >
                返回作品资料
                <ArrowRight className="h-4 w-4" />
              </Link>
              {latestChapter ? (
                <Link
                  href={`/novels/${novel.id}/chapters`}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(125,152,168,0.22)] bg-[rgba(255,255,255,0.06)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                >
                  打开章节控制页
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            <StationPanel tone="paper" className="bg-[rgba(252,249,243,0.94)]">
              <SectionHeading
                kicker="Memory Status"
                title="系统记忆完整度"
                description="回忆页的价值在于缩短重新进入状态的时间。"
              />
              <div className="mt-5 space-y-3 text-sm text-[var(--paper-ink)]">
                <p>资料完成度: {truthCompletion}%</p>
                <p>最近写回: {formatStationTime(novel.latestDocumentUpdate)}</p>
                <p>章节总数: {novel.chapters.length}</p>
              </div>
            </StationPanel>

            <StationPanel tone="cyan" className="bg-[rgba(230,244,247,0.84)]">
              <SectionHeading
                kicker="Usage"
                title="这页什么时候最重要"
                description="卡文、断更回归、长篇中段失序时，先回这里再开写。"
              />
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge tone="amber">断更回归</StatusBadge>
                <StatusBadge tone="cyan">多线切换</StatusBadge>
                <StatusBadge tone="paper">章节写回后复盘</StatusBadge>
              </div>
            </StationPanel>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Memory Slices"
            title="回忆切片"
            description="切片比整份长文档更适合在写作中即时调用。"
          />
          <div className="mt-5 grid gap-4">
            {slices.map((slice) => (
              <div
                key={slice.title}
                className="rounded-[1.6rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.82)] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--paper-ink)]">{slice.title}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--paper-ink)]">{slice.body}</p>
                  </div>
                  <StatusBadge tone={slice.tone}>切片</StatusBadge>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{slice.note}</p>
              </div>
            ))}
          </div>
        </StationPanel>

        <StationPanel tone="cyan" className="bg-[rgba(230,244,247,0.84)]">
          <SectionHeading
            kicker="Schema Monitor"
            title="图式热度"
            description="用图式视角看整本书，避免只盯着单章文本。"
          />
          <div className="mt-5 grid gap-4">
            {heat.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-[rgba(87,157,174,0.16)] bg-[rgba(255,255,255,0.58)] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                    {item.tone === "cyan" ? (
                      <Orbit className="h-4 w-4 text-[var(--accent-cyan)]" />
                    ) : item.tone === "amber" ? (
                      <Radar className="h-4 w-4 text-[var(--accent-strong)]" />
                    ) : (
                      <ScrollText className="h-4 w-4 text-[var(--paper-ink)]" />
                    )}
                    {item.title}
                  </div>
                  <span className="font-serif text-2xl text-[var(--paper-ink)]">{item.value}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={item.value} tone={item.tone === "cyan" ? "cyan" : "amber"} />
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                <BookText className="h-4 w-4 text-[var(--accent-cyan)]" />
                回到章节页时
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                先看人物现态和关系温度，再决定这一章让谁承压。
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                <Orbit className="h-4 w-4 text-[var(--accent-cyan)]" />
                回到项目页时
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                检查热度和写回摘要是否同步变化，确认闭环成立。
              </p>
            </div>
          </div>
        </StationPanel>
      </section>
    </div>
  );
}
