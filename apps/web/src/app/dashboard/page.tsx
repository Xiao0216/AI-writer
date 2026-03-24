"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Flame, Plus, Siren, Users } from "lucide-react";

import { NovelCard } from "@/components/novel/novel-card";
import { api } from "@/lib/api";
import type { NovelSummary, User } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [novels, setNovels] = useState<NovelSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [currentUser, currentNovels] = await Promise.all([api.me(), api.listNovels()]);
        setUser(currentUser);
        setNovels(currentNovels);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "加载失败");
      }
    })();
  }, []);

  const totalWords = novels.reduce((sum, novel) => sum + novel.totalWordCount, 0);
  const totalChapters = novels.reduce((sum, novel) => sum + (novel._count?.chapters ?? 0), 0);
  const totalCompletedChapters = novels.reduce(
    (sum, novel) => sum + (novel.completedChapterCount ?? 0),
    0,
  );
  const hotProject = novels[0];
  const latestUpdate = hotProject?.latestDocumentUpdate
    ? new Date(hotProject.latestDocumentUpdate).toLocaleString("zh-CN", { hour12: false })
    : null;
  const stageLabel =
    hotProject?.stage === "ALIGNMENT"
      ? "立项对齐中"
      : hotProject?.stage === "OUTLINE_READY"
        ? "真相文件已立住，待开章节"
        : hotProject?.stage === "WRITING"
          ? "进入章节推进"
          : "尚未建立";

  return (
    <div className="space-y-8">
      <section className="control-panel overflow-hidden rounded-[2.8rem]">
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.25fr_0.75fr] xl:px-10 xl:py-10">
          <div>
            <p className="meta-kicker">Control Deck</p>
            <h1 className="panel-title mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] lg:text-6xl">
              {user ? `${user.nickname} 的长篇作战台` : "长篇项目控制台"}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-soft)] lg:text-lg">
              这里不是作品列表。这里要回答的是：今天哪条线该升温、谁该回归、哪一章该推进，以及这一章写完之后整本书会发生什么。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/novels/new"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(139,30,30,0.18)] hover:bg-[#741616]"
              >
                <Plus className="h-4 w-4" />
                新建长篇项目
              </Link>
              {hotProject ? (
                <Link
                  href={`/novels/${hotProject.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] px-6 py-3 text-sm font-semibold text-stone-900"
                >
                  继续当前热项目
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] p-5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">今日推进</p>
              <p className="mt-3 font-serif text-3xl text-stone-950">{totalChapters || 0} 章</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">当前最需要做的不是再开一本书，而是把已经打开的那本书继续往前推。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] p-5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">总字数</p>
              <p className="mt-3 font-serif text-3xl text-stone-950">{totalWords.toLocaleString()}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">这是当前控制面已经进入系统管理的正文体量，不包含散落在外部文档里的内容。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] p-5 sm:col-span-2 lg:col-span-1">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">已写回章节</p>
              <p className="mt-3 font-serif text-3xl text-stone-950">{totalCompletedChapters}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">真正完成的不是“写过”，而是已经进入写回链路、能继续被整本书消费的章节。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="control-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="meta-kicker">Today Radar</p>
              <h2 className="panel-title text-2xl font-semibold">今日最该处理的事</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <Flame className="h-5 w-5" />
                <p className="text-sm font-semibold">情节线热度</p>
              </div>
              <p className="mt-4 font-serif text-2xl text-stone-950">{stageLabel}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">先让一本书形成推进惯性，而不是同时开很多条空线。</p>
            </div>
            <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent-soft)]">
                <Users className="h-5 w-5" />
                <p className="text-sm font-semibold">角色回归</p>
              </div>
              <p className="mt-4 font-serif text-2xl text-stone-950">检查主角群</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">优先让核心人物持续出现，避免角色只在设定页活着。</p>
            </div>
            <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <Siren className="h-5 w-5" />
                <p className="text-sm font-semibold">写回提醒</p>
              </div>
              <p className="mt-4 font-serif text-2xl text-stone-950">先写回再推进</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">任何章节推进都必须伴随动态状态更新，否则整本书会逐步失控。</p>
              {latestUpdate ? (
                <p className="mt-2 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--ink-soft)]">
                  最近写回时间：{latestUpdate}
                </p>
              ) : null}
            </div>
          </div>
        </article>

        <article className="control-panel rounded-[2rem] p-6">
          <p className="meta-kicker">Recent Log</p>
          <h2 className="panel-title mt-2 text-2xl font-semibold">最近写回摘要</h2>
          <div className="mt-5 space-y-3">
            {novels.slice(0, 3).map((novel, index) => (
              <div key={novel.id} className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-stone-950">{novel.title}</p>
                  <span className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">#{index + 1}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  当前已管理 {novel._count?.chapters ?? 0} 章，已补齐 {novel.documentCompletionCount ?? 0} 份真相文件。{novel.nextAction}
                </p>
                {novel.latestWritebackSummary ? (
                  <p className="mt-2 text-sm leading-6 text-stone-950">
                    最近摘要：{novel.latestWritebackSummary}
                  </p>
                ) : null}
                {novel.latestDocumentUpdate ? (
                  <p className="mt-2 text-xs font-semibold tracking-[0.18em] uppercase text-[var(--ink-soft)]">
                    最近写回：{new Date(novel.latestDocumentUpdate).toLocaleString("zh-CN", { hour12: false })}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}，如未登录请先前往<Link href="/login">登录页</Link>。
        </div>
      ) : null}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="meta-kicker">Project Rooms</p>
            <h2 className="panel-title text-2xl font-semibold">项目作战间</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
            每一本书都应该像一个持续更新的控制工程，而不是一份安静躺着的文档。
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {novels.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
        </div>
      </section>
    </div>
  );
}
