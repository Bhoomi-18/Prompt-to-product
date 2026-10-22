import React from 'react';
import { Smile, Frown, Meh, AlertOctagon, HeartHandshake } from 'lucide-react';

export default function SentimentMeter({ sentiment = "Neutral", score = 50 }) {
  // Map sentiments: Angry, Frustrated, Confused, Neutral, Calm
  const getSentimentConfig = (s) => {
    switch (s) {
      case "Angry":
        return {
          icon: <AlertOctagon className="h-4 w-4 text-red-600" />,
          color: "text-red-700 bg-red-50 border-red-200",
          barColor: "bg-red-500",
          description: "High churn hazard; requires de-escalation"
        };
      case "Frustrated":
        return {
          icon: <Frown className="h-4 w-4 text-amber-600" />,
          color: "text-amber-800 bg-amber-50 border-amber-200",
          barColor: "bg-amber-500",
          description: "Customer friction high; needs immediate action"
        };
      case "Confused":
        return {
          icon: <Meh className="h-4 w-4 text-yellow-600" />,
          color: "text-yellow-800 bg-yellow-50 border-yellow-200",
          barColor: "bg-yellow-500",
          description: "Diagnostic uncertainty; requires clarity"
        };
      case "Calm":
        return {
          icon: <HeartHandshake className="h-4 w-4 text-emerald-600" />,
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          barColor: "bg-emerald-500",
          description: "Stable interaction; positive resolution path"
        };
      case "Neutral":
      default:
        return {
          icon: <Smile className="h-4 w-4 text-blue-600" />,
          color: "text-blue-700 bg-blue-50 border-blue-200",
          barColor: "bg-[#0A84FF]",
          description: "Factual technical or operational inquiry"
        };
    }
  };

  const config = getSentimentConfig(sentiment);

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3.5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Live Sentiment Meter
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${config.color}`}>
          {config.icon}
          {sentiment}
        </span>
      </div>

      <div className="my-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Sentiment Valence
          </span>
          <span className="font-mono text-xs font-bold text-slate-900">
            {score}% <span className="text-[10px] text-slate-400 font-normal">(Satisfaction)</span>
          </span>
        </div>

        {/* Animated Sentiment Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-700 ease-out ${config.barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-500 leading-snug">
          {config.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
        <span>Scale: 0 (Hostile) - 100 (Delighted)</span>
        <span>Confidence: 98.4%</span>
      </div>
    </div>
  );
}
