import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, Sparkles, RefreshCw, AlertTriangle, ArrowRight, CornerDownLeft, Zap, Info } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { sanitizePii } from '../utils/piiGuardrail';

export const DEMO_SCENARIOS = [
  {
    id: "scenario-1",
    label: "Scenario 1: Frustrated & Multi-Layered",
    persona: "Sarah Chen (Enterprise Tier)",
    description: "Webhook 504 outage + Invoice INV-4829 double-charge + Raw credit card PII",
    message: "My production webhooks are failing with Error 504 for the last hour AND I just noticed I was double-charged on invoice INV-4829! My card is 4532-9910-2211-8844. Fix this now!"
  },
  {
    id: "scenario-2",
    label: "Scenario 2: Highly Technical",
    persona: "Alex V. (Lead Platform DevOps)",
    description: "CloudSync SDK v2.4 on Node 20 runtime + OAuth 403 14-day token drops",
    message: "We're running CloudSync SDK v2.4 on Node 20 and seeing silent Error 403 OAuth token drops every 14 days. Is this a refresh rotation bug?"
  },
  {
    id: "scenario-3",
    label: "Scenario 3: Hardware RMA & Order Delay",
    persona: "Marcus Vance (Logistics Director)",
    description: "Gateway ORD-9941 delayed in transit + backup SN-7731 cracked ethernet port",
    message: "My hardware gateway order ORD-9941 is still stuck in transit, and our existing backup unit SN-7731 arrived with a cracked ethernet port."
  }
];

export default function ChatPane({
  messages,
  onSendMessage,
  onResetChat,
  onLoadScenario,
  isLoading,
  telemetry,
  onOpenDoc
}) {
  const [input, setInput] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Live PII detection on current input string
  const livePii = sanitizePii(input);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");
  };

  const handleScenarioChange = (e) => {
    const sId = e.target.value;
    setSelectedScenarioId(sId);
    const scenario = DEMO_SCENARIOS.find(s => s.id === sId);
    if (scenario) {
      onLoadScenario(scenario);
    }
  };

  const handleQuickChip = (text) => {
    if (isLoading) return;
    onSendMessage(text);
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-[#E2E8F0]">
      {/* 1. Header with Scenario Selector & Live Persona Tone */}
      <div className="flex-none border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-slate-900">
                Customer Support Chat
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Session
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct customer communication feed with client-side guardrails
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Click Scenario Dropdown */}
            <select
              value={selectedScenarioId}
              onChange={handleScenarioChange}
              className="h-8 rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#0A84FF] focus:outline-none cursor-pointer"
            >
              <option value="">⚡ Inject Demo Scenario...</option>
              {DEMO_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Clear Chat Button */}
            <button
              onClick={onResetChat}
              className="flex h-8 items-center gap-1 rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
              title="Reset conversation state"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* 2. Adaptive Tone Indicator & PII Guardrail Pill */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-[#E2E8F0] bg-white p-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Dynamic AI Tone:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
              telemetry.adaptiveToneApplied === 'Empathetic & Direct'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : telemetry.adaptiveToneApplied === 'Highly Technical'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Sparkles className="h-2.5 w-2.5" />
              {telemetry.adaptiveToneApplied || "Concise & Warm"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded px-2 py-0.5">
            <Shield className="h-3 w-3 text-emerald-600" />
            <span className="font-medium">PII Guardrail Shield Active</span>
          </div>
        </div>
      </div>

      {/* 3. Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0A84FF] mb-3 border border-blue-100">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-sm font-semibold text-slate-700 mb-1">
              Ready for Customer Troubleshooting
            </h3>
            <p className="max-w-xs text-xs text-slate-500 mb-4">
              Select one of the 3 pre-configured scenarios above or type an inquiry to test real-time AI reasoning, telemetry, and PII masking.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {DEMO_SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => onLoadScenario(scen)}
                  className="flex items-center justify-between text-left rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs hover:border-[#0A84FF] hover:bg-blue-50/50 transition-all text-slate-700"
                >
                  <span className="font-medium truncate">{scen.label}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              message={msg}
              onOpenDoc={onOpenDoc}
            />
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="my-3 flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white p-3 text-xs text-slate-500 shadow-xs max-w-[80%]">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[#0A84FF]">
              <Sparkles className="h-3 w-3 animate-spin" />
            </div>
            <span>NexusSupport AI is synthesizing resolution & updating telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Suggested Prompts Chips */}
      <div className="flex-none px-4 py-2 border-t border-slate-100 bg-[#F8FAFC] overflow-x-auto flex items-center gap-2 text-xs">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Suggested:</span>
        <button
          onClick={() => handleQuickChip("Where is my hardware gateway order ORD-9941 right now?")}
          className="whitespace-nowrap rounded-full bg-white border border-[#E2E8F0] px-2.5 py-1 text-[11px] text-slate-600 hover:border-[#0A84FF] hover:text-[#0A84FF] transition-colors"
        >
          Track ORD-9941
        </button>
        <button
          onClick={() => handleQuickChip("How do I fix Error 504 on Webhook delivery?")}
          className="whitespace-nowrap rounded-full bg-white border border-[#E2E8F0] px-2.5 py-1 text-[11px] text-slate-600 hover:border-[#0A84FF] hover:text-[#0A84FF] transition-colors"
        >
          Fix Webhook 504
        </button>
        <button
          onClick={() => handleQuickChip("Can I get an SLA outage credit for the 45-minute downtime?")}
          className="whitespace-nowrap rounded-full bg-white border border-[#E2E8F0] px-2.5 py-1 text-[11px] text-slate-600 hover:border-[#0A84FF] hover:text-[#0A84FF] transition-colors"
        >
          Claim SLA Credit
        </button>
      </div>

      {/* 5. Live PII Warning Banner (If card/ssn detected while typing) */}
      {livePii.piiDetected && (
        <div className="flex-none bg-emerald-50 border-t border-emerald-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            Live Guardrail: Sensitive payment card or PII detected. Will be sanitized to [REDACTED-CC] upon sending.
          </span>
          <span className="text-emerald-700 font-mono text-[10px]">Client Protected</span>
        </div>
      )}

      {/* 6. Message Input Box */}
      <form onSubmit={handleSubmit} className="flex-none border-t border-[#E2E8F0] bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type customer message or ask a troubleshooting question..."
            disabled={isLoading}
            className="flex-1 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0A84FF] focus:bg-white focus:outline-none shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#0A84FF] text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#0A84FF] transition-colors shadow-xs"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
