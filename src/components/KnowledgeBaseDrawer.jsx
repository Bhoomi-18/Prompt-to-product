import React, { useState, useRef } from 'react';
import { X, BookOpen, Search, Upload, Plus, RefreshCw, Check, FileText, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { DEFAULT_KNOWLEDGE_DOCS } from '../data/knowledgeBase';

export default function KnowledgeBaseDrawer({
  isOpen,
  onClose,
  knowledgeDocs,
  onUpdateDocs,
  highlightDocId
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocId, setEditingDocId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Filter docs
  const filteredDocs = knowledgeDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (doc) => {
    setEditingDocId(doc.id);
    setEditContent(doc.content);
  };

  const saveEditing = (docId) => {
    const updated = knowledgeDocs.map(d =>
      d.id === docId ? { ...d, content: editContent, lastUpdated: new Date().toISOString().split('T')[0] } : d
    );
    onUpdateDocs(updated);
    setEditingDocId(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset knowledge base to verified default documents?")) {
      onUpdateDocs(DEFAULT_KNOWLEDGE_DOCS);
      setEditingDocId(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        let newDocs = [...knowledgeDocs];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            newDocs = [...newDocs, ...parsed];
          } else if (parsed.content) {
            newDocs.push(parsed);
          }
        } else {
          // Plain text or markdown
          const newDoc = {
            id: `DOC-${Math.floor(400 + Math.random() * 500)}`,
            title: file.name.replace(/\.[^/.]+$/, ""),
            category: "Uploaded Documentation",
            lastUpdated: new Date().toISOString().split('T')[0],
            content: `[DOC-CUSTOM: ${file.name}]\n${text}`
          };
          newDocs.push(newDoc);
        }

        onUpdateDocs(newDocs);
      } catch (err) {
        alert("Failed to parse file: " + err.message);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl border-l border-[#E2E8F0]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A84FF] text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Dynamic Grounding Knowledge Base
                </h3>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 font-mono text-[10px] font-bold text-[#0A84FF]">
                  {knowledgeDocs.length} DOCS LOADED
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Live technical and billing guidelines injected into Prompt #1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1 rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Reset Knowledge Base"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & File Upload */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 bg-white p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge docs..."
              className="w-full rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0A84FF] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-[8px] border border-[#0A84FF] bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0A84FF] hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? "Uploading..." : "Upload Doc (.txt/.md/.json)"}</span>
            </button>
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No matching knowledge base documents found.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isHighlighted = highlightDocId === doc.id;
              const isEditing = editingDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`rounded-[10px] border transition-all ${
                    isHighlighted
                      ? "border-[#0A84FF] ring-2 ring-blue-400/30 bg-blue-50/20 shadow-xs"
                      : "border-[#E2E8F0] bg-white shadow-xs"
                  }`}
                >
                  {/* Doc Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-[#F8FAFC] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0A84FF] bg-white px-2 py-0.5 rounded border border-blue-200">
                        {doc.id}
                      </span>
                      <h4 className="font-heading text-xs font-bold text-slate-900">
                        {doc.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                        {doc.lastUpdated}
                      </span>
                      {isEditing ? (
                        <button
                          onClick={() => saveEditing(doc.id)}
                          className="flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(doc)}
                          className="flex items-center gap-1 rounded border border-[#E2E8F0] bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Doc Body */}
                  <div className="p-4">
                    {isEditing ? (
                      <textarea
                        rows={8}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-[8px] border border-blue-300 p-3 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0A84FF]"
                      />
                    ) : (
                      <pre className="font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {doc.content}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Target Model: llama-3.3-70b-versatile</span>
          <span>Injected: &lt;knowledge_base&gt; Block</span>
        </div>
      </div>
    </div>
  );
}
