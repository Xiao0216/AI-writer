import { ChapterRow } from "./chapter-row";

import type { Chapter } from "@/lib/types";

export function ChapterList({
  novelId,
  chapters,
}: {
  novelId: string;
  chapters: Chapter[];
}) {
  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <ChapterRow key={chapter.id} novelId={novelId} chapter={chapter} />
      ))}
    </div>
  );
}
