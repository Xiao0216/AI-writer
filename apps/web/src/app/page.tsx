import Link from "next/link";
import { ArrowRight, Flame, Orbit, Radar, ScrollText, Users } from "lucide-react";

import { SectionHeading, StationPanel, StatusBadge } from "@/components/control-station/station-kit";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="station-hero station-frame overflow-hidden rounded-[3rem] px-8 py-10 xl:px-12 xl:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="meta-kicker text-[var(--ink-muted)]">Long-Form Fiction Control</p>
            <h1 className="mt-4 max-w-5xl font-serif text-5xl font-semibold leading-tight tracking-[-0.05em] text-[var(--foreground)] lg:text-7xl">
              不是帮你写一段，
              <br />
              是帮你把整本书控住。
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-[rgba(232,223,210,0.82)]">
              文枢AI 面向中文长篇小说作者，把作品资料、章节控制卡、动态写回、情节线热度、
              角色回归提醒和自动续写监控整合进同一个创作控制站。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#0e1821]"
              >
                进入控制站
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(125,152,168,0.22)] bg-[rgba(255,255,255,0.06)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                查看作品控制台
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge tone="amber">先对齐，再开写</StatusBadge>
              <StatusBadge tone="cyan">每章都必须动态写回</StatusBadge>
              <StatusBadge tone="paper">连续性控制优先</StatusBadge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: <Radar className="h-5 w-5 text-[var(--accent-strong)]" />,
                title: "情节线热度",
                body: "不是只看字数，而是判断哪条主线在升温、哪条支线在变冷。",
              },
              {
                icon: <Users className="h-5 w-5 text-[var(--accent-cyan)]" />,
                title: "角色回归提醒",
                body: "角色不是资料卡，必须持续回到剧情压力里。",
              },
              {
                icon: <ScrollText className="h-5 w-5 text-[var(--accent-cyan)]" />,
                title: "动态写回",
                body: "每一章写完都要更新整本书状态，否则中期必然失控。",
              },
              {
                icon: <Orbit className="h-5 w-5 text-[var(--accent-strong)]" />,
                title: "自动续写监控",
                body: "自动推进必须有护栏、阻塞原因和手动介入入口。",
              },
            ].map((item) => (
              <StationPanel key={item.title} tone="paper" className="bg-[rgba(252,249,243,0.9)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(43,56,67,0.08)] bg-[rgba(255,255,255,0.58)]">
                  {item.icon}
                </div>
                <h2 className="panel-title mt-5 text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.body}</p>
              </StationPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Workflow"
            title="产品主链路"
            description="这套产品不是“开个编辑器然后点生成”。"
          />
          <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--paper-ink)] md:grid-cols-2">
            <p>1. 创建项目，先完成启动立项流。</p>
            <p>2. 建立并确认 10 份标准控制文件。</p>
            <p>3. 从项目页进入章节控制页推进正文。</p>
            <p>4. 完成章节后执行动态写回，再回控制台看风险变化。</p>
          </div>
        </StationPanel>

        <StationPanel tone="amber" className="bg-[rgba(255,243,224,0.78)]">
          <SectionHeading
            kicker="Positioning"
            title="这不是普通 AI 写作工具"
            description="文枢AI 的操作对象是整本书，而不是一段文。"
          />
          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--paper-ink)]">
            <p>它的目标是帮助作者稳定推进 30 万到 300 万字项目，而不是只给一段看起来像小说的文字。</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.56)] px-4 py-2 text-[var(--paper-ink)]">
              <Flame className="h-4 w-4 text-[var(--accent-strong)]" />
              先控制，再生成。
            </div>
          </div>
        </StationPanel>
      </section>
    </div>
  );
}
