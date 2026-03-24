"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api";

export default function NewNovelPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    genre: "都市",
    synopsis: "",
    targetWordCount: 500000,
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="control-panel rounded-[2.6rem] px-8 py-8 lg:px-10 lg:py-10">
        <p className="meta-kicker">Project Setup</p>
        <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">新建长篇项目</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
          这里录入的不是普通作品元信息，而是后续控制系统的起点。项目创建完成后，下一步应进入启动访谈和真相文件初始化，而不是直接盲写正文。
        </p>
      </section>

      <section className="control-panel rounded-[2rem] p-8">
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const novel = await api.createNovel(form);
            router.push(`/novels/${novel.id}`);
          }}
        >
          <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
            <p className="font-medium text-stone-950">立项提醒</p>
            <p className="mt-1">请先写清题材、承诺和目标规模。没有立项对齐，就不会有稳定的章节推进。</p>
          </div>
          <input
            className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
            placeholder="作品名称"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <input
            className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
            placeholder="作品品类"
            value={form.genre}
            onChange={(event) => setForm((current) => ({ ...current, genre: event.target.value }))}
            required
          />
          <textarea
            className="min-h-36 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
            placeholder="作品简介"
            value={form.synopsis}
            onChange={(event) =>
              setForm((current) => ({ ...current, synopsis: event.target.value }))
            }
          />
          <input
            className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
            type="number"
            value={form.targetWordCount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                targetWordCount: Number(event.target.value),
              }))
            }
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
          >
            创建长篇项目
          </button>
        </form>
      </section>
    </div>
  );
}
