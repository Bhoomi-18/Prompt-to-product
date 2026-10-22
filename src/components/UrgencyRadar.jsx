import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle, Flame } from 'lucide-react';

export default function UrgencyRadar({ urgency = "Medium", score = 50, reasoning = "Normal inquiry volume." }) {
  // Badge styling according to specification:
  // Critical / High: #EF4444 text, #FEF2F2 bg, #FCA5A5 border
  // Medium: #F59E0B text, #FFFBEB bg, #FCD34D border
  // Low / Resolved / Safe: #10B981 text, #ECFDF5 bg, #6EE7B7 border
  const getBadgeStyle = (lvl) => {
    switch (lvl) {
      case "Critical":
      case "High":
        return "text-[#EF4444] bg-[#FEF2F2] border-[#FCA5A5]";
      case "Medium":
        return "text-[#F59E0B] bg-[#FFFBEB] border-[#FCD34D]";
      case "Low":
      default:
        return "text-[#10B981] bg-[#ECFDF5] border-[#6EE7B7]";
    }
  };

  const getUrgencyIcon = (lvl) => {
    switch (lvl) {
      case "Critical":
        return <Flame className="h-4 w-4 text-red-500 animate-bounce" />;
      case "High":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "Medium":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  // SVG circular arc percentage
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getMeterColor = (val) => {
    if (val >= 80) return "#EF4444"; // Red
    if (val >= 50) return "#F59E0B"; // Amber
    return "#10B981"; // Emerald
  };

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Urgency Radar
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${getBadgeStyle(urgency)}`}>
          {getUrgencyIcon(urgency)}
          {urgency}
        </span>
      </div>

      <div className="my-2.5 flex items-center gap-3.5">
        {/* Circular Progress Gauge */}
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90 transform">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={getMeterColor(score)}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-heading text-base font-bold text-slate-900 leading-none">
              {score}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">/100</span>
          </div>
        </div>

        {/* Severity Reasoning */}
        <div className="flex-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Reasoning</span>
          <p className="text-xs text-slate-700 leading-snug font-sans line-clamp-3">
            {reasoning || "Continuous telemetry analysis active."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
        <span>Model: llama-3.3-70b</span>
        <span>Threshold: &gt;75 Critical</span>
      </div>
    </div>
  );
}
