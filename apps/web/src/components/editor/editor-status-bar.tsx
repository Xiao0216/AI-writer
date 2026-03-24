export function EditorStatusBar({
  chapterWords,
  novelWords,
  saveState,
}: {
  chapterWords: number;
  novelWords: number;
  saveState: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(48,35,24,0.1)] bg-[rgba(255,252,247,0.62)] px-4 py-3 text-sm text-[var(--ink-soft)]">
      <span>当前章节 {chapterWords} 字</span>
      <span>全书 {novelWords} 字</span>
      <span className="rounded-full bg-[rgba(139,30,30,0.08)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
        {saveState}
      </span>
    </div>
  );
}
