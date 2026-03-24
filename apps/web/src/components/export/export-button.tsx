"use client";

import { Download } from "lucide-react";

import { api } from "@/lib/api";

export function ExportButton({ novelId }: { novelId: string }) {
  const handleClick = async () => {
    const result = await api.exportNovel(novelId);
    const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-2 text-sm font-medium text-stone-700"
      onClick={() => void handleClick()}
    >
      <Download className="h-4 w-4" />
      导出 TXT
    </button>
  );
}
