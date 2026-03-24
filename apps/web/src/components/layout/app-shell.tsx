import Link from "next/link";
import { BookOpenText, Crown, PenTool, Settings } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "控制台", icon: BookOpenText },
  { href: "/membership", label: "能力层级", icon: Crown },
  { href: "/settings", label: "作者设置", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-stone-950">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(247,241,231,0.84)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-6 px-6 py-4 xl:px-10">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(145deg,_#221813,_#45271f)] text-stone-50 shadow-[0_12px_30px_rgba(58,30,23,0.22)]">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <p className="meta-kicker">Novel Control Station</p>
              <h1 className="font-serif text-xl font-semibold tracking-[-0.03em]">文枢AI</h1>
            </div>
          </Link>
          <div className="hidden min-w-[260px] flex-1 xl:block">
            <div className="rounded-full border border-[var(--border)] bg-[rgba(255,252,247,0.78)] px-4 py-2 text-sm text-[var(--ink-soft)]">
              今日默认目标：先定位整本书的下一步推进，再开始写这一章。
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,252,247,0.82)] px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition hover:-translate-y-0.5 hover:border-[rgba(139,30,30,0.35)] hover:text-stone-950"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1480px] px-6 py-10 xl:px-10">{children}</main>
    </div>
  );
}
