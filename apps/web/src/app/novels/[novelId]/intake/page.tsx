"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpenText, FileText, Flag, LibraryBig } from "lucide-react";

import { SectionHeading, StationPanel, StatusBadge } from "@/components/control-station/station-kit";
import { api } from "@/lib/api";
import type { NovelDocument } from "@/lib/types";

type IntakeForm = {
  promise: string;
  protagonist: string;
  ending: string;
  style: string;
  firstChapter: string;
  castFocus: string;
};

export default function NovelIntakePage() {
  const params = useParams<{ novelId: string }>();
  const router = useRouter();
  const [documents, setDocuments] = useState<NovelDocument[]>([]);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeForm>({
    promise: "",
    protagonist: "",
    ending: "",
    style: "悬疑、克制、持续承压",
    firstChapter: "第一章先制造明确冲突，并留下一笔必须追查的债务。",
    castFocus: "主角需要一个最先形成张力的对手或镜像人物。",
  });

  useEffect(() => {
    void api.listNovelDocuments(params.novelId).then((nextDocuments) => {
      setDocuments(nextDocuments);

      const projectOverview = nextDocuments.find((item) => item.type === "PROJECT_OVERVIEW");
      const theme = nextDocuments.find((item) => item.type === "THEME_AND_PROPOSITION");
      const styleGuide = nextDocuments.find((item) => item.type === "STYLE_GUIDE");
      const castBible = nextDocuments.find((item) => item.type === "CAST_BIBLE");
      const chapterRoadmap = nextDocuments.find((item) => item.type === "CHAPTER_ROADMAP");

      setForm((current) => ({
        ...current,
        promise:
          projectOverview?.content.match(/核心承诺：(.*)/)?.[1] ??
          theme?.content.match(/测试的问题：(.*)/)?.[1] ??
          current.promise,
        protagonist:
          projectOverview?.content.match(/主角设定：(.*)/)?.[1] ??
          theme?.content.match(/核心张力：(.*)/)?.[1] ??
          current.protagonist,
        ending:
          projectOverview?.content.match(/结局方向：(.*)/)?.[1] ??
          theme?.content.match(/代价与回响：(.*)/)?.[1] ??
          current.ending,
        style: styleGuide?.content.match(/当前建议风格：(.*)/)?.[1] ?? current.style,
        castFocus: castBible?.content.match(/当前人物焦点：(.*)/)?.[1] ?? current.castFocus,
        firstChapter: chapterRoadmap?.content.match(/第1章：(.*)/)?.[1] ?? current.firstChapter,
      }));
    });
  }, [params.novelId]);

  const getDocument = (type: NovelDocument["type"]) =>
    documents.find((item) => item.type === type);

  const steps = [
    {
      title: "核心承诺",
      hint: "先写清楚这本书为什么值得读者一路追下去。",
      icon: <Flag className="h-4 w-4 text-[var(--accent-strong)]" />,
      field: (
        <textarea
          className="station-input min-h-36"
          placeholder="这本书最想给读者的持续承诺是什么？"
          value={form.promise}
          onChange={(event) => setForm((current) => ({ ...current, promise: event.target.value }))}
        />
      ),
    },
    {
      title: "主角与核心张力",
      hint: "主角必须先站稳，后续控制卡和章节推进才有锚点。",
      icon: <LibraryBig className="h-4 w-4 text-[var(--accent-cyan)]" />,
      field: (
        <textarea
          className="station-input min-h-36"
          placeholder="主角是谁？他的性格、矛盾和当前压力是什么？"
          value={form.protagonist}
          onChange={(event) => setForm((current) => ({ ...current, protagonist: event.target.value }))}
        />
      ),
    },
    {
      title: "结局方向",
      hint: "结局方向会决定中段如何布债、如何回收、如何让代价成立。",
      icon: <ArrowRight className="h-4 w-4 text-[var(--accent-strong)]" />,
      field: (
        <textarea
          className="station-input min-h-36"
          placeholder="最后希望把读者带向什么情绪与代价？"
          value={form.ending}
          onChange={(event) => setForm((current) => ({ ...current, ending: event.target.value }))}
        />
      ),
    },
    {
      title: "风格护栏",
      hint: "风格不是美化项，而是后续生成与续写的硬约束。",
      icon: <FileText className="h-4 w-4 text-[var(--accent-cyan)]" />,
      field: (
        <input
          className="station-input"
          placeholder="风格关键词"
          value={form.style}
          onChange={(event) => setForm((current) => ({ ...current, style: event.target.value }))}
        />
      ),
    },
    {
      title: "人物焦点",
      hint: "除了主角，还要先决定谁是最早形成张力的人物。",
      icon: <LibraryBig className="h-4 w-4 text-[var(--accent-cyan)]" />,
      field: (
        <textarea
          className="station-input min-h-36"
          placeholder="主角会先和谁形成张力？为什么？"
          value={form.castFocus}
          onChange={(event) => setForm((current) => ({ ...current, castFocus: event.target.value }))}
        />
      ),
    },
    {
      title: "第一章任务",
      hint: "先给第一章一个明确任务，避免一开写就失去控制。",
      icon: <BookOpenText className="h-4 w-4 text-[var(--accent-strong)]" />,
      field: (
        <textarea
          className="station-input min-h-36"
          placeholder="第一章必须推进什么？要留下什么钩子或债务？"
          value={form.firstChapter}
          onChange={(event) => setForm((current) => ({ ...current, firstChapter: event.target.value }))}
        />
      ),
    },
  ];

  const saveIntake = async () => {
    const projectOverview = getDocument("PROJECT_OVERVIEW");
    const theme = getDocument("THEME_AND_PROPOSITION");
    const styleGuide = getDocument("STYLE_GUIDE");
    const castBible = getDocument("CAST_BIBLE");
    const chapterRoadmap = getDocument("CHAPTER_ROADMAP");

    if (!projectOverview || !theme || !styleGuide || !castBible || !chapterRoadmap) {
      setMessage("启动访谈所需文档不存在");
      return;
    }

    await api.updateNovelDocument(params.novelId, projectOverview.id, {
      content: ["# 项目总览", `- 核心承诺：${form.promise}`, `- 主角设定：${form.protagonist}`, `- 结局方向：${form.ending}`].join("\n"),
    });
    await api.updateNovelDocument(params.novelId, theme.id, {
      content: ["# 主题与命题", `- 这本书真正要测试的问题：${form.promise}`, `- 主角承受的核心张力：${form.protagonist}`, `- 最终代价与回响：${form.ending}`].join("\n"),
    });
    await api.updateNovelDocument(params.novelId, styleGuide.id, {
      content: ["# 风格指南", `- 当前建议风格：${form.style}`, "- 写作要求：先推进冲突，再补解释。"].join("\n"),
    });
    await api.updateNovelDocument(params.novelId, castBible.id, {
      content: ["# 人物圣经", `- 当前人物焦点：${form.castFocus}`, `- 主角设定：${form.protagonist}`].join("\n"),
    });
    await api.updateNovelDocument(params.novelId, chapterRoadmap.id, {
      content: ["# 章节路线图", `- 第1章：${form.firstChapter}`, `- 当前结局方向：${form.ending}`].join("\n"),
    });

    setMessage("启动访谈已写入核心作品资料");
    router.push(`/novels/${params.novelId}`);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <section className="station-hero station-frame overflow-hidden rounded-[2.8rem] px-8 py-8 xl:px-10 xl:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.16fr_0.84fr]">
          <div>
            <p className="meta-kicker text-[var(--ink-muted)]">Startup Intake Flow</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.05em] text-[var(--foreground)] lg:text-5xl">
              启动立项流
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(232,223,210,0.8)]">
              这里不是普通新建项目表单，而是整本书的第一次控制对齐。访谈答案会直接写入作品资料，
              成为后续章节控制、写前回顾和自动续写的约束来源。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge tone="amber">先对齐，再开写</StatusBadge>
              <StatusBadge tone="cyan">作品资料是真相源</StatusBadge>
              <StatusBadge tone="paper">立项流不是一次性表单</StatusBadge>
            </div>
          </div>

          <StationPanel tone="paper" className="bg-[rgba(252,249,243,0.94)]">
            <SectionHeading
              kicker="Workflow"
              title="本页完成后"
              description="写入作品资料，再返回项目页，而不是直接跳去盲写。"
            />
            <div className="mt-5 grid gap-3 text-sm text-[var(--paper-ink)]">
              <p>1. 写入项目总览、主题命题、风格指南。</p>
              <p>2. 写入人物圣经和章节路线图。</p>
              <p>3. 回到作品资料继续维护控制文件。</p>
            </div>
          </StationPanel>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.74fr_1.26fr]">
        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Step Rail"
            title="立项步骤"
            description="每一步都服务于后续控制，不是装饰性资料填写。"
          />
          <div className="mt-5 grid gap-3">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  step === index
                    ? "border-[rgba(207,141,53,0.3)] bg-[rgba(255,243,224,0.8)]"
                    : "border-[rgba(43,56,67,0.08)] bg-[rgba(252,249,243,0.8)]"
                }`}
                onClick={() => setStep(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.62)] text-[var(--paper-ink)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--ink-soft)]">
                      0{index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--paper-ink)]">{item.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </StationPanel>

        <StationPanel className="control-panel rounded-[2.2rem] p-6">
          <SectionHeading
            kicker="Current Step"
            title={steps[step].title}
            description={steps[step].hint}
          />
          <div className="mt-5">{steps[step].field}</div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-[rgba(43,56,67,0.14)] bg-[rgba(252,249,243,0.82)] px-4 py-3 text-sm font-semibold text-[var(--paper-ink)] disabled:opacity-40"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0}
            >
              上一步
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0e1821]"
                onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#0e1821]"
                onClick={() => void saveIntake()}
              >
                保存作品资料并返回项目页
              </button>
            )}
          </div>

          {message ? <p className="mt-4 text-sm text-[var(--accent-strong)]">{message}</p> : null}
        </StationPanel>
      </section>
    </div>
  );
}
