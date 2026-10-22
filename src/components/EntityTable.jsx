import React, { useState } from 'react';
import { Database, ShieldCheck, Copy, Check, ExternalLink, Hash, Code, AlertTriangle, Layers } from 'lucide-react';

export default function EntityTable({ entities = {}, onOpenDoc }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, keyName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const entityRows = [
    {
      key: "orderOrInvoiceId",
      label: "Order / Invoice ID",
      icon: <Hash className="h-3.5 w-3.5 text-blue-500" />,
      value: entities.orderOrInvoiceId,
      placeholder: "None detected"
    },
    {
      key: "productOrSdkVersion",
      label: "Product / SDK Version",
      icon: <Code className="h-3.5 w-3.5 text-purple-500" />,
      value: entities.productOrSdkVersion,
      placeholder: "None detected"
    },
    {
      key: "errorCode",
      label: "HTTP / Error Code",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
      value: entities.errorCode,
      placeholder: "None detected",
      highlightError: true
    },
    {
      key: "serialNumber",
      label: "Hardware Serial (SN)",
      icon: <Layers className="h-3.5 w-3.5 text-indigo-500" />,
      value: entities.serialNumber,
      placeholder: "None detected"
    },
    {
      key: "detectedPiiRedacted",
      label: "Client PII Masked",
      icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />,
      value: entities.detectedPiiRedacted,
      placeholder: "No PII in stream",
      isPii: true
    }
  ];

  const docs = Array.isArray(entities.kbDocsReferenced) ? entities.kbDocsReferenced : [];

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#0A84FF]" />
          <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-slate-800">
            Structured Entity Extraction
          </h3>
        </div>
        <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          JSON Schema v2.6
        </span>
      </div>

      {/* Key-Value Table */}
      <div className="mt-3 divide-y divide-slate-100 font-mono text-xs">
        {entityRows.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-2 hover:bg-slate-50/60 px-1 rounded transition-colors">
            <div className="flex items-center gap-2 text-slate-500 min-w-[150px]">
              {row.icon}
              <span className="font-medium text-[11px]">{row.label}</span>
            </div>

            <div className="flex items-center gap-2 truncate text-right">
              {row.value ? (
                <>
                  <span
                    className={`font-semibold truncate max-w-[220px] px-2 py-0.5 rounded ${
                      row.isPii
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : row.highlightError
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-900 border border-slate-200"
                    }`}
                  >
                    {row.value}
                  </span>
                  <button
                    onClick={() => copyToClipboard(row.value, row.key)}
                    className="text-slate-400 hover:text-slate-700 p-1"
                    title={`Copy ${row.value}`}
                  >
                    {copiedKey === row.key ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </>
              ) : (
                <span className="text-slate-400 italic text-[11px]">{row.placeholder}</span>
              )}
            </div>
          </div>
        ))}

        {/* KB Documents Referenced Row */}
        <div className="flex items-center justify-between py-2 hover:bg-slate-50/60 px-1 rounded transition-colors">
          <div className="flex items-center gap-2 text-slate-500 min-w-[150px]">
            <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium text-[11px]">KB Docs Referenced</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {docs.length > 0 ? (
              docs.map((docId) => (
                <button
                  key={docId}
                  onClick={() => onOpenDoc && onOpenDoc(docId)}
                  className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0A84FF] hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  [{docId}]
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>
              ))
            ) : (
              <span className="text-slate-400 italic text-[11px]">None cited yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
