import React, { useState, useEffect } from 'react';
import TopNavbar from './components/TopNavbar';
import ChatPane from './components/ChatPane';
import AdminDashboard from './components/AdminDashboard';
import EscalationModal from './components/EscalationModal';
import KnowledgeBaseDrawer from './components/KnowledgeBaseDrawer';
import PromptInspector from './components/PromptInspector';

import { DEFAULT_KNOWLEDGE_DOCS, getCompiledKnowledgeBaseText } from './data/knowledgeBase';
import { sanitizePii } from './utils/piiGuardrail';
import {
  getActiveApiKey,
  setActiveApiKey,
  callGroqChat,
  callGroqJson,
  extractSimulatedTelemetry,
  generateSimulatedActionPlan
} from './services/groqService';
import {
  buildChatSystemPrompt,
  TELEMETRY_EXTRACTOR_PROMPT,
  ACTION_PLAN_PROMPT
} from './prompts/promptTemplates';

// Baseline starting telemetry
const INITIAL_TELEMETRY = {
  sentiment: "Neutral",
  sentimentScore: 50,
  urgency: "Medium",
  urgencyScore: 50,
  urgencyReasoning: "Awaiting customer diagnostic telemetry.",
  userIntent: "Support Inquiry",
  secondaryIntent: "Documentation Verification",
  targetDepartment: "General Support Tier-1",
  adaptiveToneApplied: "Concise & Warm",
  extractedEntities: {
    orderOrInvoiceId: null,
    productOrSdkVersion: null,
    errorCode: null,
    serialNumber: null,
    detectedPiiRedacted: null,
    kbDocsReferenced: []
  },
  liveSummary: "Awaiting customer turn to synthesize root cause and diagnostic milestones.",
  recommendedUiAction: "NONE"
};

