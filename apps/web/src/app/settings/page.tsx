"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void api.me().then(setUser).catch(() => setMessage("请先登录"));
  }, []);

  if (!user) {
    return <div className="text-sm text-stone-600">{message || "加载中..."}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="control-panel rounded-[2.6rem] px-8 py-8 lg:px-10 lg:py-10">
        <p className="meta-kicker">Author Profile</p>
        <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">作者设置</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
          这里记录你的长期创作偏好。它会影响后续项目启动访谈、章节控制卡和默认风格判断。
        </p>
      </section>

      <section className="control-panel rounded-[2rem] p-8">
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const updated = await api.updateProfile({
              nickname: user.nickname,
              preferredGenre: user.preferredGenre ?? "",
            });
            setUser(updated);
            setMessage("保存成功");
          }}
        >
          <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
            <p className="font-medium text-stone-950">长期偏好</p>
            <p className="mt-1">先把作者身份设清楚，后续章节推进和默认风格才会更稳定。</p>
          </div>
          <input
            className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
            value={user.nickname}
            onChange={(event) =>
              setUser((current) => (current ? { ...current, nickname: event.target.value } : current))
            }
          />
          <input
            className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
            value={user.preferredGenre ?? ""}
            onChange={(event) =>
              setUser((current) =>
                current ? { ...current, preferredGenre: event.target.value } : current,
              )
            }
            placeholder="常写品类"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
          >
            保存设置
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-[var(--ink-soft)]">{message}</p> : null}
      </section>
    </div>
  );
}
