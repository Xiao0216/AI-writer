"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        promise: projectOverview?.content.match(/核心承诺：(.*)/)?.[1] ?? theme?.content.match(/测试的问题：(.*)/)?.[1] ?? current.promise,
        protagonist: projectOverview?.content.match(/主角设定：(.*)/)?.[1] ?? theme?.content.match(/核心张力：(.*)/)?.[1] ?? current.protagonist,
        ending: projectOverview?.content.match(/结局方向：(.*)/)?.[1] ?? theme?.content.match(/代价与回响：(.*)/)?.[1] ?? current.ending,
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
      hint: "先写清楚这本书最想让读者持续追下去的承诺。",
      field: (
        <textarea
          className="min-h-32 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
          placeholder="这本书最想给读者的核心承诺是什么？"
          value={form.promise}
          onChange={(event) => setForm((current) => ({ ...current, promise: event.target.value }))}
        />
      ),
    },
    {
      title: "主角与核心张力",
      hint: "让主角的核心性格、矛盾和当前压力先站稳。",
      field: (
        <textarea
          className="min-h-32 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
          placeholder="主角是谁？他的核心性格与当前矛盾是什么？"
          value={form.protagonist}
          onChange={(event) => setForm((current) => ({ ...current, protagonist: event.target.value }))}
        />
      ),
    },
    {
      title: "结局方向",
      hint: "先决定希望把读者带向什么代价与回响。",
      field: (
        <textarea
          className="min-h-32 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
          placeholder="这本书最后希望把读者带到什么情绪与代价上？"
          value={form.ending}
          onChange={(event) => setForm((current) => ({ ...current, ending: event.target.value }))}
        />
      ),
    },
    {
      title: "风格锚点",
      hint: "风格不是美化项，而是后续控制卡和生成层的默认约束。",
      field: (
        <input
          className="rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
          placeholder="风格关键词"
          value={form.style}
          onChange={(event) => setForm((current) => ({ ...current, style: event.target.value }))}
        />
      ),
    },
    {
      title: "人物焦点",
      hint: "除了主角，还要先确定最先承压的关键人物关系。",
      field: (
        <textarea
          className="min-h-32 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
          placeholder="主角最先与谁形成张力？这个人物为什么重要？"
          value={form.castFocus}
          onChange={(event) => setForm((current) => ({ ...current, castFocus: event.target.value }))}
        />
      ),
    },
    {
      title: "第一章任务",
      hint: "先给第一章一个明确任务，避免一开写就失去控制。",
      field: (
        <textarea
          className="min-h-32 rounded-2xl border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3"
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
      content: [
        "# 项目总览",
        `- 核心承诺：${form.promise}`,
        `- 主角设定：${form.protagonist}`,
        `- 结局方向：${form.ending}`,
      ].join("\n"),
    });

    await api.updateNovelDocument(params.novelId, theme.id, {
      content: [
        "# 主题与命题",
        `- 这本书真正要测试的问题：${form.promise}`,
        `- 主角承受的核心张力：${form.protagonist}`,
        `- 最终代价与回响：${form.ending}`,
      ].join("\n"),
    });

    await api.updateNovelDocument(params.novelId, styleGuide.id, {
      content: [
        "# 风格指南",
        `- 当前建议风格：${form.style}`,
        "- 写作要求：先推进冲突，再补解释。",
      ].join("\n"),
    });

    await api.updateNovelDocument(params.novelId, castBible.id, {
      content: [
        "# 人物圣经",
        `- 当前人物焦点：${form.castFocus}`,
        `- 主角设定：${form.protagonist}`,
      ].join("\n"),
    });

    await api.updateNovelDocument(params.novelId, chapterRoadmap.id, {
      content: [
        "# 章节路线图",
        `- 第1章：${form.firstChapter}`,
        `- 当前结局方向：${form.ending}`,
      ].join("\n"),
    });

    setMessage("启动访谈已写入核心真相文件");
    router.push(`/novels/${params.novelId}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="control-panel rounded-[2.6rem] px-8 py-8 lg:px-10 lg:py-10">
        <p className="meta-kicker">Startup Intake</p>
        <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">启动访谈</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
          先对齐整本书的承诺、主角和结局方向，再进入章节推进。这里的答案会直接写入项目真相文件，而不是停留在表单里。
        </p>
      </section>

      <section className="control-panel rounded-[2rem] p-8">
        <div className="mb-6 grid gap-3 md:grid-cols-4">
          {steps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                step === index
                  ? "border-[rgba(139,30,30,0.28)] bg-[rgba(255,247,244,0.88)]"
                  : "border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.72)]"
              }`}
              onClick={() => setStep(index)}
            >
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">0{index + 1}</p>
              <p className="mt-2 font-medium text-stone-950">{item.title}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.6rem] bg-[rgba(255,252,247,0.72)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
            <p className="font-medium text-stone-950">{steps[step].title}</p>
            <p className="mt-1">{steps[step].hint}</p>
          </div>
          {steps[step].field}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3 text-sm font-semibold text-stone-900 disabled:opacity-40"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0}
            >
              上一步
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
                onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white"
                onClick={() => void saveIntake()}
              >
                写入真相文件并返回项目页
              </button>
            )}
          </div>
          {message ? <p className="text-sm text-[var(--ink-soft)]">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}
