import Image from "next/image";

import { SectionHeading, StationPanel, StatusBadge } from "@/components/control-station/station-kit";
import type { MembershipStatus, PaymentOrder, PaymentPlan } from "@/lib/types";

function formatPrice(priceFen: number) {
  return `¥${(priceFen / 100).toFixed(2)}`;
}

function formatStatus(status: PaymentOrder["status"]) {
  switch (status) {
    case "PAID":
      return "已支付";
    case "CLOSED":
      return "已关闭";
    case "FAILED":
      return "支付失败";
    case "REFUNDED":
      return "已退款";
    default:
      return "待支付";
  }
}

export function MembershipCard({
  membership,
  plan,
  order,
  qrCodeUrl,
  message,
  pending,
  onUpgrade,
  onRefreshOrder,
}: {
  membership: MembershipStatus;
  plan: PaymentPlan | null;
  order: PaymentOrder | null;
  qrCodeUrl: string;
  message: string;
  pending: boolean;
  onUpgrade: () => Promise<void>;
  onRefreshOrder: () => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <StationPanel className="rounded-[2.2rem] border-[rgba(85,67,54,0.18)] bg-[rgba(23,28,34,0.88)] p-6 text-[var(--foreground)]">
          <SectionHeading
            kicker="Current Capability"
            title={membership.membershipType === "MEMBER" ? "会员版" : "免费版"}
            description="会员层级显示的是你现在拥有多少控制力，而不是今天还能生成几次。"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.45rem] border border-[rgba(85,67,54,0.16)] bg-[rgba(10,15,20,0.72)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">今日已用</p>
              <p className="mt-2 font-serif text-3xl text-[var(--foreground)]">{membership.usedToday}</p>
            </div>
            <div className="rounded-[1.45rem] border border-[rgba(85,67,54,0.16)] bg-[rgba(10,15,20,0.72)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">今日剩余</p>
              <p className="mt-2 font-serif text-3xl text-[var(--foreground)]">
                {membership.remainingToday ?? "∞"}
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-[rgba(85,67,54,0.16)] bg-[rgba(10,15,20,0.72)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">到期时间</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                {membership.membershipExpireAt ?? "未开通"}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <StatusBadge tone={membership.membershipType === "MEMBER" ? "amber" : "paper"}>
              {membership.membershipType === "MEMBER" ? "控制能力已开通" : "当前为体验层"}
            </StatusBadge>
            <StatusBadge tone="cyan">长篇控制优先</StatusBadge>
            <StatusBadge tone="paper">写回同步可见</StatusBadge>
          </div>
        </StationPanel>

        <StationPanel className="rounded-[2.2rem] border-[rgba(255,183,125,0.3)] bg-[rgba(27,32,38,0.96)] p-6 text-[var(--foreground)] shadow-[0_24px_60px_rgba(207,141,53,0.08)]">
          <SectionHeading
            kicker="Plan Offer"
            title={plan?.title ?? "专业作者版"}
            description="用户付费买的是完整控制能力，而不是更多段落输出。"
          />
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-serif text-4xl text-[var(--foreground)]">
                {plan ? formatPrice(plan.priceFen) : "待配置"}
              </p>
              <p className="mt-2 text-sm text-[rgba(232,223,210,0.62)]">
                {plan ? `${plan.durationMonths} 个月` : "支付计划未配置"}
              </p>
            </div>
            <StatusBadge tone="amber">{plan?.code ?? "PRO"}</StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-[rgba(232,223,210,0.72)]">
            {plan?.description ?? "当前后端未返回计划描述。"}
          </p>
          <div className="mt-5 grid gap-3">
            {["全量作品资料维护", "跨卷因果与伏笔回收提醒", "章节完成后动态写回闭环"].map((item) => (
              <div key={item} className="rounded-[1.2rem] border border-[rgba(85,67,54,0.18)] bg-[rgba(10,15,20,0.66)] px-4 py-3 text-sm text-[var(--foreground)]">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] px-4 py-3 text-sm font-semibold text-[#2f1500] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void onUpgrade()}
              disabled={pending || plan?.configured === false}
            >
              {pending ? "处理中..." : "开通控制能力"}
            </button>
            {order ? (
              <button
                type="button"
                className="rounded-full border border-[rgba(85,67,54,0.24)] bg-[rgba(10,15,20,0.7)] px-4 py-3 text-sm font-medium text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void onRefreshOrder()}
                disabled={pending}
              >
                刷新支付状态
              </button>
            ) : null}
          </div>
        </StationPanel>
      </section>

      {message ? (
        <StationPanel className="rounded-[1.8rem] border-[rgba(85,67,54,0.18)] bg-[rgba(23,28,34,0.88)]">
          <p className="text-sm text-[var(--foreground)]">{message}</p>
        </StationPanel>
      ) : null}

      {plan?.configured === false ? (
        <StationPanel tone="danger">
          <p className="text-sm text-[var(--paper-ink)]">
            后端还没有填入微信支付商户参数，暂时无法创建真实订单。
          </p>
        </StationPanel>
      ) : null}

      {order ? (
        <section className="grid gap-6 xl:grid-cols-[280px,1fr]">
          <StationPanel className="rounded-[2rem] border-[rgba(85,67,54,0.18)] bg-[rgba(23,28,34,0.88)] p-4">
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                alt="微信支付二维码"
                width={280}
                height={280}
                unoptimized
                className="h-auto w-full rounded-xl"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[rgba(85,67,54,0.24)] text-sm text-slate-500">
                二维码生成中...
              </div>
            )}
          </StationPanel>

          <StationPanel className="rounded-[2rem] border-[rgba(85,67,54,0.18)] bg-[rgba(23,28,34,0.88)] p-6 text-[var(--foreground)]">
            <SectionHeading
              kicker="WeChat Pay"
              title="扫码完成开通"
              description="支付成功后本页会自动轮询，也可以手动刷新状态。"
            />
            <div className="mt-5 grid gap-3 text-sm text-[var(--foreground)]">
              <p>订单状态：{formatStatus(order.status)}</p>
              <p>订单号：{order.outTradeNo}</p>
              <p>订单金额：{formatPrice(order.amountFen)}</p>
              <p>失效时间：{order.expireAt ?? "15 分钟内有效"}</p>
            </div>
          </StationPanel>
        </section>
      ) : null}
    </div>
  );
}
