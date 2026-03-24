import Image from "next/image";
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
    <section className="control-panel rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="meta-kicker">Current Plan</p>
          <h2 className="panel-title mt-2 text-3xl font-semibold">
            {membership.membershipType === "MEMBER" ? "会员版" : "免费版"}
          </h2>
          <div className="mt-6 grid gap-3 text-sm text-[var(--ink-soft)]">
            <p>今日已用：{membership.usedToday}</p>
            <p>今日剩余：{membership.remainingToday ?? "无限制"}</p>
            <p>到期时间：{membership.membershipExpireAt ?? "未开通"}</p>
          </div>
        </div>
        {plan ? (
          <div className="min-w-56 rounded-[1.5rem] border border-[rgba(139,30,30,0.18)] bg-[rgba(255,247,244,0.88)] p-5 text-sm text-[var(--ink-soft)]">
            <p className="font-medium text-stone-950">{plan.title}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">
              {formatPrice(plan.priceFen)}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--ink-soft)]">
              {plan.durationMonths} Month
            </p>
            <p className="mt-3 leading-6">{plan.description}</p>
          </div>
        ) : null}
      </div>

      {message ? (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {plan?.configured === false ? (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          后端还没有填入微信支付商户参数，暂时无法创建真实订单。
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void onUpgrade()}
          disabled={pending || plan?.configured === false}
        >
          {pending ? "处理中..." : "立即开通月卡"}
        </button>
        {order ? (
          <button
            type="button"
            className="rounded-full border border-[rgba(48,35,24,0.16)] bg-[rgba(255,252,247,0.82)] px-4 py-3 text-sm font-medium text-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void onRefreshOrder()}
            disabled={pending}
          >
            刷新支付状态
          </button>
        ) : null}
      </div>

      {order ? (
        <div className="mt-8 grid gap-6 rounded-[1.75rem] border border-[rgba(48,35,24,0.1)] bg-[rgba(255,252,247,0.72)] p-6 md:grid-cols-[280px,1fr]">
          <div className="rounded-[1.5rem] bg-white p-4">
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
              <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-stone-300 text-sm text-stone-500">
                二维码生成中...
              </div>
            )}
          </div>
          <div className="space-y-3 text-sm text-[var(--ink-soft)]">
            <p className="meta-kicker">WeChat Pay</p>
            <h3 className="panel-title text-2xl font-semibold text-stone-950">
              扫码完成支付
            </h3>
            <p>订单状态：{formatStatus(order.status)}</p>
            <p>订单号：{order.outTradeNo}</p>
            <p>订单金额：{formatPrice(order.amountFen)}</p>
            <p>失效时间：{order.expireAt ?? "15 分钟内有效"}</p>
            <p className="leading-6 text-stone-600">
              打开微信扫一扫完成支付。支付成功后本页会自动轮询，也可以手动刷新状态。
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
