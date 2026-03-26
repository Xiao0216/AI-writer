"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  FilePenLine,
  LibraryBig,
  Orbit,
  Plus,
  Save,
  Sparkles,
  TimerReset,
  WandSparkles,
} from "lucide-react";

import { OutlinePanel } from "@/components/ai/outline-panel";
import { ChapterList } from "@/components/chapter/chapter-list";
import {
  BulletMetric,
  SectionHeading,
  StationPanel,
  StatusBadge,
} from "@/components/control-station/station-kit";
import { ExportButton } from "@/components/export/export-button";
import { api } from "@/lib/api";
import {
  buildCharacterPressure,
  buildForeshadowWindows,
  formatStationTime,
  getStageLabel,
  getTruthCompletion,
  summarizeDocument,
  truthFileMetaMap,
} from "@/lib/control-station";
import type { NovelDetail, NovelDocument } from "@/lib/types";

export default function NovelDetailPage() {
  const params = useParams<{ novelId: string }>();
  const router = useRouter();
  const [novel, setNovel] = useState<NovelDetail | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState("");
  const [documentDraft, setDocumentDraft] = useState("");
  const [documentMessage, setDocumentMessage] = useState("");
  const [chapterTitle, setChapterTitle] = useState("第1章");
  const [outlineDraft, setOutlineDraft] = useState("");
  const [chapterMessage, setChapterMessage] = useState("");

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await api.getNovel(params.novelId);
      if (!active) {
        return;
      }

      setNovel(result);
      if (result.documents[0]) {
        setActiveDocumentId(result.documents[0].id);
        setDocumentDraft(result.documents[0].content);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.novelId]);

  if (!novel) {
    return <div className="text-sm text-[var(--foreground)]/72">正在加载项目控制室...</div>;
  }

  const truthFiles = novel.documents;
  const activeDocument =
    truthFiles.find((file) => file.id === activeDocumentId) ?? truthFiles[0] ?? null;
  const truthCompletion = getTruthCompletion(truthFiles);
  const characterPressure = buildCharacterPressure(novel);
  const foreshadowWindows = buildForeshadowWindows(novel);
  const stageLabel = getStageLabel(novel.stage);
  const filledTruthFiles = truthFiles.filter((file) => file.content.trim()).length;
  const syncDiffCount = truthFiles.filter((file) => !file.content.trim() && truthFileMetaMap[file.type].priority !== "support").length;
  const activeEntityCount = novel.characters.length + novel.outlines.length + novel.chapters.length;
  const stabilityScore = Math.min(
    97,
    Math.round(
      truthCompletion * 0.72 +
        Math.min(18, (novel.completedChapterCount ?? 0) * 5) +
        Math.min(8, novel.characters.length * 2),
    ),
  );
  const archiveGroups = [
    {
      title: "项目核心",
      english: "CORE DATA",
      files: truthFiles.filter((file) =>
        ["PROJECT_OVERVIEW", "THEME_AND_PROPOSITION", "MAIN_PLOTLINES", "CHAPTER_ROADMAP"].includes(file.type),
      ),
    },
    {
      title: "人物关系",
      english: "PERSONA NETWORK",
      files: truthFiles.filter((file) =>
        ["CAST_BIBLE", "RELATIONSHIP_MAP", "DYNAMIC_STATE", "FORESHADOW_LEDGER"].includes(file.type),
      ),
    },
    {
      title: "世界设定与动态风格",
      english: "WORLD & ATMOSPHERE",
      files: truthFiles.filter((file) =>
        ["WORLDBUILDING", "STYLE_GUIDE", "WRITING_LOG"].includes(file.type),
      ),
    },
  ];

  const saveDocument = async () => {
    if (!activeDocument) {
      return;
    }

    await api.updateNovelDocument(novel.id, activeDocument.id, {
      content: documentDraft,
    });
    const nextNovel = await api.getNovel(params.novelId);
    setNovel(nextNovel);
    setDocumentMessage(`${activeDocument.title} 已写入作品资料。`);
  };

  const documentStatus = (file: NovelDocument) => (file.content.trim() ? "已立住" : "待补齐");
  const archiveCompleteness = (file: NovelDocument) => {
    const content = summarizeDocument(file.content);
    return file.content.trim() ? Math.min(100, 54 + Math.min(46, content.length)) : 0;
  };
  const archiveRelation = (file: NovelDocument) => {
    const priority = truthFileMetaMap[file.type].priority;
    if (priority === "critical") {
      return "MAX";
    }
    if (priority === "core") {
      return "HIGH";
    }
    return "MID";
  };

  const createFirstChapterAndOpen = async () => {
    const title = chapterTitle.trim() || "第1章";
    const chapter = await api.createChapter(novel.id, { title });
    const nextNovel = await api.getNovel(params.novelId);
    setNovel(nextNovel);
    setChapterMessage("首章已创建，正在进入章节控制页。");
    router.push(`/novels/${novel.id}/chapters/${chapter.id}`);
  };

  return (
    <div className="space-y-8">
      <section className="station-hero station-frame overflow-hidden rounded-[2.8rem] px-8 py-8 xl:px-10 xl:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div>
            <p className="meta-kicker text-[var(--ink-muted)]">Project Truth Zone</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] lg:text-6xl">
              {novel.title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <StatusBadge tone="amber">{novel.genre}</StatusBadge>
              <StatusBadge tone="cyan">{stageLabel}</StatusBadge>
              <StatusBadge tone="paper">资料完成 {truthCompletion}%</StatusBadge>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(232,223,210,0.8)] lg:text-lg">
              {novel.synopsis ||
                "这本书还没有完整简介。先把项目总览、主题命题和人物压力立稳，再进入章节推进。"}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/novels/${novel.id}/intake`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#0e1821] shadow-[0_16px_36px_rgba(207,141,53,0.24)]"
              >
                <LibraryBig className="h-4 w-4" />
                返回立项设置
              </Link>
              {novel.chapters[0] ? (
                <Link
                  href={`/novels/${novel.id}/chapters`}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(125,152,168,0.2)] bg-[rgba(255,255,255,0.06)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                >
                  进入当前章节控制页
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(125,152,168,0.2)] bg-[rgba(255,255,255,0.06)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
                  onClick={() => void createFirstChapterAndOpen()}
                >
                  创建首章并进入章节控制页
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <ExportButton novelId={novel.id} />
            </div>
          </div>

          <div className="grid gap-4">
            <StationPanel tone="paper" className="bg-[rgba(252,249,243,0.94)]">
              <SectionHeading
                kicker="Control Snapshot"
                title="项目当前状态"
                description="项目页的第一职责是判断这本书还能不能稳定推进。"
              />
              <div className="mt-5 space-y-3">
                <BulletMetric label="章节总数" value={`${novel.chapters.length}`} />
                <BulletMetric label="已写回章节" value={`${novel.completedChapterCount ?? 0}`} />
                <BulletMetric label="人物池规模" value={`${novel.characters.length}`} />
                <BulletMetric label="最近写回" value={formatStationTime(novel.latestDocumentUpdate)} />
              </div>
            </StationPanel>

            <StationPanel tone="cyan" className="bg-[rgba(230,244,247,0.84)]">
              <SectionHeading
                kicker="Cross-Page Controls"
                title="控制页入口"
                description="项目页只是总控台，细节要分流到专门页面。"
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/novels/${novel.id}/memory`}
                  className="rounded-[1.45rem] border border-[rgba(87,157,174,0.18)] bg-[rgba(255,255,255,0.56)] p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                    <Orbit className="h-4 w-4 text-[var(--accent-cyan)]" />
                    写前回顾
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    统一查看人物、关系和动态状态切片。
                  </p>
                </Link>
                <Link
                  href={`/novels/${novel.id}/marathon`}
                  className="rounded-[1.45rem] border border-[rgba(87,157,174,0.18)] bg-[rgba(255,255,255,0.56)] p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--paper-ink)]">
                    <TimerReset className="h-4 w-4 text-[var(--accent-cyan)]" />
                    自动续写台
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                    查看自动续写进度、阻塞原因和手动介入入口。
                  </p>
                </Link>
              </div>
            </StationPanel>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {[
          {
            label: "标准作品资料",
            value: (
              <div className="flex items-end gap-2">
                <span>{filledTruthFiles}</span>
                <span className="text-lg text-[rgba(232,223,210,0.42)]">/ {truthFiles.length}</span>
              </div>
            ),
            detail: "10 份标准控制文件和 1 份日志共同构成真相源。",
            tone: "amber" as const,
            icon: <FilePenLine className="h-5 w-5" />,
          },
          {
            label: "待同步差异",
            value: `${syncDiffCount}`,
            detail: "优先处理空白或过期的核心档案，避免章节推进脱轨。",
            tone: "cyan" as const,
            icon: <Sparkles className="h-5 w-5" />,
          },
          {
            label: "高关联对象",
            value: `${activeEntityCount}`,
            detail: "章节、人物、路线材料共同构成当前活跃对象池。",
            tone: "paper" as const,
            icon: <BookOpenText className="h-5 w-5" />,
          },
          {
            label: "全局真相稳定性",
            value: `${stabilityScore}%`,
            detail: novel.nextAction || "下一步先把核心档案补齐，再推进章节。",
            tone: "paper" as const,
            icon: <WandSparkles className="h-5 w-5" />,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(85,67,54,0.22)] bg-[rgba(23,28,34,0.82)] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_top_right,rgba(255,183,125,0.6),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(108,211,247,0.45),transparent_28%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <p className="label-font text-[11px] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <div className={item.tone === "amber" ? "text-[var(--accent)]/70" : item.tone === "cyan" ? "text-[var(--accent-cyan)]/70" : "text-slate-500"}>
                  {item.icon}
                </div>
              </div>
              <div className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)]">
                {item.value}
              </div>
              <p className="mt-4 text-sm leading-6 text-[rgba(232,223,210,0.68)]">{item.detail}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className={item.tone === "amber" ? "h-full rounded-full bg-[var(--accent)]" : item.tone === "cyan" ? "h-full rounded-full bg-[var(--accent-cyan)]" : "h-full rounded-full bg-[rgba(255,183,125,0.72)]"}
                  style={{
                    width:
                      item.label === "标准作品资料"
                        ? `${truthCompletion}%`
                        : item.label === "待同步差异"
                          ? `${Math.max(12, 100 - syncDiffCount * 18)}%`
                          : item.label === "高关联对象"
                            ? `${Math.min(100, 32 + activeEntityCount * 6)}%`
                            : `${stabilityScore}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.16fr_0.84fr]">
        <div className="space-y-12">
          {archiveGroups.map((group) => (
            <section key={group.title}>
              <div className="mb-6 flex items-center gap-4">
                <h2 className="font-serif text-[2rem] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  {group.title}
                  <span className="ml-3 label-font text-xs uppercase tracking-[0.28em] text-slate-500">
                    {group.english}
                  </span>
                </h2>
                <div className="h-px flex-1 bg-[rgba(85,67,54,0.22)]" />
              </div>

              <div className={`grid gap-5 ${group.files.length >= 4 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                {group.files.map((file) => {
                  const meta = truthFileMetaMap[file.type];
                  const active = activeDocument?.id === file.id;
                  const filled = Boolean(file.content.trim());

                  return (
                    <button
                      key={file.id}
                      type="button"
                      className={`group rounded-[1.65rem] border p-6 text-left transition ${
                        active
                          ? "border-[rgba(255,183,125,0.3)] bg-[rgba(37,42,49,0.96)] shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
                          : filled
                            ? "border-[rgba(85,67,54,0.16)] bg-[rgba(23,28,34,0.88)] hover:border-[rgba(255,183,125,0.24)] hover:bg-[rgba(27,32,38,0.96)]"
                            : "border-[rgba(168,86,78,0.24)] bg-[rgba(35,24,25,0.72)] hover:border-[rgba(255,180,171,0.36)]"
                      }`}
                      onClick={() => {
                        setActiveDocumentId(file.id);
                        setDocumentDraft(file.content);
                        setDocumentMessage("");
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="label-font text-[10px] tracking-[0.28em] text-[var(--accent)]/72">
                            ARCHIVE #{meta.code}
                          </div>
                          <h3 className="mt-2 font-serif text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                            {meta.shortTitle}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              filled
                                ? meta.tone === "cyan"
                                  ? "bg-[var(--accent-cyan)] shadow-[0_0_10px_rgba(108,211,247,0.55)]"
                                  : meta.tone === "amber"
                                    ? "bg-[var(--accent)] shadow-[0_0_10px_rgba(255,183,125,0.45)]"
                                    : "bg-[rgba(201,198,194,0.95)]"
                                : "bg-[var(--accent-danger)] shadow-[0_0_10px_rgba(255,180,171,0.45)]"
                            }`}
                          />
                          <span className={`label-font text-[10px] tracking-[0.22em] ${filled ? "text-slate-400" : "text-[var(--accent-danger)]"}`}>
                            {filled ? (active ? "编辑中" : documentStatus(file)) : "待补齐"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-[rgba(232,223,210,0.68)]">{meta.description}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[rgba(232,223,210,0.9)]">
                        {summarizeDocument(file.content)}
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-[1.15rem] bg-[rgba(10,15,20,0.72)] p-3">
                          <div className="label-font text-[10px] uppercase tracking-[0.2em] text-slate-500">完整度</div>
                          <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{archiveCompleteness(file)}%</div>
                        </div>
                        <div className="rounded-[1.15rem] bg-[rgba(10,15,20,0.72)] p-3">
                          <div className="label-font text-[10px] uppercase tracking-[0.2em] text-slate-500">关联度</div>
                          <div className={`mt-1 text-sm font-semibold ${meta.priority === "critical" ? "text-[var(--accent-cyan)]" : "text-[var(--foreground)]"}`}>
                            {archiveRelation(file)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{formatStationTime(file.updatedAt)}</span>
                        <span className="label-font tracking-[0.2em] text-[var(--accent)] transition group-hover:translate-x-1">
                          OPEN
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <StationPanel className="control-panel sticky top-[104px] rounded-[2.2rem] p-6">
            <SectionHeading
              kicker="Truth Editor"
              title={activeDocument?.title ?? "作品资料编辑台"}
              description="当前编辑对象属于作品资料，会直接影响章节控制页、写前回顾和自动续写台。"
              action={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0e1821]"
                  onClick={() => void saveDocument()}
                >
                  <Save className="h-4 w-4" />
                  保存资料
                </button>
              }
            />
            {activeDocument ? (
              <>
                <div className="mt-5 flex flex-wrap gap-2">
                  <StatusBadge tone={truthFileMetaMap[activeDocument.type].tone}>档案 #{truthFileMetaMap[activeDocument.type].code}</StatusBadge>
                  <StatusBadge tone={activeDocument.content.trim() ? truthFileMetaMap[activeDocument.type].tone : "danger"}>
                    {documentStatus(activeDocument)}
                  </StatusBadge>
                </div>
                <textarea
                  className="station-input mt-5 min-h-[25rem]"
                  value={documentDraft}
                  onChange={(event) => setDocumentDraft(event.target.value)}
                />
              </>
            ) : null}
            {documentMessage ? <p className="mt-3 text-sm text-[var(--accent-strong)]">{documentMessage}</p> : null}
          </StationPanel>

          <StationPanel className="control-panel rounded-[2.2rem] p-6">
            <SectionHeading
              kicker="Chapter Operations"
              title="章节推进台"
              description="先确定章节任务，再进入章节控制页处理正文与写回闭环。"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className="station-input max-w-44"
                    value={chapterTitle}
                    onChange={(event) => setChapterTitle(event.target.value)}
                    placeholder="输入章节名"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0e1821]"
                    onClick={async () => {
                      await api.createChapter(novel.id, { title: chapterTitle.trim() || `第${novel.chapters.length + 1}章` });
                      const result = await api.getNovel(params.novelId);
                      setNovel(result);
                      setChapterMessage("章节已创建，可以直接进入章节控制页。");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    添加章节
                  </button>
                </div>
              }
            />
            <div className="mt-5">
              <ChapterList novelId={novel.id} chapters={novel.chapters} />
              {chapterMessage ? <p className="mt-4 text-sm text-[var(--accent-strong)]">{chapterMessage}</p> : null}
            </div>
          </StationPanel>

          <StationPanel tone="cyan" className="bg-[rgba(230,244,247,0.84)]">
            <SectionHeading
              kicker="Pressure Monitor"
              title="人物压力与伏笔窗口"
              description="作品资料页要优先暴露该回归的人物、该回收的线索和该处理的债务。"
            />
            <div className="mt-5 space-y-3">
              {characterPressure.map((item) => (
                <div
                  key={item.name}
                  className="rounded-[1.4rem] border border-[rgba(87,157,174,0.16)] bg-[rgba(255,255,255,0.56)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--paper-ink)]">{item.name}</p>
                      <p className="text-sm text-[var(--ink-soft)]">{item.role}</p>
                    </div>
                    <StatusBadge tone={item.tone}>{item.pressure}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.cue}</p>
                </div>
              ))}
              {foreshadowWindows.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.4rem] border border-[rgba(87,157,174,0.16)] bg-[rgba(255,255,255,0.56)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--paper-ink)]">{item.title}</p>
                    <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.note}</p>
                </div>
              ))}
            </div>
          </StationPanel>

          <StationPanel className="control-panel rounded-[2.2rem] p-6">
            <SectionHeading
              kicker="Route Updates"
              title="新增路线材料"
              description="路线材料是当前阶段的导航层，不是生成后被遗忘的附件。"
            />
            <textarea
              className="station-input mt-5 min-h-40"
              placeholder="补一段阶段路线、剧情节点或下一章推进判断..."
              value={outlineDraft}
              onChange={(event) => setOutlineDraft(event.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0e1821]"
                onClick={async () => {
                  if (!outlineDraft.trim()) {
                    return;
                  }

                  await api.createOutline(novel.id, { content: outlineDraft });
                  const result = await api.getNovel(params.novelId);
                  setNovel(result);
                  setOutlineDraft("");
                }}
              >
                <Plus className="h-4 w-4" />
                保存为路线材料
              </button>
            </div>
          </StationPanel>

          <OutlinePanel outlines={novel.outlines} />
        </div>
      </section>
    </div>
  );
}
