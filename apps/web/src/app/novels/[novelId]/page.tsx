"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  FileText,
  Plus,
  Radar,
  ScrollText,
  Sparkles,
  Users,
} from "lucide-react";

import { OutlinePanel } from "@/components/ai/outline-panel";
import { ChapterList } from "@/components/chapter/chapter-list";
import { CharacterCard } from "@/components/character/character-card";
import { ExportButton } from "@/components/export/export-button";
import { api } from "@/lib/api";
import type { NovelDetail, NovelDocument } from "@/lib/types";

export default function NovelDetailPage() {
  const params = useParams<{ novelId: string }>();
  const [novel, setNovel] = useState<NovelDetail | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState("");
  const [documentDraft, setDocumentDraft] = useState("");
  const [documentMessage, setDocumentMessage] = useState("");
  const [chapterTitle, setChapterTitle] = useState("第一章");
  const [outlineDraft, setOutlineDraft] = useState("");

  useEffect(() => {
    let active = true;

    void (async () => {
      const result = await api.getNovel(params.novelId);
      if (active) {
        setNovel(result);
        if (result.documents[0]) {
          setActiveDocumentId(result.documents[0].id);
          setDocumentDraft(result.documents[0].content);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [params.novelId]);

  if (!novel) {
    return <div className="text-sm text-stone-600">正在加载作品...</div>;
  }

  const chapterCount = novel.chapters.length;
  const outlineCount = novel.outlines.length;
  const characterCount = novel.characters.length;
  const truthFiles = novel.documents;
  const activeDocument = truthFiles.find((file) => file.id === activeDocumentId) ?? truthFiles[0] ?? null;
  const formatTime = (value: string) =>
    new Date(value).toLocaleString("zh-CN", { hour12: false });
  const completionRatio = `${truthFiles.filter((file) => file.content.trim().length > 0).length}/${truthFiles.length}`;
  const documentStatus = (content: string) =>
    content.trim().length > 0 ? "已填写" : "待补齐";

  const documentCode = (type: NovelDocument["type"]) =>
    ({
      PROJECT_OVERVIEW: "00",
      THEME_AND_PROPOSITION: "01",
      WORLDBUILDING: "02",
      CAST_BIBLE: "03",
      RELATIONSHIP_MAP: "04",
      MAIN_PLOTLINES: "05",
      FORESHADOW_LEDGER: "06",
      CHAPTER_ROADMAP: "07",
      DYNAMIC_STATE: "08",
      STYLE_GUIDE: "09",
      WRITING_LOG: "LOG",
    })[type];

  return (
    <div className="space-y-6">
      <section className="control-panel overflow-hidden rounded-[2.6rem]">
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.2fr_0.8fr] xl:px-10 xl:py-10">
          <div>
            <p className="meta-kicker">Project Room</p>
            <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-6xl">
              {novel.title}
            </h1>
            <p className="mt-3 inline-flex items-center rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase text-[var(--ink-soft)]">
              {novel.genre}
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-soft)] lg:text-lg">
              {novel.synopsis || "这本书还没有正式写下作品简介。先明确故事承诺、核心人物和当前章节推进，再开始追求更快的写作速度。"}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/novels/${novel.id}/intake`}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] px-6 py-3 text-sm font-semibold text-stone-900"
              >
                启动访谈
              </Link>
              {novel.chapters[0] ? (
                <Link
                  href={`/novels/${novel.id}/chapters/${novel.chapters[0].id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(139,30,30,0.18)] hover:bg-[#741616]"
                >
                  进入当前作战章节
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
              <ExportButton novelId={novel.id} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <BookOpenText className="h-5 w-5" />
                <p className="text-sm font-semibold">章节推进</p>
              </div>
              <p className="mt-3 font-serif text-3xl text-stone-950">{chapterCount}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">当前已进入系统控制的章节数量。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent-soft)]">
                <ScrollText className="h-5 w-5" />
                <p className="text-sm font-semibold">路线材料</p>
              </div>
              <p className="mt-3 font-serif text-3xl text-stone-950">{outlineCount}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">大纲版本不是附件，而是当前写作的导航层。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <Users className="h-5 w-5" />
                <p className="text-sm font-semibold">角色压力</p>
              </div>
              <p className="mt-3 font-serif text-3xl text-stone-950">{characterCount}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">主角群越多，越需要在章节推进中保持回归和承压。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent-soft)]">
                <FileText className="h-5 w-5" />
                <p className="text-sm font-semibold">真相文件完成度</p>
              </div>
              <p className="mt-3 font-serif text-3xl text-stone-950">{completionRatio}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">至少补齐项目总览、主题命题、动态状态三份后，控制台信息才开始有真正参考价值。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
        <article className="control-panel rounded-[2rem] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="meta-kicker">Action Board</p>
              <h2 className="panel-title mt-2 text-2xl font-semibold">本书当前控制焦点</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
                当前建议优先检查章节路线是否完整、哪位核心人物太久未出现，以及下一章要承接哪条债务。
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[rgba(255,252,247,0.7)] px-5 py-4 text-sm text-[var(--ink-soft)]">
              <div className="flex items-center gap-2 font-medium text-stone-950">
                <Radar className="h-4 w-4 text-[var(--accent)]" />
                当前热度判断
              </div>
              <p className="mt-2 leading-6">如果本周新增章节不足 2 章，就优先补路线图和控制卡，而不是直接盲写。</p>
            </div>
          </div>
        </article>

        <article className="control-panel rounded-[2rem] p-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="meta-kicker">Chapter Operations</p>
              <h2 className="panel-title text-2xl font-semibold">章节推进台</h2>
              <p className="text-sm text-[var(--ink-soft)]">先明确下一章要推进什么，再点进正文作战室。</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="rounded-full border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-2 text-sm"
                value={chapterTitle}
                onChange={(event) => setChapterTitle(event.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
                onClick={async () => {
                  await api.createChapter(novel.id, { title: chapterTitle });
                  const result = await api.getNovel(params.novelId);
                  setNovel(result);
                }}
              >
                <Plus className="h-4 w-4" />
                添加章节
              </button>
            </div>
          </div>
          <ChapterList novelId={novel.id} chapters={novel.chapters} />
        </article>
      </section>

      <section className="space-y-6">
        <article className="control-panel rounded-[2rem] p-6">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="meta-kicker">Truth Files</p>
              <h2 className="panel-title text-2xl font-semibold">项目真相区</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                这些文件是整本书的真相源。现在已经支持真实读取与保存，下一步不再是“多写按钮”，而是让作者稳定维护这些核心文件。
              </p>
          <div className="mt-5 grid gap-3">
            {truthFiles.map((file) => (
              <button
                    key={file.id}
                    type="button"
                    className={`flex items-start justify-between gap-4 rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      activeDocument?.id === file.id
                        ? "border-[rgba(139,30,30,0.28)] bg-[rgba(255,247,244,0.88)]"
                        : "border-[rgba(48,35,24,0.1)] bg-[rgba(255,252,247,0.72)]"
                    }`}
                    onClick={() => {
                      setActiveDocumentId(file.id);
                      setDocumentDraft(file.content);
                      setDocumentMessage("");
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,30,30,0.08)] text-[var(--accent)]">
                        <FileText className="h-4 w-4" />
                      </div>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">{documentCode(file.type)}</p>
                      <p className="mt-1 font-medium text-stone-950">{file.title}</p>
                      <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase ${
                        file.content.trim().length > 0
                          ? "bg-[rgba(46,125,50,0.12)] text-[#2f6b2f]"
                          : "bg-[rgba(139,30,30,0.08)] text-[var(--accent)]"
                      }`}>
                        {documentStatus(file.content)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                        {file.content ? `${file.content.slice(0, 42)}...` : "当前还没有写入内容，建议优先补齐这一份真相文件。"}
                      </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--ink-soft)]">
                      {formatTime(file.updatedAt).slice(5, 16)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[1.4rem] bg-[rgba(255,252,247,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
              <div className="flex items-center gap-2 font-medium text-stone-950">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                下一步建议
              </div>
              <p className="mt-2 leading-6">优先补齐项目总览、人物圣经与动态状态三份核心文件，让章节推进建立在稳定真相源之上。</p>
            </div>
          </div>
        </article>

        {activeDocument ? (
          <article className="control-panel rounded-[2rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="meta-kicker">Truth File Workspace</p>
                <h2 className="panel-title text-2xl font-semibold">{activeDocument.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">这里是标准控制文件工作区。当前前端已经接入真实文档数据，可直接保存内容。</p>
                <p className="mt-2 text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-soft)]">
                  最后更新：{formatTime(activeDocument.updatedAt)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
                onClick={async () => {
                  const updated = await api.updateNovelDocument(novel.id, activeDocument.id, {
                    content: documentDraft,
                  });
                  setNovel((current) =>
                    current
                      ? {
                          ...current,
                          documents: current.documents.map((item) =>
                            item.id === updated.id ? updated : item,
                          ),
                        }
                      : current,
                  );
                  setDocumentMessage("已保存到项目真相文件");
                }}
              >
                保存文档
              </button>
            </div>
            <textarea
              className="mt-5 min-h-48 w-full rounded-[1.6rem] border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.78)] px-4 py-4 leading-7"
              value={documentDraft}
              onChange={(event) => setDocumentDraft(event.target.value)}
            />
            {documentMessage ? (
              <p className="mt-4 inline-flex items-center rounded-full bg-[rgba(46,125,50,0.12)] px-4 py-2 text-sm font-medium text-[#2f6b2f]">
                {documentMessage}
              </p>
            ) : null}
          </article>
        ) : null}

        <OutlinePanel outlines={novel.outlines} />

        <article className="control-panel rounded-[2rem] p-6">
          <p className="meta-kicker">Manual Outline</p>
          <h2 className="panel-title text-2xl font-semibold">补写一版人工路线图</h2>
          <textarea
            className="mt-4 min-h-40 w-full rounded-[1.6rem] border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.78)] px-4 py-3"
            placeholder="把你自己的主线拆解写在这里。"
            value={outlineDraft}
            onChange={(event) => setOutlineDraft(event.target.value)}
          />
          <button
            type="button"
            className="mt-4 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white"
            onClick={async () => {
              await api.createOutline(novel.id, { content: outlineDraft });
              setOutlineDraft("");
              const result = await api.getNovel(params.novelId);
              setNovel(result);
            }}
          >
            保存大纲版本
          </button>
        </article>

        <article className="control-panel rounded-[2rem] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="meta-kicker">Cast Pressure</p>
              <h2 className="panel-title text-2xl font-semibold">角色压力板</h2>
              <p className="text-sm text-[var(--ink-soft)]">角色不是资料卡片，而是后续章节必须持续承压的行动对象。</p>
            </div>
            <Link
              href={`/novels/${novel.id}/characters`}
              className="text-sm font-medium text-stone-900 underline underline-offset-4"
            >
              进入角色页
            </Link>
          </div>
          <div className="space-y-3">
            {novel.characters.slice(0, 3).map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        </article>
      </section>
      </section>
    </div>
  );
}
