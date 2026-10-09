import { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { ChatMessage, Citation } from '../types';
import {
  MessageSquare, Send, FileText, Presentation, Video,
  CheckCircle2, AlertTriangle, Sparkles, Loader2, Info
} from 'lucide-react';

function CitationChip({ citation, onClick }: { citation: Citation; onClick: () => void }) {
  const icon = citation.source_type === 'pdf' ? <FileText className="w-3 h-3" /> :
    citation.source_type === 'pptx' ? <Presentation className="w-3 h-3" /> :
    <Video className="w-3 h-3" />;

  const label = citation.source_type === 'pdf' ? `Page ${citation.page_number}` :
    citation.source_type === 'pptx' ? `Slide ${citation.slide_number}` :
    citation.timestamp_start || 'Source';

  return (
    <button onClick={onClick} className="citation-chip">
      {icon}
      <span>{citation.source_name} — {label}</span>
    </button>
  );
}

export default function AITutor() {
  const { activeCourse, language } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [viewingSource, setViewingSource] = useState<Citation | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeCourse || loading) return;
    const q = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res: any = await api.askTutor(activeCourse.id, q, sessionId, language);
      setSessionId(res.session_id);

      const asstMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        is_grounded: res.is_grounded,
      };
      setMessages(prev => [...prev, asstMsg]);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${e.message}. Please try again.`,
        is_grounded: false,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestedQuestions = [
    "What are the necessary conditions for deadlock?",
    "Explain context switching with an example.",
    "What is the difference between threads and processes?",
    "How does the Banker's Algorithm work?",
    "What are semaphores and how are they used?",
  ];

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)] flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Tutor</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Ask anything about your course material</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-12 h-12 text-[var(--color-primary-400)] mb-4 opacity-50" />
            <p className="text-[var(--color-text-muted)] mb-6">Start a conversation about your course material</p>
            <div className="grid grid-cols-1 gap-2 max-w-md w-full">
              {suggestedQuestions.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); }}
                  className="text-left px-4 py-3 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-primary-400)] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
              {/* Grounding indicator */}
              {msg.role === 'assistant' && msg.is_grounded !== undefined && (
                <div className={`flex items-center gap-1.5 mb-2 text-xs ${msg.is_grounded ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {msg.is_grounded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Course Material</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Outside Knowledge</span>
                    </>
                  )}
                </div>
              )}

              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                  {msg.citations.map((c, i) => (
                    <CitationChip key={i} citation={c} onClick={() => setViewingSource(c)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-assistant flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary-400)]" />
              <span className="text-[var(--color-text-muted)]">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Source Viewer */}
      {viewingSource && (
        <div className="mt-3 p-4 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-primary-500)]/30 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-[var(--color-primary-400)]" />
              <span className="font-medium text-white">Source: {viewingSource.source_name}</span>
              <span className="text-[var(--color-text-dim)]">
                {viewingSource.page_number && `— Page ${viewingSource.page_number}`}
                {viewingSource.slide_number && `— Slide ${viewingSource.slide_number}`}
                {viewingSource.timestamp_start && `— ${viewingSource.timestamp_start}`}
              </span>
            </div>
            <button onClick={() => setViewingSource(null)} className="text-xs text-[var(--color-text-dim)] hover:text-white">Close</button>
          </div>
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{viewingSource.content_preview}</p>
        </div>
      )}

      {/* Input */}
      <div className="mt-3 flex gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your course material..."
          className="input-field flex-1 py-3"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="btn-primary px-5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
