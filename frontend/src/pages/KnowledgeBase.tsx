import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { TopicInfo, SourceInfo } from '../types';
import {
  BookOpen, FileText, Presentation, Video, ChevronRight,
  Layers, Tag, ArrowRight, ExternalLink, Info
} from 'lucide-react';

function SourceIcon({ type }: { type: string }) {
  switch (type) {
    case 'pdf': return <FileText className="w-4 h-4 text-blue-400" />;
    case 'pptx': return <Presentation className="w-4 h-4 text-orange-400" />;
    case 'video': return <Video className="w-4 h-4 text-purple-400" />;
    default: return <FileText className="w-4 h-4 text-gray-400" />;
  }
}

function formatSource(s: SourceInfo) {
  if (s.source_type === 'pdf') return `Page ${s.page_number}`;
  if (s.source_type === 'pptx') return `Slide ${s.slide_number}`;
  if (s.source_type === 'video') return `${s.timestamp_start} – ${s.timestamp_end}`;
  return 'Source';
}

export default function KnowledgeBase() {
  const { activeCourse } = useApp();
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicInfo | null>(null);
  const [sourceContent, setSourceContent] = useState<any[] | null>(null);
  const [viewingSource, setViewingSource] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCourse) return;
    setLoading(true);
    api.getTopics(activeCourse.id).then((t: any) => {
      setTopics(t);
      if (t.length > 0) setSelectedTopic(t[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeCourse]);

  const handleViewSource = async (s: SourceInfo) => {
    if (!activeCourse || !selectedTopic) return;
    try {
      const sources: any = await api.getSources(activeCourse.id, selectedTopic.name);
      const match = sources.find((src: any) => {
        if (s.source_type === 'pdf') return src.page_number === s.page_number;
        if (s.source_type === 'pptx') return src.slide_number === s.slide_number;
        if (s.source_type === 'video') return src.timestamp_start === s.timestamp_start;
        return false;
      });
      setViewingSource(match || sources[0]);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-60" />
        <div className="flex gap-6">
          <div className="w-72 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
          <div className="flex-1 skeleton h-96" />
        </div>
      </div>
    );
  }

  // Group topics by unit
  const units: Record<string, TopicInfo[]> = {};
  topics.forEach(t => {
    const u = t.unit || 'General';
    if (!units[u]) units[u] = [];
    units[u].push(t);
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-[var(--color-primary-400)]" />
        <h2 className="text-xl font-bold text-white">Knowledge Base</h2>
        <span className="text-sm text-[var(--color-text-dim)]">— {activeCourse?.name}</span>
      </div>

      <div className="flex gap-6">
        {/* Topic Tree */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {Object.entries(units).map(([unit, unitTopics]) => (
            <div key={unit}>
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-dim)] font-semibold mb-2 px-2">{unit}</p>
              <div className="space-y-1">
                {unitTopics.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTopic(t); setViewingSource(null); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center gap-2 ${
                      selectedTopic?.id === t.id
                        ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-300)] border border-[var(--color-primary-500)]/30'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{t.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Topic Detail */}
        {selectedTopic ? (
          <div className="flex-1 space-y-5">
            {/* Header */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary-600)]/20 text-[var(--color-primary-300)]">
                  {selectedTopic.unit}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedTopic.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedTopic.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedTopic.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{selectedTopic.name}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{selectedTopic.description}</p>
            </div>

            {/* Subtopics */}
            {selectedTopic.subtopics.length > 0 && (
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--color-primary-400)]" />
                  Subtopics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.subtopics.map(s => (
                    <span key={s.id} className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Concepts */}
            {selectedTopic.concepts.length > 0 && (
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.concepts.map(c => (
                    <span key={c.id} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {selectedTopic.prerequisites.length > 0 && (
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  Prerequisites
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.prerequisites.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const t = topics.find(tt => tt.name === p);
                        if (t) setSelectedTopic(t);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                Sources ({selectedTopic.sources.length})
              </h4>
              <div className="space-y-2">
                {selectedTopic.sources.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleViewSource(s)}
                    className="w-full citation-chip justify-start"
                  >
                    <SourceIcon type={s.source_type} />
                    <span className="font-medium">{s.source_name}</span>
                    <span className="text-[var(--color-text-dim)]">—</span>
                    <span>{formatSource(s)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Viewer Modal */}
            {viewingSource && (
              <div className="glass-card p-5 border-[var(--color-primary-500)]/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-[var(--color-primary-400)]" />
                    Source Content
                  </h4>
                  <button onClick={() => setViewingSource(null)} className="text-xs text-[var(--color-text-dim)] hover:text-white">Close</button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <SourceIcon type={viewingSource.source_type} />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {viewingSource.source_name}
                    {viewingSource.page_number && ` — Page ${viewingSource.page_number}`}
                    {viewingSource.slide_number && ` — Slide ${viewingSource.slide_number}`}
                    {viewingSource.timestamp_start && ` — ${viewingSource.timestamp_start}`}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-sm text-[var(--color-text)] leading-relaxed max-h-64 overflow-y-auto">
                  {viewingSource.content}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--color-text-dim)]">
            Select a topic to view details
          </div>
        )}
      </div>
    </div>
  );
}
