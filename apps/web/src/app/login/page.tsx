"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { QrCode } from "lucide-react";

import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [form, setForm] = useState({
    openid: "demo-writer",
    nickname: "试写作者",
    preferredGenre: "都市爽文",
  });
  const [message, setMessage] = useState("");
  const [loginError] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(window.location.search).get("error");
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="control-panel rounded-[2.6rem] px-8 py-8 lg:px-10 lg:py-10">
        <p className="meta-kicker">Author Access</p>
        <h1 className="panel-title mt-4 text-5xl font-semibold leading-tight tracking-[-0.05em] text-stone-950 lg:text-6xl">
          进入文枢AI，
          <br />
          先控住整本书。
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--ink-soft)] lg:text-lg">
          文枢AI 不是普通生成器。登录后，你进入的是长篇小说控制站：作品资料、章节控制卡、动态写回和连续性提醒都在一个工作面里运转。
        </p>
        <div className="mt-8 rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.76)] p-5 text-sm leading-7 text-[var(--ink-soft)]">
          <p className="font-medium text-stone-950">当前登录入口</p>
          <p className="mt-2">生产环境使用微信扫码登录；本地与测试环境保留开发快捷登录，用于联调和课程验收。</p>
        </div>
      </section>

      <section className="control-panel rounded-[2.6rem] px-8 py-8 lg:px-10 lg:py-10">
        <p className="meta-kicker">Login Modes</p>
        <h2 className="panel-title mt-2 text-3xl font-semibold">选择进入方式</h2>

        <a
          href={api.getWechatLoginUrl("login-page")}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#07C160] px-4 py-4 text-sm font-semibold text-white"
        >
          <QrCode className="h-4 w-4" />
          使用微信扫码登录
        </a>

        {api.enableDevLogin ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await api.login(form);
                router.push("/dashboard");
                router.refresh();
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "登录失败");
              }
            }}
          >
            <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-medium text-stone-950">开发环境快捷登录</p>
              <p className="mt-1">仅用于本地测试与课程验收，不等同于真实用户登录链路。</p>
            </div>
            <input
              className="w-full rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
              value={form.openid}
              onChange={(event) =>
                setForm((current) => ({ ...current, openid: event.target.value }))
              }
              placeholder="openid"
              required
            />
            <input
              className="w-full rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
              value={form.nickname}
              onChange={(event) =>
                setForm((current) => ({ ...current, nickname: event.target.value }))
              }
              placeholder="笔名"
            />
            <input
              className="w-full rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
              value={form.preferredGenre}
              onChange={(event) =>
                setForm((current) => ({ ...current, preferredGenre: event.target.value }))
              }
              placeholder="常写品类"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hydrated}
            >
              开发环境快捷登录
            </button>
          </form>
        ) : null}

        {loginError ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            微信登录失败：{loginError}
          </p>
        ) : null}

        {message ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{message}</p> : null}
      </section>
    </div>
  );
}
