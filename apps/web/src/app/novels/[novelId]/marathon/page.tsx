"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Siren,
} from "lucide-react";

import { SectionHeading, StationPanel, StatusBadge } from "@/components/control-station/station-kit";
import { api } from "@/lib/api";
import {
  buildDebtItems,
  buildMarathonStages,
  formatStationTime,
  getTruthCompletion,
} from "@/lib/control-station";
import type { NovelDetail } from "@/lib/types";

export default function MarathonControlPage() {
  const params = useParams<{ novelId: string }>();
  const [novel, setNovel] = useState<NovelDetail | null>(null);

  useEffect(() => {
    void api.getNovel(params.novelId).then(setNovel);
  }, [params.novelId]);

  if (!novel) {
    return <div className="text-sm text-[var(--foreground)]/72">正在加载自动续写台...</div>;
  }

  const stages = buildMarathonStages(novel);
  const debts = buildDebtItems(novel);
  const truthCompletion = getTruthCompletion(novel.documents);
  const latestChapter = novel.chapters[0];

  return (
    <div className="space-y-8">
      <section className="station-hero station-frame overflow-hidden rounded-[2.8rem] px-8 py-8 xl:px-10 xl:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.14fr_0.86fr]">
          <div>
            <p className="meta-kicker text-[var(--ink-muted)]">Marathon Control Desk</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] lg:text-5xl">
              自动续写台
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(232,223,210,0.8)]">
              这一页负责看住自动续写过程，不是无限自动生成。作者必须能看见当前执行章节、执行阶段、
              阻塞原因、停止点和最近写回结果，才能把自动续写当成生产能力而不是失控风险。
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
                  进入章节控制页
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4">
            <StationPanel tone="paper" className="bg-[rgba(252,249,243,0.94)]">
              <SectionHeading
                kicker="Run Snapshot"
                title="当前运行条件"
                description="不满足前置条件时，系统应该阻塞，而不是硬跑。"
              />
              <div className="mt-5 grid gap-3 text-sm text-[var(--paper-ink)]">
                <p>资料完成度: {truthCompletion}%</p>
                <p>最近写回: {formatStationTime(novel.latestDocumentUpdate)}</p>
                <p>最近章节: {novel.chapters[0]?.title ?? "暂无章节"}</p>
              </div>
            </StationPanel>

            <StationPanel tone="cyan" className="bg-[rgba(230,244,247,0.84)]">
              <SectionHeading
                kicker="Guardrails"
                title="自动续写护栏"
                description="护栏可见，比按钮数量更重要。"
              />
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge tone="danger">可暂停</StatusBadge>
                <StatusBadge tone="amber">可手动介入</StatusBadge>
                <StatusBadge tone="cyan">必须写回后再继续</StatusBadge>
              </div>
            </StationPanel>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Pipeline"
            title="自动续写流程"
            description="这里展示自动推进的阶段，而不是一个无限输出框。"
          />
          <div className="mt-5 grid gap-4">
            {stages.map((stage, index) => (
              <div
                key={stage.title}
                className="rounded-[1.6rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.82)] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,243,224,0.76)] font-serif text-lg text-[var(--accent-strong)]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--paper-ink)]">{stage.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{stage.detail}</p>
                    </div>
                  </div>
                  <StatusBadge
                    tone={
                      stage.status === "running" ? "cyan" : stage.status === "blocked" ? "danger" : "paper"
                    }
                  >
                    {stage.status === "running" ? "运行中" : stage.status === "blocked" ? "阻塞" : "待命"}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </StationPanel>

        <div className="space-y-6">
          <StationPanel tone="cyan" className="bg-[rgba(230,244,247,0.84)]">
            <SectionHeading
              kicker="Operator Console"
              title="操作员控制"
              description="作者始终保留暂停、继续和介入的主控权。"
            />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                  <PauseCircle className="h-4 w-4 text-[var(--accent-danger)]" />
                  暂停
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  发现人物跑偏或情节失真时立刻停机。
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                  <PlayCircle className="h-4 w-4 text-[var(--accent-cyan)]" />
                  继续
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  只有在写回完成、债务同步后才允许恢复运行。
                </p>
              </div>
              <div className="rounded-[1.4rem] bg-[rgba(255,255,255,0.58)] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                  <ShieldAlert className="h-4 w-4 text-[var(--accent-strong)]" />
                  介入
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  将异常章节拉回章节控制页进行人工修正。
                </p>
              </div>
            </div>
          </StationPanel>

          <StationPanel className="control-panel rounded-[2.2rem] p-6">
            <SectionHeading
              kicker="Blocking Reasons"
              title="当前阻塞与债务"
              description="自动续写的阻塞原因必须可见且可解释。"
            />
            <div className="mt-5 grid gap-3">
              {debts.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.45rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.82)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--paper-ink)]">{item.title}</p>
                    <StatusBadge tone={item.severity === "高" ? "danger" : item.severity === "中" ? "amber" : "paper"}>
                      {item.severity}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.note}</p>
                </div>
              ))}
            </div>
          </StationPanel>

          <StationPanel tone="amber" className="bg-[rgba(255,243,224,0.78)]">
            <SectionHeading
              kicker="Run Policy"
              title="运行政策"
              description="自动续写的默认策略是保守、可回滚、可核查。"
            />
            <div className="mt-5 grid gap-3">
              {[
                "没有作品资料，不开跑。",
                "没有章节写回，不续跑。",
                "出现人物跑偏或伏笔失踪，立即人工接管。",
              ].map((rule) => (
                <div
                  key={rule}
                  className="rounded-[1.35rem] bg-[rgba(255,255,255,0.56)] px-4 py-4 text-sm leading-6 text-[var(--paper-ink)]"
                >
                  <div className="flex items-center gap-2">
                    <Siren className="h-4 w-4 text-[var(--accent-strong)]" />
                    {rule}
                  </div>
                </div>
              ))}
            </div>
          </StationPanel>
        </div>
      </section>
    </div>
  );
}
