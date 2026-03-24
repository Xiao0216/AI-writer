"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { MembershipCard } from "@/components/membership/membership-card";
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
    void QRCode.toDataURL(order.codeUrl, {
      margin: 1,
      width: 280,
    })
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

    return () => {
      window.clearInterval(timer);
    };
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
    return (
      <div className="text-sm text-stone-600">
        {message || "请先登录后查看会员状态。"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="control-panel overflow-hidden rounded-[2.6rem] px-8 py-8 xl:px-10 xl:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="meta-kicker">Capability Tiers</p>
            <h1 className="panel-title mt-4 text-4xl font-semibold tracking-[-0.04em] lg:text-6xl">
              会员与创作能力
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--ink-soft)] lg:text-lg">
              文枢AI 升级的不是更多按钮，而是更强的长篇控制能力：更完整的真相文件、更稳的连续性检查、更长的上下文与更受控的马拉松推进。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] p-5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">免费版</p>
              <p className="mt-3 font-serif text-2xl text-stone-950">基础立项</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">适合体验控制台、建立第一个项目、感受章节写回流程。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(139,30,30,0.24)] bg-[rgba(255,247,244,0.88)] p-5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--accent)]">专业作者版</p>
              <p className="mt-3 font-serif text-2xl text-stone-950">完整控制系统</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">适合需要持续推进 30 万字以上作品的作者。</p>
            </article>
            <article className="rounded-[1.8rem] border border-[rgba(48,35,24,0.12)] bg-[rgba(255,252,247,0.82)] p-5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[var(--ink-soft)]">马拉松版</p>
              <p className="mt-3 font-serif text-2xl text-stone-950">自动推进护栏</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">适合高频作者和工作室，重点在可控自动推进，而不是无脑连写。</p>
            </article>
          </div>
        </div>
      </section>

      <MembershipCard
        membership={membership}
        plan={plan}
        order={order}
        qrCodeUrl={qrCodeUrl}
        message={message}
        pending={pending}
        onUpgrade={async () => {
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
        }}
        onRefreshOrder={async () => {
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
        }}
      />
    </div>
  );
}
