"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Flag, LibraryBig, ScrollText } from "lucide-react";

import { SectionHeading, StationPanel, StatusBadge } from "@/components/control-station/station-kit";
import { api } from "@/lib/api";

export default function NewNovelPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    genre: "都市",
    synopsis: "",
    targetWordCount: 500000,
  });

  return (
    <div className="space-y-8">
      <section className="station-hero station-frame overflow-hidden rounded-[2.8rem] px-8 py-8 xl:px-10 xl:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
          <div>
            <p className="meta-kicker text-[var(--ink-muted)]">Project Setup</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] lg:text-5xl">
              新建长篇项目
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(232,223,210,0.8)]">
              这里录入的不是普通作品元信息，而是后续控制系统的起点。项目创建完成后，下一步应该进入启动立项流，
              先建立作品资料，再进入章节推进。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge tone="amber">不是简单新建作品</StatusBadge>
              <StatusBadge tone="cyan">下一步是启动立项流</StatusBadge>
            </div>
          </div>

          <StationPanel tone="paper" className="bg-[rgba(252,249,243,0.94)]">
            <SectionHeading
              kicker="Creation Policy"
              title="创建前提醒"
              description="没有立项对齐，就不会有稳定的章节推进。"
            />
            <div className="mt-5 grid gap-3 text-sm text-[var(--paper-ink)]">
              <p>1. 先确认这本书的承诺和目标规模。</p>
              <p>2. 创建后立刻进入启动立项流。</p>
              <p>3. 不建议创建完项目就直接开始盲写。</p>
            </div>
          </StationPanel>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Why This Matters"
            title="为什么这里重要"
            description="新建项目阶段决定了后面控制台有没有抓手。"
          />
          <div className="mt-5 grid gap-3">
            {[
              {
                icon: <Flag className="h-4 w-4 text-[var(--accent-strong)]" />,
                title: "先写明承诺",
                body: "项目名和题材只是外壳，真正影响推进的是承诺与命题。",
              },
              {
                icon: <LibraryBig className="h-4 w-4 text-[var(--accent-cyan)]" />,
                title: "确定规模",
                body: "目标体量会影响路线图、写回频率与马拉松策略。",
              },
              {
                icon: <ScrollText className="h-4 w-4 text-[var(--accent-cyan)]" />,
                title: "准备立项访谈",
                body: "创建只是开门，立项流才是真正建立控制站。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.45rem] border border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.8)] p-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                  {item.icon}
                  {item.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.body}</p>
              </div>
            ))}
          </div>
        </StationPanel>

        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Project Basics"
            title="项目基础录入"
            description="录入基础信息后，将进入启动立项流继续对齐。"
          />
          <form
            className="mt-5 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setMessage("");
              try {
                const novel = await api.createNovel(form);
                setMessage("项目已创建，正在进入启动立项流。");
                router.push(`/novels/${novel.id}/intake`);
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "创建项目失败");
              } finally {
                setPending(false);
              }
            }}
          >
            <input
              className="station-input"
              placeholder="作品名称"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
            <input
              className="station-input"
              placeholder="作品品类"
              value={form.genre}
              onChange={(event) => setForm((current) => ({ ...current, genre: event.target.value }))}
              required
            />
            <textarea
              className="station-input min-h-40"
              placeholder="作品简介或一句话承诺"
              value={form.synopsis}
              onChange={(event) => setForm((current) => ({ ...current, synopsis: event.target.value }))}
            />
            <input
              className="station-input"
              type="number"
              value={form.targetWordCount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetWordCount: Number(event.target.value),
                }))
              }
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0e1821] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={pending}
              >
                {pending ? "创建中..." : "创建项目并进入立项流"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {message ? <p className="text-sm text-[var(--accent-strong)]">{message}</p> : null}
          </form>
        </StationPanel>
      </section>
    </div>
  );
}
