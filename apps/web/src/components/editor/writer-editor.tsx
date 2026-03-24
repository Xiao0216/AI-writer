"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";

import { countWords } from "@/lib/word-count";

import { EditorStatusBar } from "./editor-status-bar";
import { EditorToolbar } from "./editor-toolbar";

type DraftPayload = {
  content: string;
  plainText: string;
};

export function WriterEditor({
  initialContent,
  novelWords,
  onDraftChange,
  onSelectionChange,
  onAutosave,
}: {
  initialContent: string;
  novelWords: number;
  onDraftChange?: (draft: DraftPayload) => void;
  onSelectionChange?: (selectedText: string) => void;
  onAutosave?: (draft: DraftPayload) => Promise<void>;
}) {
  const [saveState, setSaveState] = useState("自动保存已开启");
  const [chapterWords, setChapterWords] = useState(countWords(initialContent));
  const lastSavedRef = useRef(initialContent);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "min-h-[520px] px-6 py-6 prose prose-stone max-w-none focus:outline-none text-[1.02rem] leading-8",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const draft = {
        content: currentEditor.getHTML(),
        plainText: currentEditor.getText(),
      };
      setChapterWords(countWords(draft.plainText));
      onDraftChange?.(draft);
      setSaveState("有未保存修改");
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const selection = currentEditor.state.selection;
      const text = currentEditor.state.doc.textBetween(selection.from, selection.to, "\n");
      onSelectionChange?.(text.trim());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (lastSavedRef.current === initialContent) {
      return;
    }

    editor.commands.setContent(initialContent);
    lastSavedRef.current = initialContent;
  }, [editor, initialContent]);

  useEffect(() => {
    if (!editor || !onAutosave) {
      return;
    }

    const timer = window.setInterval(async () => {
      const content = editor.getHTML();
      if (content === lastSavedRef.current) {
        return;
      }

      setSaveState("保存中...");
      const payload = { content, plainText: editor.getText() };
      await onAutosave(payload);
      lastSavedRef.current = content;
      setSaveState("已自动保存");
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [editor, onAutosave]);

  const saveNow = async () => {
    if (!editor || !onAutosave) {
      return;
    }

    const payload = { content: editor.getHTML(), plainText: editor.getText() };
    setSaveState("保存中...");
    await onAutosave(payload);
    lastSavedRef.current = payload.content;
    setSaveState("已手动保存");
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-stone-300 bg-white/90 shadow-xl shadow-stone-900/5">
      <EditorToolbar editor={editor} onSave={saveNow} />
      <EditorContent editor={editor} />
      <EditorStatusBar
        chapterWords={chapterWords}
        novelWords={novelWords}
        saveState={saveState}
      />
    </div>
  );
}
