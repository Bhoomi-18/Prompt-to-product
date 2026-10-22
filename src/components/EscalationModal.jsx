import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, UserCheck, ShieldAlert, Copy, Check, ArrowRight } from 'lucide-react';

export default function EscalationModal({
  isOpen,
  onClose,
  actionPlan,
  isLoading,
  onSendAsHuman
}) {
  const [draftReply, setDraftReply] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Sync draft reply when actionPlan updates
  React.useEffect(() => {
    if (actionPlan?.suggestedAgentReply) {
      setDraftReply(actionPlan.suggestedAgentReply);
    }
  }, [actionPlan]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!draftReply.trim()) return;
    onSendAsHuman(draftReply);
    onClose();
  };

  const handleCopyPlaybook = () => {
    if (!actionPlan) return;
    const text = `ESCALATION PLAYBOOK:
Root Cause: ${actionPlan.rootCauseDiagnosis}
What AI Tried:\n${actionPlan.whatAiAlreadyTried?.map(i => `- ${i}`).join('\n')}
Next Steps:\n${actionPlan.nextStepsForAgent?.map(i => `- ${i}`).join('\n')}
Suggested Reply:\n${draftReply}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-[12px] border border-[#E2E8F0] bg-white shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Human Escalation Co-Pilot & Action Plan
                </h3>
                <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                  PROMPT #3 SYNTHESIS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Principal Support Playbook generated from conversation telemetry and verified knowledge base
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Sparkles className="h-8 w-8 text-purple-600 animate-spin mb-3" />
              <p className="font-heading text-sm font-semibold text-slate-800">
                Formulating Escalation Playbook with Groq LLM...
              </p>
              <p className="text-xs text-slate-400">
                Evaluating root cause diagnosis and synthesizing agent takeover reply
              </p>
            </div>
          ) : actionPlan ? (
            <>
              {/* Root Cause Diagnosis */}
              <div className="rounded-[10px] border border-red-200/80 bg-red-50/60 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  Root Cause Diagnosis
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {actionPlan.rootCauseDiagnosis}
                </p>
              </div>

              {/* Two Column Summary: What AI Tried vs Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* What AI Already Tried */}
                <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <h4 className="font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    What AI Already Executed
                  </h4>
                  <ul className="space-y-1.5">
                    {actionPlan.whatAiAlreadyTried?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step-by-Step Playbook for Agent */}
                <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <h4 className="font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-purple-600" />
                    Human Agent Playbook
                  </h4>
                  <ul className="space-y-1.5">
                    {actionPlan.nextStepsForAgent?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drafted Human Takeover Reply */}
              <div className="rounded-[10px] border border-purple-200 bg-purple-50/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-purple-700" />
                    <span className="font-heading text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Drafted Human Takeover Reply
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-700">Editable before sending</span>
                </div>
                <textarea
                  rows={4}
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  className="w-full rounded-[8px] border border-purple-200 bg-white p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none shadow-2xs leading-relaxed"
                  placeholder="Review or customize drafted reply..."
                />
              </div>
            </>
          ) : (
            <p className="text-center text-xs text-slate-500">No action plan generated yet.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5">
          <button
            onClick={handleCopyPlaybook}
            disabled={!actionPlan}
            className="flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {isCopied ? "Playbook Copied" : "Copy Playbook"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!draftReply.trim() || isLoading}
              className="flex items-center gap-1.5 rounded-[8px] bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Send to Chat as Human Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
