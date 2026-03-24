"use client";

import { useState } from "react";

export function CharacterForm({
  onSubmit,
}: {
  onSubmit: (payload: {
    name: string;
    identity?: string;
    personality?: string;
    appearance?: string;
    background?: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    identity: "",
    personality: "",
    appearance: "",
    background: "",
  });

  return (
    <form
      className="control-panel grid gap-3 rounded-[2rem] p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(form);
        setForm({ name: "", identity: "", personality: "", appearance: "", background: "" });
      }}
    >
      <div className="rounded-[1.5rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
        <p className="font-medium text-stone-950">新增角色</p>
        <p className="mt-1">先把角色的身份、性格和背景写清楚，后续章节推进才有稳定的人物支点。</p>
      </div>
      <input
        className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
        placeholder="角色名"
        value={form.name}
        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        required
      />
      <input
        className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
        placeholder="身份"
        value={form.identity}
        onChange={(event) =>
          setForm((current) => ({ ...current, identity: event.target.value }))
        }
      />
      <input
        className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
        placeholder="性格"
        value={form.personality}
        onChange={(event) =>
          setForm((current) => ({ ...current, personality: event.target.value }))
        }
      />
      <input
        className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
        placeholder="外貌"
        value={form.appearance}
        onChange={(event) =>
          setForm((current) => ({ ...current, appearance: event.target.value }))
        }
      />
      <textarea
        className="min-h-28 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
        placeholder="背景故事"
        value={form.background}
        onChange={(event) =>
          setForm((current) => ({ ...current, background: event.target.value }))
        }
      />
      <button
        type="submit"
        className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
      >
        保存角色
      </button>
    </form>
  );
}
