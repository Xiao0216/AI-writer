"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookCheck,
  BookText,
  CheckCircle2,
  Radar,
  ShieldAlert,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";

import { GenerationDrawer } from "@/components/ai/generation-drawer";
import { SelectionActions } from "@/components/ai/selection-actions";
import { SensitiveWordPanel } from "@/components/compliance/sensitive-word-panel";
import { WriterEditor } from "@/components/editor/writer-editor";
import { api } from "@/lib/api";
import type { GenerationResponse, NovelDetail, ScanFinding } from "@/lib/types";
import { textToHtml } from "@/lib/word-count";

type Draft = {
  content: string;
  plainText: string;
};

export default function ChapterWritingPage() {
  const params = useParams<{ novelId: string; chapterId: string }>();
  const [novel, setNovel] = useState<NovelDetail | null>(null);
  const [draft, setDraft] = useState<Draft>({ content: "", plainText: "" });
  const [selectedText, setSelectedText] = useState("");
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [scanFindings, setScanFindings] = useState<ScanFinding[]>([]);
  const [completeMessage, setCompleteMessage] = useState("");

  useEffect(() => {
    let active = true;

    void (async () => {
      const nextNovel = await api.getNovel(params.novelId);
      const nextChapter = nextNovel.chapters.find((item) => item.id === params.chapterId);
      if (!active) {
        return;
      }

      setNovel(nextNovel);
      if (nextChapter) {
        setDraft({
          content: nextChapter.content || textToHtml(nextChapter.plainText),
          plainText: nextChapter.plainText,
        });
        const scan = await api.scanContent(nextChapter.plainText);
        if (active) {
          setScanFindings(scan.findings);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [params.chapterId, params.novelId]);

  const currentChapter = useMemo(
    () => novel?.chapters.find((item) => item.id === params.chapterId) ?? null,
    [novel, params.chapterId],
  );

  if (!novel || !currentChapter) {
    return <div className="text-sm text-stone-600">正在加载写作页...</div>;
  }

  const saveDraft = async (nextDraft: Draft) => {
    await api.updateChapter(novel.id, currentChapter.id, nextDraft);
    setDraft(nextDraft);
    const scan = await api.scanContent(nextDraft.plainText);
    setScanFindings(scan.findings);
  };

  return (
    <div className="space-y-6">
      <section className="control-panel overflow-hidden rounded-[2.6rem]">
        <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.15fr_0.85fr] xl:px-10 xl:py-10">
          <div>
            <p className="meta-kicker">Chapter War Room</p>
            <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
              {currentChapter.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
              先判断这一章要推进哪条线、承接哪笔债，再开始写。控制卡、角色切片和伏笔切片不是附件，而是正文推进的作战界面。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] px-4 py-2 text-sm text-stone-950">
                <BookText className="h-4 w-4 text-[var(--accent)]" />
                当前书目：{novel.title}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] px-4 py-2 text-sm text-stone-950">
                <ArrowRight className="h-4 w-4 text-[var(--accent-soft)]" />
                本章字数：{currentChapter.wordCount}
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <Radar className="h-5 w-5" />
                <p className="text-sm font-semibold">推进提醒</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">本章优先完成一件事：推动情节线，而不是只堆信息。写完后必须留下可写回的状态变化。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent-soft)]">
                <ShieldAlert className="h-5 w-5" />
                <p className="text-sm font-semibold">连续性护栏</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">人物行为、关系推进和伏笔回收必须有因果桥接，不能只靠一句“顺便提到”。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-5">
        <article className="control-panel rounded-[2rem] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="meta-kicker">Selection Controls</p>
              <h2 className="panel-title text-2xl font-semibold">正文局部推进</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                选中一段文字后，可以直接做扩写、缩写和改写，但所有动作都应服务本章控制卡，而不是脱离上下文单独修饰。
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-[rgba(255,252,247,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
              <div className="flex items-center gap-2 font-medium text-stone-950">
                <Swords className="h-4 w-4 text-[var(--accent)]" />
                章节任务优先
              </div>
              <p className="mt-2 leading-6">先解决推进问题，再谈语言微调。</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] px-4 py-2 text-stone-950">
              <Users className="h-4 w-4 text-[var(--accent-soft)]" />
              角色切片在右侧同步查看
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] px-4 py-2 text-stone-950">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              生成结果需回到正文作战目标
            </span>
          </div>
          <div className="mt-5">
            <SelectionActions
              hasSelection={Boolean(selectedText)}
              onPick={async (type) => {
                const generated = await api.generate({
                  novelId: novel.id,
                  chapterId: currentChapter.id,
                  type,
                  selectedText,
                });
                setResult(generated);
              }}
            />
          </div>
        </article>

        <WriterEditor
          initialContent={draft.content}
          novelWords={novel.totalWordCount}
          onDraftChange={setDraft}
          onSelectionChange={setSelectedText}
          onAutosave={saveDraft}
        />

        <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <article className="control-panel rounded-[2rem] p-5">
            <p className="meta-kicker">Control Card Status</p>
            <h2 className="panel-title text-xl font-semibold">本章作战提醒</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
              <p>1. 本章至少推进一条主线或支线，不允许只做设定补课。</p>
              <p>2. 主角核心性格必须在动作或对话中可见。</p>
              <p>3. 写完后必须进入写回动作，而不是只点保存。</p>
            </div>
          </article>

          <SensitiveWordPanel findings={scanFindings} />
        </div>

        <article className="control-panel rounded-[2rem] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="meta-kicker">Writeback Gate</p>
              <h2 className="panel-title text-xl font-semibold">完成本章与写回下一步</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                当前后端还没有完整的“完成章节”状态机，但前端已经把它显式抬出来。完成章节不等于点一次保存，而是准备进入动态状态写回和控制台更新。
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(139,30,30,0.18)]"
              onClick={async () => {
                await api.completeChapter(novel.id, currentChapter.id, {
                  completionNote: "前端触发完成章节",
                });
                const nextNovel = await api.getNovel(params.novelId);
                setNovel(nextNovel);
                setCompleteMessage("当前章已标记为已完成。下一步应补动态状态、角色变化和情节线推进摘要。");
              }}
            >
              <BookCheck className="h-4 w-4" />
              完成本章
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-medium text-stone-950">写回 1</p>
              <p className="mt-1">记录本章发生了什么，以及谁的状态变了。</p>
            </div>
            <div className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-medium text-stone-950">写回 2</p>
              <p className="mt-1">补关系变化、伏笔推进和下一章必须承接的债务。</p>
            </div>
            <div className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-medium text-stone-950">写回 3</p>
              <p className="mt-1">返回控制台后，应看到热度和提醒发生变化。</p>
            </div>
          </div>
          {completeMessage ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(139,30,30,0.08)] px-4 py-2 text-sm text-[var(--accent)]">
              <CheckCircle2 className="h-4 w-4" />
              {completeMessage}
            </div>
          ) : null}
        </article>
      </section>

      <section className="space-y-5">
        <GenerationDrawer
          outlines={novel.outlines}
          characters={novel.characters}
          result={result}
          onGenerate={async (payload) => {
            const generated = await api.generate({
              novelId: novel.id,
              chapterId: currentChapter.id,
              selectedText,
              ...payload,
            });
            setResult(generated);
          }}
          onInsert={(content) => {
            const plainText = [draft.plainText, content].filter(Boolean).join("\n\n");
            const nextDraft = {
              content: draft.content + textToHtml(content),
              plainText,
            };
            void saveDraft(nextDraft);
          }}
          onReplace={(content) => {
            const nextDraft = {
              content: textToHtml(content),
              plainText: content,
            };
            void saveDraft(nextDraft);
          }}
          onSaveAsOutline={async (content) => {
            await api.createOutline(novel.id, { content });
            const nextNovel = await api.getNovel(params.novelId);
            setNovel(nextNovel);
          }}
        />

        <article className="control-panel rounded-[2rem] p-6">
          <p className="meta-kicker">In-Play Context</p>
          <h2 className="panel-title text-2xl font-semibold">当前章上下文切片</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">角色压力</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">当前项目已登记 {novel.characters.length} 个角色，正文生成时应优先引用真正相关的人，而不是泛化人物。</p>
            </div>
            <div className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">大纲路线</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">当前已有 {novel.outlines.length} 版大纲，可作为本章推进的路线层，而不是生成后的附属备注。</p>
            </div>
          </div>
        </article>
      </section>
      </section>
    </div>
  );
}
