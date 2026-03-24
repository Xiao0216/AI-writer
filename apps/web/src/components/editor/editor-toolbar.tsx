"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, List, Pilcrow, Save } from "lucide-react";

const baseButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(48,35,24,0.14)] bg-[rgba(255,252,247,0.82)] text-stone-700 transition hover:border-[rgba(139,30,30,0.28)] hover:text-stone-950";

export function EditorToolbar({
  editor,
  onSave,
}: {
  editor: Editor | null;
  onSave: () => void;
}) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(48,35,24,0.1)] px-4 py-3">
      <button
        type="button"
        className={baseButton}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={baseButton}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={baseButton}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={baseButton}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#741616]"
        onClick={onSave}
      >
        <Save className="h-4 w-4" />
        立即保存
      </button>
    </div>
  );
}
