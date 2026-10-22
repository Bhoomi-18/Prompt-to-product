import React, { useState } from 'react';
import {
  Activity,
  Layers,
  ArrowUpRight,
  DollarSign,
  Ticket,
  Tag,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import UrgencyRadar from './UrgencyRadar';
import SentimentMeter from './SentimentMeter';
import EntityTable from './EntityTable';

export default function AdminDashboard({
  telemetry,
  onTriggerAction,
  onOpenEscalation,
  auditLog = [],
  onOpenDoc
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    if (!telemetry?.liveSummary) return;
    navigator.clipboard.writeText(telemetry.liveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Action Handlers
  const handleRefund = () => {
    fireConfetti();
    const invoiceId = telemetry.extractedEntities?.orderOrInvoiceId || "INV-4829";
    onTriggerAction({
      type: "refund",
      title: "SLA Credit & Invoice Refund",
      invoiceId,
      amount: 25.00,
      transactionId: `tx_stripe_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleTicket = () => {
    fireConfetti();
    const err = telemetry.extractedEntities?.errorCode || "504 Gateway Timeout";
    const sdk = telemetry.extractedEntities?.productOrSdkVersion || "CloudSync SDK v2.4";
    onTriggerAction({
      type: "ticket",
      title: "Tier-3 Engineering Escalation",
      ticketId: `ENG-${Math.floor(1000 + Math.random() * 9000)}`,
      errorCode: err,
      component: sdk,
      priority: "P1-CRITICAL",
      assignee: "Core Platform Reliability (SRE)",
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleDiscount = () => {
    fireConfetti();
    onTriggerAction({
      type: "discount",
      title: "Courtesy 20% Renewal Credit",
      code: "SLA20-OFF",
      percentage: "20%",
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const recAction = telemetry.recommendedUiAction || "NONE";

  return (
    <div className="flex h-full flex-col bg-[#F8FAFC] overflow-y-auto">
      {/* Admin Header */}
      <div className="flex-none border-b border-[#E2E8F0] bg-white px-5 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-slate-900">
                Admin Telemetry & Routing Command Center
              </span>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#0A84FF]">
                TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time classification, entity extraction, and automated one-click resolution dispatch
            </p>
          </div>

          {/* Human Escalation Co-Pilot Trigger */}
          <button
            onClick={onOpenEscalation}
            className="flex items-center gap-1.5 rounded-[10px] bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>⚡ Generate Suggested Action Plan</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-4">
        {/* ROW 1: TOP KPI ROW (3 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Urgency Radar */}
          <UrgencyRadar
            urgency={telemetry.urgency || "Medium"}
            score={telemetry.urgencyScore ?? 50}
            reasoning={telemetry.urgencyReasoning}
          />

          {/* Card 2: Live Sentiment Meter */}
          <SentimentMeter
            sentiment={telemetry.sentiment || "Neutral"}
            score={telemetry.sentimentScore ?? 50}
          />

          {/* Card 3: Classified Intent & Target Department */}
          <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Intent & Routing
              </span>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-700 font-medium">
                Route Engine v2.4
              </span>
            </div>

            <div className="my-2 space-y-1.5">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Primary Intent</span>
                <p className="font-heading text-xs font-bold text-slate-900 truncate">
                  {telemetry.userIntent || "General Support"}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Department</span>
                <p className="font-mono text-xs font-semibold text-[#0A84FF]">
                  {telemetry.targetDepartment || "General Support Tier-1"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-500" /> SLA Target: &lt; 15m
              </span>
              <span className="text-emerald-700 font-semibold">Priority Queue #1</span>
            </div>
          </div>
        </div>

        {/* ROW 2: AUTOMATED CONVERSATION SUMMARY & ENTITY EXTRACTOR (2 CARDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Live Executive Summary (5 cols) */}
          <div className="lg:col-span-5 rounded-[10px] border border-[#E2E8F0] bg-white p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0A84FF]" />
                  <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Live Executive Summary
                  </h3>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {copiedSummary ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedSummary ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {telemetry.liveSummary ||
                  "Awaiting conversation turns to synthesize root cause and troubleshooting milestones."}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Auto-synthesizes every turn</span>
              <span className="text-emerald-600 font-semibold">Active State Tracked</span>
            </div>
          </div>

          {/* Structured Entity Table (7 cols) */}
          <div className="lg:col-span-7">
            <EntityTable
              entities={telemetry.extractedEntities}
              onOpenDoc={onOpenDoc}
            />
          </div>
        </div>

        {/* ROW 3: INTERACTIVE RESOLUTION ACTIONS PANEL */}
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-800">
                Interactive Resolution Dispatcher
              </h3>
              <p className="text-[11px] text-slate-500">
                Executing an action injects a live verifiable fulfillment card directly into the customer's chat
              </p>
            </div>

            {recAction !== "NONE" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300 px-3 py-1 font-mono text-[10px] font-bold text-emerald-800 animate-pulse">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                AI RECOMMENDED: {recAction.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* 3 Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Button 1: Refund */}
            <button
              onClick={handleRefund}
              className={`relative flex flex-col items-start rounded-[10px] p-3 text-left transition-all border cursor-pointer ${
                recAction === "TRIGGER_REFUND"
                  ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xs"
                  : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="font-heading text-xs font-bold text-slate-900">
                  Instant Refund / SLA Credit
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Auto-reverses duplicate charge or applies $25 SLA credit per DOC-202.
              </p>
              <span className="mt-2 text-[10px] font-mono font-semibold text-emerald-700">
                Target: {telemetry.extractedEntities?.orderOrInvoiceId || "INV-4829"} ($25.00)
              </span>
            </button>

            {/* Button 2: Engineering Ticket */}
            <button
              onClick={handleTicket}
              className={`relative flex flex-col items-start rounded-[10px] p-3 text-left transition-all border cursor-pointer ${
                recAction === "GENERATE_TICKET"
                  ? "bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30 shadow-xs"
                  : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A84FF] text-white shadow-2xs">
                  <Ticket className="h-4 w-4" />
                </div>
                <span className="font-heading text-xs font-bold text-slate-900">
                  Generate Tier-3 Ticket
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Escalates cluster logs, error codes, and SDK telemetry to Platform SRE.
              </p>
              <span className="mt-2 text-[10px] font-mono font-semibold text-blue-700">
                Attach: {telemetry.extractedEntities?.errorCode || "Error 504 / 403"}
              </span>
            </button>

            {/* Button 3: Discount Code */}
            <button
              onClick={handleDiscount}
              className={`relative flex flex-col items-start rounded-[10px] p-3 text-left transition-all border cursor-pointer ${
                recAction === "OFFER_DISCOUNT"
                  ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 shadow-xs"
                  : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-amber-300 hover:bg-amber-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-2xs">
                  <Tag className="h-4 w-4" />
                </div>
                <span className="font-heading text-xs font-bold text-slate-900">
                  Issue Courtesy Promo
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Injects active 20% renewal discount promo code (SLA20-OFF) into customer chat.
              </p>
              <span className="mt-2 text-[10px] font-mono font-semibold text-amber-700">
                Code: SLA20-OFF (20% Off)
              </span>
            </button>
          </div>
        </div>

        {/* ROW 4: ADMIN AUDIT TRAIL LOG */}
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500" />
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-800">
                Real-Time Admin Action Audit Trail
              </h3>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {auditLog.length} Events Recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100 font-mono text-xs max-h-36 overflow-y-auto">
            {auditLog.length === 0 ? (
              <p className="text-center text-slate-400 py-3 text-xs italic">
                No administrative actions executed yet. Click one of the resolution buttons above to test live dispatch.
              </p>
            ) : (
              auditLog.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 hover:bg-slate-50 px-1 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                    <span className="font-semibold text-slate-800">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {log.target}
                    </span>
                    <span className="text-emerald-600 font-bold text-[10px]">VERIFIED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
