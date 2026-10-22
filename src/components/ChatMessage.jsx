import React from 'react';
import { Shield, Sparkles, User, UserCheck, Clock, ExternalLink } from 'lucide-react';
import { RefundActionCard, EngineeringTicketActionCard, DiscountPromoActionCard } from './ActionCards';

export default function ChatMessage({ message, onOpenDoc }) {
  const isUser = message.role === 'user';
  const isHumanAgent = message.role === 'human_agent';
  const isSystem = message.role === 'system';

  // Parse markdown-like syntax for assistant and human agent messages
  const renderFormattedContent = (content) => {
    if (!content) return null;

    // Split lines
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-400">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headers
      if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={index} className="font-heading text-sm font-bold text-slate-900 mt-2.5 mb-1">
            {formatInlineStyles(line.replace('#### ', ''))}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="font-heading text-sm font-bold text-slate-950 mt-3 mb-1.5 border-b border-slate-100 pb-1">
            {formatInlineStyles(line.replace('### ', ''))}
          </h3>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed my-0.5">
            {formatInlineStyles(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} className="ml-4 list-decimal text-xs text-slate-700 leading-relaxed my-0.5">
            {formatInlineStyles(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="text-xs text-slate-700 leading-relaxed my-1">
            {formatInlineStyles(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre key="code-final" className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-400">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  // Inline formatting for **bold**, `code`, and [DOC-XXX] citations
  const formatInlineStyles = (text) => {
    // Split by citation tags first [DOC-XXX]
    const docRegex = /(\[DOC-\d{3}\])/g;
    const parts = text.split(docRegex);

    return parts.map((part, pIdx) => {
      if (docRegex.test(part)) {
        const docId = part.replace(/[\[\]]/g, '');
        return (
          <button
            key={pIdx}
            type="button"
            onClick={() => onOpenDoc && onOpenDoc(docId)}
            className="inline-flex items-center gap-0.5 mx-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold bg-blue-50 text-[#0A84FF] border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            title={`View verified knowledge document ${docId}`}
          >
            {part}
            <ExternalLink className="h-2.5 w-2.5 opacity-70" />
          </button>
        );
      }

      // Handle bold and inline code in the remainder
      const subParts = part.split(/(\*\*.*?\*\*|`.*?`)/g);
      return subParts.map((sub, sIdx) => {
        if (sub.startsWith('**') && sub.endsWith('**')) {
          return <strong key={sIdx} className="font-semibold text-slate-900">{sub.slice(2, -2)}</strong>;
        }
        if (sub.startsWith('`') && sub.endsWith('`')) {
          return <code key={sIdx} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-800">{sub.slice(1, -1)}</code>;
        }
        return sub;
      });
    });
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-3 w-full`}>
      {/* Sender Header */}
      <div className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium`}>
        {isUser && (
          <>
            <span>You (Customer)</span>
            <User className="h-3 w-3 text-slate-400" />
          </>
        )}
        {isHumanAgent && (
          <>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white">
              <UserCheck className="h-2.5 w-2.5" />
            </span>
            <span className="font-semibold text-purple-700">Sarah Chen (Tier-2 Lead Escalation)</span>
          </>
        )}
        {!isUser && !isHumanAgent && (
          <>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0A84FF] text-white">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
            <span className="font-semibold text-slate-700">NexusSupport AI</span>
          </>
        )}
        <span className="text-[10px] text-slate-400">
          • {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Message Bubble Container */}
      <div
        className={`max-w-[92%] rounded-[10px] p-3.5 text-xs shadow-xs transition-all ${
          isUser
            ? 'bg-[#0A84FF] text-white selection:bg-blue-300 selection:text-blue-900'
            : isHumanAgent
            ? 'bg-purple-50/70 border border-purple-200 text-slate-900 shadow-sm'
            : 'bg-white border border-[#E2E8F0] text-slate-900'
        }`}
      >
        {/* User Content */}
        {isUser && (
          <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
            {message.content}
          </p>
        )}

        {/* AI & Human Content */}
        {!isUser && (
          <div className="space-y-1">
            {renderFormattedContent(message.content)}
          </div>
        )}

        {/* Action Cards attached to message */}
        {message.actionCard && (
          <div className="mt-2 text-slate-900">
            {message.actionCard.type === 'refund' && <RefundActionCard card={message.actionCard} />}
            {message.actionCard.type === 'ticket' && <EngineeringTicketActionCard card={message.actionCard} />}
            {message.actionCard.type === 'discount' && <DiscountPromoActionCard card={message.actionCard} />}
          </div>
        )}

        {/* Metadata Pill for AI Responses */}
        {!isUser && !isHumanAgent && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              {message.latencyMs !== undefined && (
                <span className="inline-flex items-center gap-1 font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-semibold">
                  <Clock className="h-2.5 w-2.5" />
                  {message.latencyMs}ms
                </span>
              )}
              {message.tone && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  Tone: {message.tone}
                </span>
              )}
              {message.isSimulation && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono">
                  Simulation Fallback
                </span>
              )}
            </div>

            {message.citations && message.citations.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Grounded:</span>
                {message.citations.map(docId => (
                  <button
                    key={docId}
                    onClick={() => onOpenDoc && onOpenDoc(docId)}
                    className="font-mono text-[#0A84FF] hover:underline font-semibold"
                  >
                    [{docId}]
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PII Sanitization Pill on User Messages */}
      {isUser && message.piiSanitized && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md px-2 py-0.5 shadow-2xs">
          <Shield className="h-3 w-3 text-emerald-600" />
          <span>Client-side PII Guardrail Sanitized (Card/SSN Masked)</span>
        </div>
      )}
    </div>
  );
}
