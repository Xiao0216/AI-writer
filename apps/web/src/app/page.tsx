import Link from "next/link";
import { ArrowRight, Flame, Radar, ScrollText, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="control-panel overflow-hidden rounded-[2.8rem]">
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.25fr_0.75fr] xl:px-12 xl:py-12">
          <div>
            <p className="meta-kicker">Long-Form Fiction Control</p>
            <h1 className="panel-title mt-4 max-w-4xl text-5xl leading-tight font-semibold tracking-[-0.05em] text-stone-950 lg:text-7xl">
              不是帮你写一段，
              <br />
              是帮你把整本书控住。
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-[var(--ink-soft)]">
              文枢AI 面向中文长篇小说作者，把项目真相文件、章节控制卡、动态写回、情节线热度与角色回归提醒整合进同一个创作控制站。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(139,30,30,0.18)] hover:bg-[#741616]"
              >
                进入控制站
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] px-6 py-3 text-sm font-semibold text-stone-900"
              >
                查看控制台样式
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: Radar,
                title: "情节线热度",
                body: "不是只看字数，而是判断哪条主线在升温、哪条支线在变冷。",
              },
              {
                icon: Users,
                title: "角色回归提醒",
                body: "角色不是资料卡，必须持续回到剧情压力里，防止只存在于设定页。",
              },
              {
                icon: ScrollText,
                title: "动态写回",
                body: "每一章写完都要更新整本书的状态，否则长篇会在中期失控。",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.8)] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(201,143,74,0.14)] text-[var(--accent-soft)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="panel-title mt-5 text-2xl font-semibold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="control-panel rounded-[2rem] p-6">
          <p className="meta-kicker">Workflow</p>
          <h2 className="panel-title text-2xl font-semibold">产品主链路</h2>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--ink-soft)] md:grid-cols-2">
            <p>1. 创建项目，先完成启动访谈。</p>
            <p>2. 生成并确认真相文件，而不是直接写正文。</p>
            <p>3. 从控制台进入本章控制卡，再进入正文作战室。</p>
            <p>4. 完成章节后强制写回，让整本书状态继续可控。</p>
          </div>
        </article>
        <article className="control-panel rounded-[2rem] p-6">
          <p className="meta-kicker">Positioning</p>
          <h2 className="panel-title text-2xl font-semibold">这不是普通 AI 写作工具</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
            <p>文枢AI 不把“段落生成”当核心，而是把整本书当作操作对象。</p>
            <p>它的目标是帮助作者稳定推进 30 万到 300 万字项目，而不是只给一段看起来像小说的文字。</p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(139,30,30,0.08)] px-4 py-2 text-[var(--accent)]">
              <Flame className="h-4 w-4" />
              先控制，再生成。
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
