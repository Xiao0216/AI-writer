"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookCheck,
  CheckCircle2,
  CircleDot,
  Swords,
} from "lucide-react";

import { GenerationDrawer } from "@/components/ai/generation-drawer";
import { SelectionActions } from "@/components/ai/selection-actions";
import { SensitiveWordPanel } from "@/components/compliance/sensitive-word-panel";
import {
  ChecklistRow,
  SectionHeading,
  StationPanel,
  StatusBadge,
} from "@/components/control-station/station-kit";
import { WriterEditor } from "@/components/editor/writer-editor";
import { api } from "@/lib/api";
import {
  buildCharacterPressure,
  buildContinuityChecks,
  buildDebtItems,
  buildForeshadowWindows,
} from "@/lib/control-station";
import type { GenerationResponse, NovelDetail, ScanFinding } from "@/lib/types";
import { textToHtml } from "@/lib/word-count";

type Draft = {
  content: string;
  plainText: string;
};

export default function ChapterWritingPage() {
  const params = useParams<{ novelId: string; chapterId: string }>();
  const router = useRouter();
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
      } else if (active) {
        router.replace(`/novels/${params.novelId}/chapters`);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.chapterId, params.novelId, router]);

  const currentChapter = novel?.chapters.find((item) => item.id === params.chapterId) ?? null;

  if (!novel || !currentChapter) {
    return <div className="text-sm text-[var(--foreground)]/72">正在加载章节控制页...</div>;
  }

  const continuityChecks = buildContinuityChecks(novel, currentChapter);
  const debtItems = buildDebtItems(novel, currentChapter);
  const foreshadowWindows = buildForeshadowWindows(novel);
  const characterPressure = buildCharacterPressure(novel);

  const saveDraft = async (nextDraft: Draft) => {
    await api.updateChapter(novel.id, currentChapter.id, nextDraft);
    setDraft(nextDraft);
    const scan = await api.scanContent(nextDraft.plainText);
    setScanFindings(scan.findings);
  };

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-4 gap-6">
        <div className="rounded-lg border-l-2 border-[var(--accent)] bg-[var(--background-elevated)] p-5">
          <div className="label-font mb-1 text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Current Chapter
          </div>
          <div className="font-serif text-2xl text-[var(--foreground)]">{currentChapter.title}</div>
        </div>
        <div className="rounded-lg border-l-2 border-[var(--accent-cyan)] bg-[var(--background-elevated)] p-5">
          <div className="label-font mb-1 text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Running Phase
          </div>
          <div className="font-serif text-2xl text-[var(--accent-cyan)]">章节控制进行中</div>
        </div>
        <div className="rounded-lg bg-[var(--background-elevated)] p-5">
          <div className="label-font mb-1 text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Chapter Words
          </div>
          <div className="label-font text-2xl text-[var(--foreground)]">{currentChapter.wordCount}</div>
        </div>
        <div className="rounded-lg bg-[var(--background-elevated)] p-5">
          <div className="label-font mb-1 text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
            Closure Status
          </div>
          <div className="flex items-center justify-between">
            <span className="label-font text-2xl text-[var(--foreground)]">
              {currentChapter.status === "COMPLETED" ? "已写回" : "待闭环"}
            </span>
            <StatusBadge tone={currentChapter.status === "COMPLETED" ? "cyan" : "danger"}>
              {currentChapter.status === "COMPLETED" ? "closed" : "open"}
            </StatusBadge>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[320px_minmax(0,1fr)_360px] gap-8">
        <aside className="space-y-6">
          <StationPanel className="border-[rgba(85,67,54,0.16)] bg-[var(--background-elevated)] p-5">
            <div className="border-b border-[rgba(85,67,54,0.16)] pb-4">
              <h3 className="font-serif text-lg text-[var(--accent)]">章节战术简报</h3>
              <p className="label-font mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
                Tactical Operation Briefing
              </p>
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <label className="label-font flex items-center justify-between text-xs text-[var(--accent-cyan)]">
                  <span>章节核心任务</span>
                  <span className="rounded bg-[rgba(108,211,247,0.12)] px-1.5 py-0.5 text-[9px] font-bold">
                    pending
                  </span>
                </label>
                <div className="mt-3 rounded border-l-2 border-[var(--accent-cyan)] bg-[var(--background)] p-3 text-xs leading-relaxed text-[var(--foreground)]/80">
                  {debtItems[0]?.note ?? "本章需要推进主线，并留下明确的下一章承接债务。"}
                </div>
              </div>

              <div>
                <label className="label-font text-xs text-[var(--ink-muted)]">情节推进进度</label>
                <div className="mt-3 space-y-2">
                  {foreshadowWindows.slice(0, 2).map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded border border-[rgba(85,67,54,0.1)] bg-[rgba(255,255,255,0.03)] p-2"
                    >
                      <span className="text-xs text-[var(--foreground)]/84">{item.title}</span>
                      <span className="text-xs text-[var(--accent)]">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-font text-xs text-[var(--ink-muted)]">必须出场人物</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {characterPressure.map((item) => (
                    <span
                      key={item.name}
                      className={`rounded px-2 py-1 text-[11px] ${
                        item.tone === "amber"
                          ? "border border-[rgba(255,183,125,0.2)] bg-[rgba(255,183,125,0.08)] text-[var(--accent)]"
                          : item.tone === "cyan"
                            ? "border border-[rgba(108,211,247,0.2)] bg-[rgba(108,211,247,0.08)] text-[var(--accent-cyan)]"
                            : "border border-[rgba(85,67,54,0.2)] bg-[rgba(255,255,255,0.04)] text-[var(--foreground)]/70"
                      }`}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-font text-xs text-[var(--ink-muted)]">必须承接的伏笔 / 债务</label>
                <div className="mt-3 space-y-2">
                  {debtItems.map((item) => (
                    <div
                      key={item.title}
                      className="rounded border border-[rgba(85,67,54,0.1)] bg-[rgba(255,255,255,0.03)] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-[var(--foreground)]">{item.title}</span>
                        <StatusBadge tone={item.severity === "高" ? "danger" : item.severity === "中" ? "amber" : "paper"}>
                          {item.severity}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)]/70">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label-font text-[10px] text-[var(--ink-muted)]">本章冲突核心</label>
                <div className="rounded border border-[rgba(255,183,125,0.18)] bg-[rgba(255,183,125,0.06)] p-3 text-xs leading-relaxed text-[var(--foreground)]/78">
                  当前冲突必须让人物关系和主线推进同时发生变化，不能只是堆积信息或空转对话。
                </div>
              </div>
            </div>
          </StationPanel>

          <StationPanel className="border-[rgba(85,67,54,0.16)] bg-[rgba(153,27,27,0.08)] p-5">
            <div className="label-font mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-[#ffb4ab]">
              <Swords className="h-4 w-4" />
              连续性风险
            </div>
            <div className="space-y-3">
              {continuityChecks
                .filter((item) => !item.passed)
                .map((item) => (
                  <div key={item.label} className="rounded bg-[var(--background)] p-3">
                    <div className="label-font text-[10px] text-[var(--ink-muted)]">{item.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--foreground)]/78">{item.detail}</p>
                  </div>
                ))}
            </div>
          </StationPanel>
        </aside>

        <section className="space-y-5">
          <StationPanel className="border-[rgba(85,67,54,0.16)] bg-[var(--background-elevated)] p-5">
            <SectionHeading
              kicker="Selection Controls"
              title="正文局部推进"
              description="所有局部修改都必须服从章节控制卡，而不是脱离上下文的自由润色。"
            />
            <div className="mt-4 flex flex-wrap gap-3">
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
          </StationPanel>

          <div className="paper-texture overflow-hidden rounded-xl border border-[rgba(85,67,54,0.12)] bg-[#e5e2dd] text-[#1c1c19] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
            <WriterEditor
              initialContent={draft.content}
              novelWords={novel.totalWordCount}
              onDraftChange={setDraft}
              onSelectionChange={setSelectedText}
              onAutosave={saveDraft}
            />
          </div>
        </section>

        <aside className="space-y-5">
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

          <StationPanel className="border-[rgba(85,67,54,0.16)] bg-[var(--background-elevated)] p-5">
            <div className="label-font mb-4 text-xs uppercase tracking-tight text-[var(--ink-muted)]">
              人物切片 / Character Slice
            </div>
            <div className="space-y-3">
              {characterPressure.map((item) => (
                <div
                  key={item.name}
                  className={`rounded-xl border p-3 ${
                    item.tone === "amber"
                      ? "border-[rgba(255,183,125,0.4)] bg-[rgba(53,58,64,0.95)]"
                      : item.tone === "cyan"
                        ? "border-[rgba(108,211,247,0.3)] bg-[rgba(53,58,64,0.75)]"
                        : "border-[rgba(85,67,54,0.24)] bg-[rgba(37,42,49,0.9)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">
                        {item.role}
                      </p>
                    </div>
                    <CircleDot
                      className={`h-4 w-4 ${
                        item.tone === "amber"
                          ? "text-[var(--accent)]"
                          : item.tone === "cyan"
                            ? "text-[var(--accent-cyan)]"
                            : "text-[var(--ink-muted)]"
                      }`}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/72">{item.cue}</p>
                </div>
              ))}
            </div>
          </StationPanel>

          <StationPanel className="border-[rgba(85,67,54,0.16)] bg-[var(--background-elevated)] p-5">
            <div className="label-font mb-4 text-xs uppercase tracking-tight text-[var(--ink-muted)]">
              伏笔窗口 / Foreshadow
            </div>
            <div className="space-y-3">
              {foreshadowWindows.map((item) => (
                <div key={item.title} className="rounded bg-[rgba(255,255,255,0.03)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                    <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/72">{item.note}</p>
                </div>
              ))}
            </div>
          </StationPanel>

          <StationPanel className="border-[rgba(85,67,54,0.16)] bg-[var(--background-elevated)] p-5">
            <div className="label-font mb-4 text-xs uppercase tracking-tight text-[var(--ink-muted)]">
              连续性检查
            </div>
            <div className="space-y-3">
              {continuityChecks.map((item) => (
                <ChecklistRow
                  key={item.label}
                  label={item.label}
                  detail={item.detail}
                  passed={item.passed}
                />
              ))}
            </div>
          </StationPanel>

          <SensitiveWordPanel findings={scanFindings} />

          <StationPanel className="border-[rgba(255,183,125,0.24)] bg-[rgba(255,183,125,0.06)] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label-font mb-2 text-xs uppercase tracking-tight text-[var(--ink-muted)]">
                  完成并写回
                </div>
                <p className="text-sm leading-6 text-[var(--foreground)]/80">
                  完成章节不等于保存正文，而是要把事件、人物变化、关系变化和下章债务一起写回。
                </p>
              </div>
              <button
                type="button"
                className="label-font rounded bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] px-4 py-2 text-xs font-bold text-[var(--paper-ink)] shadow-lg shadow-[rgba(255,183,125,0.2)]"
                onClick={async () => {
                  await api.completeChapter(novel.id, currentChapter.id, {
                    completionNote: "前端触发完成章节",
                  });
                  const nextNovel = await api.getNovel(params.novelId);
                  setNovel(nextNovel);
                  setCompleteMessage(
                    "当前章已标记为完成。下一步请补动态状态、关系变化、伏笔账本与下章债务。",
                  );
                }}
              >
                <BookCheck className="mr-2 inline h-4 w-4" />
                完成并写回
              </button>
            </div>
            {completeMessage ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs text-[var(--foreground)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                {completeMessage}
              </div>
            ) : null}
          </StationPanel>
        </aside>
      </section>
    </div>
  );
}
