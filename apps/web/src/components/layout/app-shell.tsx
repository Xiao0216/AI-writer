"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import {
  Bell,
  BookOpenText,
  Crown,
  FolderKanban,
  LayoutDashboard,
  Orbit,
  Search,
  Settings,
  Target,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";

const LAST_PROJECT_KEY = "wenshu_last_project_id";
const LAST_CHAPTER_KEY = "wenshu_last_chapter_id";
const LAST_CHAPTER_PROJECT_KEY = "wenshu_last_chapter_project_id";
const CONTEXT_EVENT = "wenshu-context-change";
const EMPTY_CONTEXT_SNAPSHOT = "::";

function getNovelBase(pathname: string) {
  const match = pathname.match(/^\/novels\/([^/]+)/);
  return match ? `/novels/${match[1]}` : null;
}

function getNovelId(pathname: string) {
  const match = pathname.match(/^\/novels\/([^/]+)/);
  return match?.[1] ?? null;
}

function getChapterId(pathname: string) {
  const match = pathname.match(/\/chapters\/([^/]+)/);
  return match?.[1] ?? null;
}

function readStoredContextSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_CONTEXT_SNAPSHOT;
  }

  const projectId = window.localStorage.getItem(LAST_PROJECT_KEY);
  const chapterId = window.localStorage.getItem(LAST_CHAPTER_KEY);
  const chapterProjectId = window.localStorage.getItem(LAST_CHAPTER_PROJECT_KEY);
  const stableChapterId = chapterProjectId && chapterProjectId === projectId ? chapterId : null;
  return `${projectId ?? ""}::${stableChapterId ?? ""}`;
}

function subscribeToStoredContext(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(CONTEXT_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CONTEXT_EVENT, handler);
  };
}

