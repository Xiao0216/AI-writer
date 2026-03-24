"use client";

import { useState } from "react";

import type { Character, Outline } from "@/lib/types";

const options = [
  { value: "OUTLINE", label: "大纲生成" },
  { value: "OPENING", label: "开篇生成" },
  { value: "CONTINUATION", label: "章节续写" },
  { value: "INSPIRATION", label: "灵感生成" },
] as const;

type GenerationType =
  | "OUTLINE"
  | "OPENING"
  | "CONTINUATION"
  | "INSPIRATION"
  | "EXPAND"
  | "SHORTEN"
  | "REWRITE";

export function GenerationForm({
  outlines,
  characters,
  initialType = "CONTINUATION",
  onSubmit,
}: {
  outlines: Outline[];
  characters: Character[];
  initialType?: GenerationType;
  onSubmit: (payload: {
    type: GenerationType;
    outlineId?: string;
    characterIds: string[];
    instruction?: string;
  }) => Promise<void>;
}) {
  const [type, setType] = useState<GenerationType>(initialType);
  const [outlineId, setOutlineId] = useState("");
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [instruction, setInstruction] = useState("");

  const toggleCharacter = (id: string) => {
    setCharacterIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          type,
          outlineId: outlineId || undefined,
          characterIds,
          instruction: instruction || undefined,
        });
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-700">生成类型</span>
        <select
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
          value={type}
          onChange={(event) => setType(event.target.value as GenerationType)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-700">参考大纲</span>
        <select
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
          value={outlineId}
          onChange={(event) => setOutlineId(event.target.value)}
        >
          <option value="">不指定</option>
          {outlines.map((outline) => (
            <option key={outline.id} value={outline.id}>
              Version {outline.version}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-stone-700">相关角色</span>
        <div className="flex flex-wrap gap-2">
          {characters.map((character) => (
            <button
              key={character.id}
              type="button"
              className={`rounded-full px-3 py-2 text-sm transition ${
                characterIds.includes(character.id)
                  ? "bg-stone-900 text-stone-50"
                  : "border border-stone-300 bg-white text-stone-700"
              }`}
              onClick={() => toggleCharacter(character.id)}
            >
              {character.name}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-700">额外要求</span>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3"
          placeholder="比如：开头三段一定要直接抛出冲突，文风偏热血。"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-700"
      >
        生成内容
      </button>
    </form>
  );
}
