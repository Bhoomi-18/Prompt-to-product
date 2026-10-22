import React from 'react';
import { DollarSign, CheckCircle2, Ticket, Tag, ExternalLink, ShieldAlert, Copy, Check } from 'lucide-react';

export function RefundActionCard({ card, onCopy }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(card.transactionId || "tx_stripe_9942a");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-[10px] border border-emerald-200 bg-emerald-50/80 p-4 shadow-xs transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold text-emerald-950">
                Instant SLA Credit & Refund Processed
              </span>
              <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                STRIPE SETTLED
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Authorized under DOC-202 Automated Service Level Agreement.
            </p>
          </div>
        </div>
        <span className="font-mono text-base font-bold text-emerald-700">
          +${Number(card.amount || 25).toFixed(2)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-emerald-200/60 bg-white/80 p-2.5 font-mono text-xs sm:grid-cols-4">
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">Target Invoice</span>
          <span className="font-semibold text-slate-800">{card.invoiceId || "INV-4829"}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">Method</span>
          <span className="font-semibold text-slate-800">Card ending 8844</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">Transaction ID</span>
          <div className="flex items-center gap-1">
            <span className="truncate text-slate-700">{card.transactionId || "tx_live_3901a"}</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-slate-700">
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase">Est. Posting</span>
          <span className="font-semibold text-emerald-700">2-3 Business Days</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-emerald-800">
        <span className="flex items-center gap-1 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Auto-reversal logged to Stripe Ledger
        </span>
        <span className="text-slate-500 font-mono text-[10px]">
          {card.timestamp || new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export function EngineeringTicketActionCard({ card }) {
  return (
    <div className="my-3 rounded-[10px] border border-blue-200 bg-blue-50/70 p-4 shadow-xs transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A84FF] text-white shadow-xs">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold text-slate-900">
                Tier-3 Engineering Incident Dispatched
              </span>
              <span className="rounded-full bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-bold text-red-700">
                {card.priority || "P1-CRITICAL"}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Internal investigation created with automated cluster telemetry attached.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded border border-blue-200">
          {card.ticketId || "ENG-8492"}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-blue-200/60 bg-white/90 p-2.5 font-mono text-xs space-y-1.5">
        <div className="flex justify-between border-b border-slate-100 pb-1">
          <span className="text-slate-500">Component:</span>
          <span className="font-semibold text-slate-800">{card.component || "CloudSync Ingress Gateway"}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-1">
          <span className="text-slate-500">Error Vector:</span>
          <span className="font-semibold text-red-600">{card.errorCode || "504 Gateway Timeout / 403 OAuth"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Assigned Team:</span>
          <span className="font-semibold text-blue-700">{card.assignee || "Core Platform Reliability (SRE)"}</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600">
        <span className="flex items-center gap-1 font-medium text-blue-800">
          <ExternalLink className="h-3.5 w-3.5" /> Jira / PagerDuty escalation webhook triggered
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          {card.timestamp || new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export function DiscountPromoActionCard({ card }) {
  const [copied, setCopied] = React.useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(card.code || "SLA20-OFF");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-[10px] border border-amber-200 bg-amber-50/70 p-4 shadow-xs transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold text-amber-950">
                Courtesy 20% Renewal Credit Applied
              </span>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                PROMO ACTIVE
              </span>
            </div>
            <p className="text-xs text-amber-800">
              Courtesy compensation for service degradation authorized under DOC-202.
            </p>
          </div>
        </div>
        <span className="font-heading text-sm font-bold text-amber-700">
          20% OFF
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200/80 bg-white p-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">Promo Code:</span>
          <span className="font-mono text-sm font-bold tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {card.code || "SLA20-OFF"}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-900">
        <span className="font-medium">
          Automatically attached to next billing invoice renewal cycle.
        </span>
        <span className="text-slate-400 font-mono text-[10px]">
          {card.timestamp || new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
