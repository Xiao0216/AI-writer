import { UserRound } from "lucide-react";

import type { Character } from "@/lib/types";

export function CharacterCard({
  character,
  onDelete,
}: {
  character: Character;
  onDelete?: () => Promise<void>;
}) {
  return (
    <article className="rounded-[1.75rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.78)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,_#221813,_#45271f)] text-stone-50">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-semibold">{character.name}</h4>
            <p className="text-sm text-[var(--ink-soft)]">{character.identity || "未设定身份"}</p>
          </div>
        </div>
        {onDelete ? (
          <button
            type="button"
            className="text-sm text-rose-600"
            onClick={() => void onDelete()}
          >
            删除
          </button>
        ) : null}
      </div>
      <div className="mt-4 space-y-2 text-sm leading-7 text-[var(--ink-soft)]">
        <p>性格：{character.personality || "未设定"}</p>
        <p>外貌：{character.appearance || "未设定"}</p>
        <p>背景：{character.background || "未设定"}</p>
      </div>
    </article>
  );
}
