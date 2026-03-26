"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { MembershipCard } from "@/components/membership/membership-card";
import { StatusBadge } from "@/components/control-station/station-kit";
import { api } from "@/lib/api";
import type { MembershipStatus, PaymentOrder, PaymentPlan } from "@/lib/types";

export default function MembershipPage() {
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void Promise.all([api.membership(), api.getMembershipPlan()])
      .then(([currentMembership, currentPlan]) => {
        setMembership(currentMembership);
        setPlan(currentPlan);
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "会员信息加载失败");
      });
  }, []);

  useEffect(() => {
    if (!order?.codeUrl) {
      setQrCodeUrl("");
      return;
    }

    let active = true;
    void QRCode.toDataURL(order.codeUrl, { margin: 1, width: 280 })
      .then((nextUrl) => {
        if (active) {
          setQrCodeUrl(nextUrl);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeUrl("");
        }
      });

    return () => {
      active = false;
    };
  }, [order?.codeUrl]);

  useEffect(() => {
    if (!order || order.status !== "PENDING") {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshOrder(order.id);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [order]);

  const refreshOrder = async (orderId: string) => {
    const nextOrder = await api.getPaymentOrder(orderId);
    setOrder(nextOrder);

    if (nextOrder.status === "PAID") {
      const nextMembership = await api.membership();
      setMembership(nextMembership);
      setMessage("支付成功，会员权益已到账。");
    }

    return nextOrder;
  };

  if (!membership) {
    return <div className="text-sm text-[var(--foreground)]/72">{message || "请先登录后查看会员状态。"}</div>;
  }

  const handleUpgrade = async () => {
    setPending(true);
    setMessage("");
    try {
      const nextOrder = await api.createMembershipOrder();
      setOrder(nextOrder);
      if (nextOrder.status === "PAID") {
        const nextMembership = await api.membership();
        setMembership(nextMembership);
        setMessage("支付成功，会员已开通。");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建支付订单失败");
    } finally {
      setPending(false);
    }
  };

  const handleRefreshOrder = async () => {
    if (!order) {
      return;
    }

    setPending(true);
    try {
      await refreshOrder(order.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "刷新支付状态失败");
    } finally {
      setPending(false);
    }
  };

  const tiers = [
    {
      code: "体验者 / Explorer",
      name: "初试锋芒",
      description: "适合短篇创作与灵感原型构建。",
      tone: "default",
      items: ["单项目作品资料", "基础逻辑一致性检查", "每日 2k 字逻辑建议"],
      cta: membership.membershipType === "FREE" ? "当前计划" : "可降级体验",
    },
    {
      code: "专业作者 / Architect",
      name: "长篇主宰",
      description: "为百万字长篇提供的精密控制终端。",
      tone: "featured",
      items: ["全量作品资料", "深层因果链写回同步", "动态伏笔追踪与提醒", "专属写前回顾视图"],
      cta: membership.membershipType === "MEMBER" ? "当前已开通" : "升级控制权",
    },
    {
      code: "自动续写 / Studio",
      name: "工业集群",
      description: "多项目、多角色、多护栏的持续连载中枢。",
      tone: "default",
      items: ["自动推进监控台", "全栈图式控制", "私有化风格档案注入"],
      cta: "联系档案局",
    },
  ];

  const capabilityRows = [
    ["检查深度", "仅当前章节", "跨卷因果校验", "全文本实时解算"],
    ["写回同步", "手动更新", "自动感知并确认", "原子化自动同步"],
    ["图式控制", "标准模板", "可自定义 3 个维度", "无限制自定义维度"],
    ["伏笔管理", "基础标记", "智能回收提醒", "多维网络分析"],
    ["角色心智模型", "—", "支持 5 名核心角色", "支持全剧组成员"],
  ] as const;

  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-5xl text-center">
        <div className="inline-flex rounded-full border border-[rgba(255,183,125,0.24)] bg-[rgba(255,183,125,0.1)] px-4 py-1 text-[11px] font-semibold tracking-[0.26em] uppercase text-[var(--accent)]">
          Sovereign Workspace Architecture
        </div>
        <h1 className="mt-8 font-serif text-5xl font-semibold leading-tight tracking-[-0.05em] text-[var(--foreground)] lg:text-6xl">
          不是多给你几次生成，
          <br />
          <span className="italic text-[var(--accent)]">而是让整本书更稳地写下去。</span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[rgba(232,223,210,0.72)]">
          文枢AI 升级的是长篇控制能力：更深的作品资料、更稳的连续性检查、更完整的写回同步和更受控的自动续写。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <StatusBadge tone="amber">卖的是控制力</StatusBadge>
          <StatusBadge tone="cyan">不是更多生成额度</StatusBadge>
          <StatusBadge tone="paper">自动续写是监控台</StatusBadge>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {tiers.map((tier) => {
          const featured = tier.tone === "featured";
          const current = featured ? membership.membershipType === "MEMBER" : tier.code.startsWith("体验者") && membership.membershipType === "FREE";

          return (
            <article
              key={tier.code}
              className={`relative flex flex-col rounded-[2rem] border p-8 ${
                featured
                  ? "border-[rgba(255,183,125,0.36)] bg-[rgba(27,32,38,0.96)] shadow-[0_24px_60px_rgba(207,141,53,0.08)]"
                  : "border-[rgba(85,67,54,0.18)] bg-[rgba(23,28,34,0.88)]"
              }`}
            >
              {featured ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2f1500]">
                  Most Demanded
                </div>
              ) : null}
              <div>
                <div className={`label-font text-xs uppercase tracking-[0.24em] ${featured ? "text-[var(--accent)]" : "text-[var(--accent-cyan)]"}`}>
                  {tier.code}
                </div>
                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  {tier.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[rgba(232,223,210,0.62)]">{tier.description}</p>
              </div>
              <div className="mt-8 flex-1 space-y-4">
                {tier.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                    <span className={`h-2.5 w-2.5 rounded-full ${featured ? "bg-[var(--accent)]" : "bg-[var(--accent-cyan)]"}`} />
                    {item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={`mt-10 w-full rounded-[1rem] px-5 py-4 text-sm font-semibold tracking-[0.22em] uppercase transition ${
                  featured
                    ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] text-[#2f1500] hover:opacity-92"
                    : "border border-[rgba(85,67,54,0.28)] bg-[rgba(48,53,60,0.52)] text-[var(--foreground)] hover:bg-[rgba(53,58,64,0.72)]"
                }`}
                onClick={featured && !current ? () => void handleUpgrade() : undefined}
                disabled={featured && pending}
              >
                {featured && pending ? "处理中..." : current ? "当前计划" : tier.cta}
              </button>
            </article>
          );
        })}
      </section>

      <section className="station-frame overflow-hidden rounded-[2.4rem] border border-[rgba(85,67,54,0.18)] bg-[rgba(23,28,34,0.88)]">
        <div className="flex items-center justify-between border-b border-[rgba(85,67,54,0.14)] px-8 py-8">
          <div>
            <h2 className="font-serif text-4xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">能力矩阵对比</h2>
            <p className="label-font mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Technical Capability Specifications</p>
          </div>
          <div className="rounded-full border border-[rgba(255,183,125,0.26)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            V2.4 Arbiter Engine
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[rgba(48,53,60,0.46)]">
                <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.24em] text-slate-400">核心维度</th>
                <th className="px-6 py-5 text-center text-xs uppercase tracking-[0.24em] text-slate-400">体验者</th>
                <th className="px-6 py-5 text-center text-xs uppercase tracking-[0.24em] text-[var(--accent)]">专业作者</th>
                <th className="px-6 py-5 text-center text-xs uppercase tracking-[0.24em] text-slate-400">自动续写</th>
              </tr>
            </thead>
            <tbody>
              {capabilityRows.map((row) => (
                <tr key={row[0]} className="border-t border-[rgba(85,67,54,0.1)]">
                  <td className="px-6 py-5 font-medium text-[var(--foreground)]">{row[0]}</td>
                  <td className="px-6 py-5 text-center text-slate-500">{row[1]}</td>
                  <td className="px-6 py-5 text-center text-[var(--foreground)]">{row[2]}</td>
                  <td className="px-6 py-5 text-center text-[var(--foreground)]">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <MembershipCard
        membership={membership}
        plan={plan}
        order={order}
        qrCodeUrl={qrCodeUrl}
        message={message}
        pending={pending}
        onUpgrade={handleUpgrade}
        onRefreshOrder={handleRefreshOrder}
      />

      <section className="flex flex-col gap-6 border-t border-[rgba(85,67,54,0.14)] pt-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-6">
          <span>服务条款</span>
          <span>隐私政策</span>
          <span>档案调阅说明</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(23,28,34,0.88)] px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="uppercase tracking-[0.22em]">Arbiter Nodes: Operational</span>
        </div>
      </section>
    </div>
  );
}
