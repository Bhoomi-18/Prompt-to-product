import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  MessageSquare,
  Activity,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { hasValidApiKey } from '../services/groqService';

export default function TopNavbar({
  activeView,
  onViewChange,
  apiKey,
  onApiKeyChange,
  onOpenKnowledgeBase,
  knowledgeDocsCount = 3
}) {
  const [showKey, setShowKey] = useState(false);
  const isLiveGroq = hasValidApiKey();

  const views = [
    { id: "split", label: "Split Demo View", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
    { id: "chat", label: "Customer Chat View", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "admin", label: "Admin Command Center", icon: <Activity className="h-3.5 w-3.5" /> },
    { id: "prompts", label: "Prompt Architecture Inspector", icon: <Terminal className="h-3.5 w-3.5" /> }
  ];

  return (
    <header className="h-14 border-b border-[#E2E8F0] bg-white px-4 flex items-center justify-between select-none shadow-xs z-30">
      {/* 1. App Brand & Live Telemetry Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0A84FF] text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-sm font-bold tracking-tight text-slate-900">
                NexusSupport AI
              </span>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#0A84FF]">
                v2.6 TELEMETRY ENGINE
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Llama-3.3-70b Core Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. View Switcher Segmented Control */}
      <div className="hidden lg:flex items-center rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] p-1 text-xs">
        {views.map((v) => {
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`flex items-center gap-1.5 rounded-[6px] px-3 py-1 font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile / Compact View Select */}
      <div className="lg:hidden flex items-center">
        <select
          value={activeView}
          onChange={(e) => onViewChange(e.target.value)}
          className="h-8 rounded-[8px] border border-[#E2E8F0] bg-white px-2 text-xs font-medium text-slate-800"
        >
          {views.map(v => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* 3. Knowledge Base Trigger & Groq API Key Input */}
      <div className="flex items-center gap-2.5">
        {/* Knowledge Base Drawer Trigger */}
        <button
          onClick={onOpenKnowledgeBase}
          className="flex h-8 items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-xs font-semibold text-slate-700 hover:border-[#0A84FF] hover:bg-blue-50/50 hover:text-[#0A84FF] transition-all shadow-2xs cursor-pointer"
          title="Open grounding knowledge base drawer"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#0A84FF]" />
          <span className="hidden sm:inline">Knowledge Base</span>
          <span className="rounded bg-blue-100/80 px-1.5 py-0.2 font-mono text-[10px] text-blue-800">
            {knowledgeDocsCount}
          </span>
        </button>

        {/* Connection Status Badge */}
        <div className="flex items-center">
          {isLiveGroq ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden md:inline">Groq Live API</span>
              <span className="md:hidden">Live</span>
            </span>
          ) : (
            <span
              className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-1 text-[11px] font-bold text-amber-800 shadow-2xs"
              title="No Groq key detected. Fallback simulation mode is running with full deterministic telemetry."
            >
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="hidden md:inline">Local Simulation Fallback</span>
              <span className="md:hidden">Simulation</span>
            </span>
          )}
        </div>

        {/* Groq API Key Input Field */}
        <div className="relative flex items-center">
          <div className="flex items-center rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-1 shadow-2xs focus-within:border-[#0A84FF] focus-within:bg-white">
            <Key className="h-3.5 w-3.5 text-slate-400 mr-1.5" />
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Groq Key (gsk_...)"
              className="w-24 sm:w-32 bg-transparent text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-slate-400 hover:text-slate-600 ml-1 p-0.5"
              title={showKey ? "Hide API Key" : "Show API Key"}
            >
              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
