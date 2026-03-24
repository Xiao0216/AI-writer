"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, UserPlus } from "lucide-react";

import { CharacterCard } from "@/components/character/character-card";
import { CharacterForm } from "@/components/character/character-form";
import { api } from "@/lib/api";
import type { Character } from "@/lib/types";

export default function CharacterPage() {
  const params = useParams<{ novelId: string }>();
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const nextCharacters = await api.listCharacters(params.novelId);
      if (active) {
        setCharacters(nextCharacters);
      }
    })();

    return () => {
      active = false;
    };
  }, [params.novelId]);

  return (
    <div className="space-y-6">
      <section className="control-panel overflow-hidden rounded-[2.6rem] px-8 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="meta-kicker">Cast Pressure Board</p>
            <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">角色压力板</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
              角色不是静态资料。这里记录的每个人，后续都应该回到章节推进里承受冲突、债务和关系变化。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent)]">
                <Users className="h-5 w-5" />
                <p className="text-sm font-semibold">角色总数</p>
              </div>
              <p className="mt-3 font-serif text-3xl text-stone-950">{characters.length}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">角色越多，越需要在章节推进时保持回归与一致性。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] p-5">
              <div className="flex items-center gap-3 text-[var(--accent-soft)]">
                <UserPlus className="h-5 w-5" />
                <p className="text-sm font-semibold">当前任务</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">给每个角色补齐身份、性格和背景，避免后续 AI 把角色写成只有名字的人形道具。</p>
            </article>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <CharacterForm
          onSubmit={async (payload) => {
            await api.createCharacter(params.novelId, payload);
            const nextCharacters = await api.listCharacters(params.novelId);
            setCharacters(nextCharacters);
          }}
        />
        <section className="grid gap-4">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onDelete={async () => {
                await api.deleteCharacter(params.novelId, character.id);
                const nextCharacters = await api.listCharacters(params.novelId);
                setCharacters(nextCharacters);
              }}
            />
          ))}
        </section>
      </div>
    </div>
  );
}
