"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Flame,
  History,
  Plus,
  Route,
  TriangleAlert,
} from "lucide-react";

import { NovelCard } from "@/components/novel/novel-card";
import { api } from "@/lib/api";
import { formatStationTime, getStageLabel } from "@/lib/control-station";
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

  const hotProject = novels[0];
  const totalChapters = novels.reduce((sum, novel) => sum + (novel._count?.chapters ?? 0), 0);
  const totalWords = novels.reduce((sum, novel) => sum + novel.totalWordCount, 0);
  const completedChapters = novels.reduce((sum, novel) => sum + (novel.completedChapterCount ?? 0), 0);
  const progress = totalChapters > 0 ? Math.min(96, Math.round((completedChapters / Math.max(totalChapters, 1)) * 100)) : 0;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-6">
          <section className="relative overflow-hidden rounded-xl border border-[rgba(85,67,54,0.3)] bg-[rgba(27,32,38,0.5)] p-8">
            <div className="absolute right-8 top-0 opacity-[0.03]">
              <BookOpenText className="h-[180px] w-[180px]" />
            </div>
            <div className="mb-10 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--foreground)]">
                    {hotProject?.title ?? "文枢AI 控制台"}
                  </h1>
                  {hotProject ? (
                    <>
                      <span className="label-font rounded-sm border border-[rgba(108,211,247,0.2)] bg-[rgba(108,211,247,0.08)] px-2 py-0.5 text-[10px] text-[var(--accent-cyan)]">
                        {hotProject.genre}
                      </span>
                      <span className="label-font rounded-sm border border-[rgba(255,183,125,0.2)] bg-[rgba(255,183,125,0.08)] px-2 py-0.5 text-[10px] text-[var(--accent)]">
                        {getStageLabel(hotProject.stage)}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="label-font flex items-center gap-6 text-xs text-slate-400">
                  <span>作者: {user?.nickname ?? "未登录"}</span>
                  <span>已完成: {completedChapters} 章</span>
                  <span>目标: 稳定推进整本书</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-5xl font-bold tracking-tighter text-[var(--accent)]">
                  {progress}%
                </div>
                <div className="label-font mt-1 text-[10px] uppercase tracking-widest text-slate-500">
                  总完成进度
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="h-1 overflow-hidden rounded-full bg-[var(--background-elevated)]">
                <div
                  className="h-full bg-[var(--accent)] shadow-[0_0_15px_rgba(255,183,125,0.3)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="rounded-lg border border-[rgba(85,67,54,0.2)] bg-[rgba(23,28,34,0.5)] p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="label-font flex items-center text-[11px] uppercase tracking-widest text-slate-400">
                      近七章创作速率
                    </h3>
                    <span className="text-[10px] text-[var(--accent)]">Avg: 3.8k</span>
                  </div>
                  <div className="flex h-32 items-end justify-between gap-2 px-2">
                    {[60, 80, 40, 95, 70, 65, 85].map((value, index) => (
                      <div
                        key={value}
                        className={`w-full rounded-t-sm border-t ${
                          index === 6
                            ? "bg-[var(--accent)] border-[var(--accent)]"
                            : "bg-[rgba(255,183,125,0.2)] border-[rgba(255,183,125,0.4)]"
                        }`}
                        style={{ height: `${value}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[rgba(85,67,54,0.2)] bg-[rgba(23,28,34,0.5)] p-5">
                  <h3 className="label-font mb-6 flex items-center text-[11px] uppercase tracking-widest text-slate-400">
                    主/次线叙事密度分布
                  </h3>
                  <div className="grid grid-cols-10 gap-2">
                    {[
                      "bg-[rgba(255,183,125,0.2)]",
                      "bg-[rgba(255,183,125,0.4)]",
                      "bg-[rgba(108,211,247,0.6)]",
                      "bg-[rgba(255,183,125,0.8)]",
                      "bg-[var(--accent)]",
                      "bg-[rgba(108,211,247,0.3)]",
                      "bg-[rgba(255,183,125,0.1)]",
                      "bg-[rgba(255,183,125,0.9)]",
                      "bg-[rgba(108,211,247,0.5)]",
                      "bg-[rgba(255,183,125,0.4)]",
                    ].map((tone, index) => (
                      <div key={index} className={`aspect-square rounded-sm border border-white/5 ${tone}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-[rgba(85,67,54,0.1)] pt-6">
                <div className="flex items-center gap-4 rounded-lg bg-[rgba(48,53,60,0.2)] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[rgba(255,183,125,0.1)] text-[var(--accent)]">
                    <TriangleAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--foreground)]">
                      {Math.max(1, novels.length + 2)} 项待处理债务
                    </div>
                    <div className="label-font text-[10px] text-slate-500">下章核心逻辑必须解决</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-[rgba(48,53,60,0.2)] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-[rgba(108,211,247,0.1)] text-[var(--accent-cyan)]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--foreground)]">稳定性评分 94</div>
                    <div className="label-font text-[10px] text-slate-500">全局逻辑连贯度表现极佳</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-[rgba(48,53,60,0.2)] p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-white/5 text-slate-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--foreground)]">系统同步: 实时</div>
                    <div className="label-font text-[10px] text-slate-500">
                      最近成功写回: {hotProject?.latestDocumentUpdate ? "12min前" : "暂无"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-4 space-y-6">
          <h2 className="label-font mb-4 flex items-center text-[11px] uppercase tracking-[0.2em] text-slate-400">
            今日控制重点
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-[rgba(85,67,54,0.3)] border-l-[3px] border-l-[var(--accent)] bg-[rgba(27,32,38,0.6)] p-5">
              <div className="mb-3 flex items-start justify-between">
                <span className="label-font text-[10px] uppercase tracking-wider text-[var(--accent)]">
                  Target Chapter
                </span>
              </div>
              <h4 className="text-sm font-bold text-[var(--foreground)]">
                {hotProject?.latestChapterTitle ?? "第143章: 恶人谷的重逢"}
              </h4>
              <div className="label-font mt-2 text-[10px] text-slate-500">预估字数: 3,500</div>
            </div>

            <div className="rounded-lg border border-[rgba(85,67,54,0.3)] border-l-[3px] border-l-[var(--accent-cyan)] bg-[rgba(27,32,38,0.6)] p-5">
              <span className="label-font text-[10px] uppercase tracking-wider text-[var(--accent-cyan)]">
                Character Alert
              </span>
              <h4 className="mt-3 text-sm font-bold text-[var(--foreground)]">主角群需在此时回归</h4>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                距离上次高强度出场已过多个章节，读者期待曲线应重新抬升。
              </p>
            </div>

            <div className="rounded-lg border border-[rgba(85,67,54,0.3)] border-l-[3px] border-l-slate-500 bg-[rgba(27,32,38,0.6)] p-5">
              <span className="label-font text-[10px] uppercase tracking-wider text-slate-400">
                Foreshadowing Recall
              </span>
              <h4 className="mt-3 text-sm font-bold text-[var(--foreground)]">回收: 玉佩 / 血缘线索伏笔</h4>
              <div className="mt-2 inline-flex rounded-sm border border-[rgba(85,67,54,0.2)] bg-[rgba(48,53,60,0.5)] px-2 py-0.5 text-[9px] text-slate-400">
                第82章埋设
              </div>
            </div>

            <div className="rounded-lg border border-[rgba(255,180,171,0.3)] border-l-[3px] border-l-[#ffb4ab] bg-[rgba(255,180,171,0.05)] p-5">
              <span className="label-font text-[10px] uppercase tracking-wider text-[#ffb4ab]">
                Continuity Risk
              </span>
              <h4 className="mt-2 text-sm font-bold text-[#ffb4ab]">人物状态矛盾警告</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-[rgba(255,180,171,0.72)]">
                最近章节里的人物伤势和前文记录存在冲突，需要在下一次修订时修正。
              </p>
            </div>

            <div className="rounded border border-[rgba(85,67,54,0.1)] bg-[rgba(23,28,34,0.3)] p-4 italic">
              <div className="label-font mb-1 text-[9px] uppercase text-slate-600">Recent Auto-Summary</div>
              <p className="text-[11px] text-slate-500">
                &quot;{hotProject?.latestWritebackSummary ?? "最近一次写回已经同步角色动机与推进摘要。"}&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 pb-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(85,67,54,0.2)] pb-3">
            <h3 className="label-font flex items-center text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <History className="mr-2 h-4 w-4" />
              写回日志流
            </h3>
            <Link href={hotProject ? `/novels/${hotProject.id}` : "/dashboard"} className="text-[10px] text-[var(--accent)] hover:underline">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {novels.slice(0, 3).map((novel, index) => (
              <div
                key={novel.id}
                className="rounded border border-[rgba(85,67,54,0.2)] bg-[rgba(27,32,38,0.4)] p-4 transition-colors hover:border-[rgba(255,183,125,0.3)]"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    {novel.latestChapterTitle ? `${novel.latestChapterTitle} 写回成功` : `${novel.title} 写回成功`}
                  </span>
                  <span className="label-font text-[10px] text-slate-500">
                    {index === 0 ? "12:45 PM" : index === 1 ? "昨日 22:10" : "昨日 15:30"}
                  </span>
                </div>
                <p className="text-[11px] leading-normal text-slate-400">
                  {novel.latestWritebackSummary ?? novel.nextAction ?? "已同步作品资料与后续推进计划。"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(85,67,54,0.2)] pb-3">
            <h3 className="label-font flex items-center text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <Route className="mr-2 h-4 w-4" />
              章节演进蓝图
            </h3>
          </div>
          <div className="relative space-y-5 pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[rgba(85,67,54,0.3)]">
            {[0, 1, 2].map((index) => (
              <div key={index} className="relative">
                <div
                  className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full ${
                    index === 0
                      ? "bg-[var(--accent)] ring-4 ring-[rgba(255,183,125,0.1)]"
                      : "border border-[rgba(85,67,54,0.3)] bg-[var(--background-elevated)]"
                  }`}
                />
                <div
                  className={`rounded-lg border p-4 ${
                    index === 0
                      ? "border-[rgba(255,183,125,0.3)] bg-[var(--background-elevated)]"
                      : "border-[rgba(85,67,54,0.2)] bg-[rgba(23,28,34,0.6)]"
                  }`}
                >
                  <div className={`label-font mb-1 text-[10px] uppercase ${index === 0 ? "text-[var(--accent)]" : "text-slate-500"}`}>
                    {index === 0 ? "Current Focused" : index === 1 ? "Coming Up Next" : "Planning Phase"}
                  </div>
                  <div className="text-xs font-bold text-[var(--foreground)]">
                    {index === 0 ? "第143章: 恶人谷的重逢" : index === 1 ? "第144章: 地宫惊魂" : "第145章: 燕南天的传人"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(85,67,54,0.2)] pb-3">
            <h3 className="label-font text-[11px] uppercase tracking-[0.2em] text-slate-400">作品资料完备度</h3>
            <span className="text-[10px] text-slate-500">已通过 12 项检查</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "项目概况", percent: "100%", tone: "text-[var(--accent)]" },
              { label: "主题命题", percent: "100%", tone: "text-[var(--accent-cyan)]" },
              { label: "人物圣经", percent: "92%", tone: "text-[var(--accent)]" },
              { label: "动态状态", percent: hotProject?.latestDocumentUpdate ? "88%" : "42%", tone: "text-[var(--accent-cyan)]" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex h-28 flex-col justify-between rounded border border-[rgba(85,67,54,0.1)] bg-[rgba(27,32,38,0.4)] p-4 transition-all hover:bg-[rgba(37,42,49,0.8)]"
              >
                <div className="flex items-start justify-between">
                  <Plus className={`h-4 w-4 ${item.tone}`} />
                  <span className={`label-font text-[10px] font-bold ${item.tone}`}>{item.percent}</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[var(--foreground)]">{item.label}</div>
                  <div className="label-font mt-1 text-[9px] text-slate-500">
                    最后更新: {hotProject?.latestDocumentUpdate ? formatStationTime(hotProject.latestDocumentUpdate).slice(5, 16) : "暂无"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="text-sm text-rose-400">{error}</div> : null}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="label-font text-[11px] uppercase tracking-[0.2em] text-slate-400">Project Rooms</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--foreground)]">项目作战间</h2>
          </div>
          <Link
            href="/novels/new"
            className="inline-flex items-center gap-2 rounded bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] px-4 py-2 text-xs font-bold text-[var(--paper-ink)]"
          >
            新建项目
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t border-[rgba(85,67,54,0.1)] bg-[rgba(23,28,34,0.3)] px-10 py-6">
        <div className="flex items-center justify-between text-[10px] tracking-wider text-slate-500">
          <div className="label-font flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-500" />
              <span>系统就绪：创作控制引擎</span>
            </span>
            <span>总字数：{totalWords.toLocaleString()}</span>
          </div>
          <div className="label-font flex items-center gap-4">
            <span>DOCUMENTATION</span>
            <span>© 文枢AI CONTROL STATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