export default function App() {
  const [activeView, setActiveView] = useState("split"); // "split" | "chat" | "admin" | "prompts"
  const [apiKey, setApiKeyState] = useState(getActiveApiKey());
  const [knowledgeDocs, setKnowledgeDocs] = useState(DEFAULT_KNOWLEDGE_DOCS);
  const [isKbOpen, setIsKbOpen] = useState(false);
  const [highlightDocId, setHighlightDocId] = useState(null);

  // Conversation & Telemetry State
  const [messages, setMessages] = useState([]);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [lastRawJson, setLastRawJson] = useState(INITIAL_TELEMETRY);
  const [isLoading, setIsLoading] = useState(false);

  // Escalation Modal & Action Plan
  const [isEscalationOpen, setIsEscalationOpen] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Admin Audit Log
  const [auditLog, setAuditLog] = useState([]);

  const handleApiKeyChange = (newKey) => {
    setApiKeyState(newKey);
    setActiveApiKey(newKey);
  };

  const handleOpenDoc = (docId) => {
    setHighlightDocId(docId);
    setIsKbOpen(true);
  };

  // Triggered when user sends a chat message
  const handleSendMessage = async (rawText) => {
    if (!rawText.trim() || isLoading) return;

    // 1. Client-Side PII Guardrail Scrubbing
    const piiResult = sanitizePii(rawText);
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: piiResult.sanitizedText,
      piiSanitized: piiResult.piiDetected,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 2. Build Grounded Chat System Prompt (Prompt #1)
      const kbCompiledText = getCompiledKnowledgeBaseText(knowledgeDocs);
      const systemPrompt = buildChatSystemPrompt(kbCompiledText, telemetry);

      // 3. Execute Chat Completion (Live Groq or Fallback Simulation)
      const chatResult = await callGroqChat({
        messages: updatedMessages,
        systemPrompt,
        telemetry
      });

      // Extract citation tags from reply
      const citationsMatch = chatResult.text.match(/\[DOC-\d{3}\]/g) || [];
      const cleanCitations = [...new Set(citationsMatch.map(c => c.replace(/[\[\]]/g, '')))];

      const assistantMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: chatResult.text,
        latencyMs: chatResult.latencyMs,
        tone: telemetry.adaptiveToneApplied,
        isSimulation: chatResult.isSimulation,
        citations: cleanCitations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // 4. Background Telemetry Extraction (Prompt #2)
      const fullTranscript = finalMessages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

      const telemetryResult = await callGroqJson({
        systemPrompt: TELEMETRY_EXTRACTOR_PROMPT,
        userPrompt: `CONVERSATION TRANSCRIPT TO ANALYZE:\n${fullTranscript}`,
        fallbackGenerator: () => extractSimulatedTelemetry(finalMessages, piiResult)
      });

      if (telemetryResult?.data) {
        setTelemetry(telemetryResult.data);
        setLastRawJson(telemetryResult.data);
      }
    } catch (err) {
      console.error("Pipeline turn error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load a Pre-Configured Demo Scenario
  const handleLoadScenario = (scenario) => {
    // Reset conversation and inject scenario message
    setMessages([]);
    handleSendMessage(scenario.message);
  };

  const handleResetChat = () => {
    setMessages([]);
    setTelemetry(INITIAL_TELEMETRY);
    setLastRawJson(INITIAL_TELEMETRY);
    setActionPlan(null);
  };

  // Trigger One-Click Administrative Action
  const handleTriggerAction = (action) => {
    // 1. Add interactive action card directly to the customer chat stream
    const actionMessage = {
      id: `msg-${Date.now()}-action`,
      role: "assistant",
      content: `### Interactive Action Executed: ${action.title}\nAn administrative resolution action was dispatched to your account. Details are verified below:`,
      actionCard: action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, actionMessage]);

    // 2. Record to Admin Audit Trail
    const auditEntry = {
      time: new Date().toLocaleTimeString(),
      action: action.title,
      target: action.invoiceId || action.ticketId || action.code,
      operator: "Admin Console (NexusSupport UI)"
    };
    setAuditLog(prev => [auditEntry, ...prev]);
  };

  // Open Escalation Modal & Generate Action Plan (Prompt #3)
  const handleOpenEscalation = async () => {
    setIsEscalationOpen(true);
    setIsGeneratingPlan(true);

    try {
      const fullTranscript = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

      const promptUser = `ACTIVE CONVERSATION TRANSCRIPT:\n${fullTranscript}\n\nACTIVE TELEMETRY:\n${JSON.stringify(telemetry, null, 2)}`;

      const planResult = await callGroqJson({
        systemPrompt: ACTION_PLAN_PROMPT,
        userPrompt: promptUser,
        fallbackGenerator: () => generateSimulatedActionPlan(messages, telemetry)
      });

      if (planResult?.data) {
        setActionPlan(planResult.data);
      }
    } catch (err) {
      console.error("Action plan generation error:", err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Send Human Agent Takeover Message into Chat
  const handleSendAsHuman = (agentText) => {
    const humanMsg = {
      id: `msg-${Date.now()}-human`,
      role: "human_agent",
      content: agentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, humanMsg]);

    // Update telemetry to reflect human agent takeover
    setTelemetry(prev => ({
      ...prev,
      liveSummary: `Human support escalation lead took over session. Action plan dispatched with direct customer communication.`,
      urgency: "Medium",
      urgencyScore: 40,
      sentiment: "Calm",
      sentimentScore: 75
    }));

    // Audit log
    setAuditLog(prev => [
      {
        time: new Date().toLocaleTimeString(),
        action: "Human Agent Takeover Reply Sent",
        target: "Sarah Chen (Tier-2 Lead)",
        operator: "Lead Support Specialist"
      },
      ...prev
    ]);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#F8FAFC] overflow-hidden">
      {/* 1. Sleek Top Navigation Bar */}
      <TopNavbar
        activeView={activeView}
        onViewChange={setActiveView}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
        onOpenKnowledgeBase={() => setIsKbOpen(true)}
        knowledgeDocsCount={knowledgeDocs.length}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 overflow-hidden relative">
        {/* VIEW 1: SPLIT DEMO VIEW (5-col Customer Chat / 7-col Admin Telemetry) */}
        {activeView === "split" && (
          <div className="grid h-full grid-cols-1 lg:grid-cols-12 overflow-hidden">
            <div className="h-full lg:col-span-5 overflow-hidden">
              <ChatPane
                messages={messages}
                onSendMessage={handleSendMessage}
                onResetChat={handleResetChat}
                onLoadScenario={handleLoadScenario}
                isLoading={isLoading}
                telemetry={telemetry}
                onOpenDoc={handleOpenDoc}
              />
            </div>
            <div className="h-full lg:col-span-7 overflow-hidden">
              <AdminDashboard
                telemetry={telemetry}
                onTriggerAction={handleTriggerAction}
                onOpenEscalation={handleOpenEscalation}
                auditLog={auditLog}
                onOpenDoc={handleOpenDoc}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: CUSTOMER CHAT VIEW (Focused 100% Full-Width) */}
        {activeView === "chat" && (
          <div className="mx-auto h-full max-w-4xl shadow-sm border-x border-[#E2E8F0]">
            <ChatPane
              messages={messages}
              onSendMessage={handleSendMessage}
              onResetChat={handleResetChat}
              onLoadScenario={handleLoadScenario}
              isLoading={isLoading}
              telemetry={telemetry}
              onOpenDoc={handleOpenDoc}
            />
          </div>
        )}

        {/* VIEW 3: ADMIN COMMAND CENTER (Focused 100% Full-Width) */}
        {activeView === "admin" && (
          <div className="h-full w-full">
            <AdminDashboard
              telemetry={telemetry}
              onTriggerAction={handleTriggerAction}
              onOpenEscalation={handleOpenEscalation}
              auditLog={auditLog}
              onOpenDoc={handleOpenDoc}
            />
          </div>
        )}

        {/* VIEW 4: PROMPT ARCHITECTURE INSPECTOR (Judges & Engineering) */}
        {activeView === "prompts" && (
          <div className="h-full w-full">
            <PromptInspector
              telemetry={telemetry}
              knowledgeDocs={knowledgeDocs}
              lastRawJson={lastRawJson}
            />
          </div>
        )}
      </main>

      {/* 3. Knowledge Base Drawer / Modal */}
      <KnowledgeBaseDrawer
        isOpen={isKbOpen}
        onClose={() => {
          setIsKbOpen(false);
          setHighlightDocId(null);
        }}
        knowledgeDocs={knowledgeDocs}
        onUpdateDocs={setKnowledgeDocs}
        highlightDocId={highlightDocId}
      />

      {/* 4. Escalation Co-Pilot Modal */}
      <EscalationModal
        isOpen={isEscalationOpen}
        onClose={() => setIsEscalationOpen(false)}
        actionPlan={actionPlan}
        isLoading={isGeneratingPlan}
        onSendAsHuman={handleSendAsHuman}
      />
    </div>
  );
}