function getSectionMeta(pathname: string) {
  if (pathname.startsWith("/membership")) {
    return {
      project: "能力控制中心",
      searchPlaceholder: "搜索能力或权益...",
      primaryLabel: "立即开通",
      secondaryLabel: "查看矩阵",
    };
  }

  if (pathname.includes("/chapters/")) {
    return {
      project: "章节控制局",
      searchPlaceholder: "全局搜索档案...",
      primaryLabel: "继续本章",
      secondaryLabel: "完成写回",
    };
  }

  if (pathname.endsWith("/memory")) {
    return {
      project: "写前回顾",
      searchPlaceholder: "搜索回顾信息...",
      primaryLabel: "生成回顾包",
      secondaryLabel: "切换视图",
    };
  }

  if (pathname.endsWith("/marathon")) {
    return {
      project: "自动续写台",
      searchPlaceholder: "搜索运行记录...",
      primaryLabel: "继续运行",
      secondaryLabel: "暂停介入",
    };
  }

  if (pathname.endsWith("/intake") || pathname.endsWith("/new")) {
    return {
      project: "启动立项流",
      searchPlaceholder: "搜索立项信息...",
      primaryLabel: "保存当前步骤",
      secondaryLabel: "返回上一步",
    };
  }

  if (/^\/novels\/[^/]+$/.test(pathname)) {
    return {
      project: "作品资料",
      searchPlaceholder: "检索作品资料...",
      primaryLabel: "检查资料一致性",
      secondaryLabel: "同步资料",
    };
  }

  return {
    project: "作品控制台",
    searchPlaceholder: "搜索档案或章节...",
    primaryLabel: "继续本章",
    secondaryLabel: "完成写回",
  };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const storedContextSnapshot = useSyncExternalStore(
    subscribeToStoredContext,
    readStoredContextSnapshot,
    () => EMPTY_CONTEXT_SNAPSHOT,
  );
  const [storedProjectIdRaw] = storedContextSnapshot.split("::");
  const storedProjectId = storedProjectIdRaw || null;
  const currentProjectId = getNovelId(pathname);
  const currentChapterId = getChapterId(pathname);
  const sectionMeta = getSectionMeta(pathname);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (currentProjectId) {
      window.localStorage.setItem(LAST_PROJECT_KEY, currentProjectId);
    }

    if (currentProjectId && currentChapterId) {
      window.localStorage.setItem(LAST_CHAPTER_KEY, currentChapterId);
      window.localStorage.setItem(LAST_CHAPTER_PROJECT_KEY, currentProjectId);
    }
    window.dispatchEvent(new Event(CONTEXT_EVENT));
  }, [currentChapterId, currentProjectId]);

  const targetProjectId = currentProjectId ?? storedProjectId;
  const novelBase = targetProjectId ? `/novels/${targetProjectId}` : getNovelBase(pathname);

  const navItems = [
    { href: "/dashboard", label: "总览", icon: LayoutDashboard, active: pathname.startsWith("/dashboard") || pathname === "/" },
    {
      href: novelBase ?? "/dashboard",
      label: "作品资料",
      icon: FolderKanban,
      active: /^\/novels\/[^/]+$/.test(pathname),
    },
    {
      href: targetProjectId ? `/novels/${targetProjectId}/chapters` : "/dashboard",
      label: "章节控制",
      icon: BookOpenText,
      active: pathname.includes("/chapters"),
      disabled: !targetProjectId,
    },
    {
      href: novelBase ? `${novelBase}/memory` : "/dashboard",
      label: "写前回顾",
      icon: Orbit,
      active: pathname.endsWith("/memory"),
      disabled: !novelBase,
    },
    {
      href: novelBase ? `${novelBase}/marathon` : "/dashboard",
      label: "自动续写",
      icon: Timer,
      active: pathname.endsWith("/marathon"),
      disabled: !novelBase,
    },
    { href: "/membership", label: "会员", icon: Crown, active: pathname.startsWith("/membership") },
  ];

  return (
    <div className="station-shell min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed left-0 top-0 z-[60] flex h-screen w-[88px] flex-col items-center space-y-8 border-r border-[rgba(85,67,54,0.2)] bg-[#1b2026] py-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(85,67,54,0.3)] bg-[rgba(255,183,125,0.14)]">
            <BookOpenText className="h-4 w-4 text-[var(--accent)]" />
          </div>
          <span className="font-serif text-lg font-bold text-[var(--accent)]">文枢AI</span>
        </div>

        <nav className="flex w-full flex-1 flex-col gap-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`flex flex-col items-center rounded-lg py-3 transition-colors ${
                  item.active
                    ? "border-l-2 border-[var(--accent)] bg-[rgba(53,58,64,0.3)] text-[var(--accent)]"
                    : item.disabled
                      ? "cursor-not-allowed text-slate-700"
                      : "text-slate-500 hover:bg-[rgba(53,58,64,0.5)] hover:text-slate-300"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                <span className="label-font text-[10px] tracking-tight">{item.label}</span>
              </div>
            );

            return item.disabled ? (
              <div key={item.label}>{content}</div>
            ) : (
              <Link key={item.href + item.label} href={item.href}>
                {content}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/settings"
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(85,67,54,0.3)] bg-[var(--background-elevated)] text-slate-400 hover:text-[var(--foreground)]"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </aside>

      <header className="fixed left-[88px] right-0 top-0 z-50 flex h-[72px] items-center justify-between border-b border-[rgba(85,67,54,0.1)] bg-[rgba(15,20,26,0.95)] px-8 shadow-sm shadow-black/20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center rounded-lg border border-[rgba(85,67,54,0.2)] bg-[var(--background-elevated)] px-4 py-2">
            <Search className="mr-2 h-4 w-4 text-slate-500" />
            <input
              className="label-font w-48 border-none bg-transparent text-xs text-[var(--foreground)] placeholder:text-slate-500 focus:outline-none"
              placeholder={sectionMeta.searchPlaceholder}
              type="text"
            />
          </div>
          <div className="h-4 w-px bg-[rgba(85,67,54,0.3)]" />
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-serif text-xl italic text-[var(--accent)]">文枢AI</span>
            <span className="label-font text-slate-600">|</span>
            <span>
              当前区域: <span className="text-[var(--foreground)]">{sectionMeta.project}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="label-font rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] px-5 py-2 text-xs font-bold text-[var(--paper-ink)] shadow-lg shadow-[rgba(207,141,53,0.12)] hover:opacity-90">
            {sectionMeta.primaryLabel}
          </button>
          <button className="label-font rounded-lg border border-[rgba(85,67,54,0.3)] bg-[var(--background-elevated)] px-5 py-2 text-xs text-[var(--foreground)]">
            {sectionMeta.secondaryLabel}
          </button>
          <div className="mx-1 h-6 w-px bg-[rgba(85,67,54,0.3)]" />
          <div className="flex items-center gap-4 text-slate-400">
            <Bell className="h-4 w-4 cursor-pointer hover:text-[var(--accent-cyan)]" />
            <Target className="h-4 w-4 cursor-pointer hover:text-[var(--accent-cyan)]" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,183,125,0.2)] bg-[var(--background-elevated)] text-[10px] text-[var(--foreground)]">
              ZE
            </div>
          </div>
        </div>
      </header>

      <main className="ml-[88px] min-h-screen pt-[72px]">
        <div className="mx-auto max-w-[1280px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
