"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { api } from "@/lib/api";

export default function ChapterEntryPage() {
  const params = useParams<{ novelId: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("正在定位章节控制页...");

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const novel = await api.getNovel(params.novelId);
        if (!active) {
          return;
        }

        const targetChapter =
          novel.chapters[0] ??
          (await api.createChapter(params.novelId, {
            title: "第1章",
          }));

        if (!novel.chapters[0]) {
          setMessage("项目还没有章节，正在创建首章并进入章节控制页...");
        }

        router.replace(`/novels/${params.novelId}/chapters/${targetChapter.id}`);
      } catch (error) {
        if (!active) {
          return;
        }

        setMessage(error instanceof Error ? error.message : "章节控制页加载失败");
      }
    })();

    return () => {
      active = false;
    };
  }, [params.novelId, router]);

  return <div className="text-sm text-[var(--foreground)]/72">{message}</div>;
}
