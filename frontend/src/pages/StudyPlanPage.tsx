import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { StudyPlanData, RevisionCard } from '../types';
import {
  Calendar, Clock, Target, BookOpen, Brain,
  Layers, CreditCard, FileText, Loader2, Sparkles
} from 'lucide-react';

export default function StudyPlanPage() {
  const { activeCourse } = useApp();
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyHours, setDailyHours] = useState(2);
  const [examDate, setExamDate] = useState('');

  // Revision
  const [revisionType, setRevisionType] = useState<string | null>(null);
  const [revisionTopic, setRevisionTopic] = useState<string>('');
  const [revisionData, setRevisionData] = useState<any>(null);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!activeCourse) return;
    loadPlan();
  }, [activeCourse]);

  const loadPlan = async () => {
    if (!activeCourse) return;
    setLoading(true);
    try {
      const p: any = await api.getStudyPlan(activeCourse.id, examDate || undefined, dailyHours);
      setPlan(p);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerateRevision = async (type: string, topic: string) => {
    if (!activeCourse) return;
    setRevisionType(type);
    setRevisionTopic(topic);
    setRevisionLoading(true);
    setRevisionData(null);
    setFlippedCards(new Set());
    try {
      const data = await api.generateRevision(activeCourse.id, topic, type);
      setRevisionData(data);
    } catch (e) {
      console.error(e);
    }
    setRevisionLoading(false);
  };

  if (loading) {
    return <div className="space-y-4"><div className="skeleton h-8 w-48" /><div className="skeleton h-64" /><div className="skeleton h-48" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-6 h-6 text-[var(--color-primary-400)]" />
        <h2 className="text-xl font-bold text-white">Study Plan</h2>
      </div>

      {/* Settings */}
      <div className="glass-card p-5">
        <div className="flex gap-6 items-end">
          <div>
            <label className="text-xs text-[var(--color-text-dim)] block mb-1.5">Exam Date (optional)</label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="input-field py-2"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-dim)] block mb-1.5">Daily Study Hours: {dailyHours}h</label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={dailyHours}
              onChange={e => setDailyHours(parseFloat(e.target.value))}
              className="w-48 accent-[var(--color-primary-500)]"
            />
          </div>
          <button onClick={loadPlan} className="btn-primary py-2">
            <Sparkles className="w-4 h-4" />
            Update Plan
          </button>
        </div>
      </div>

      {plan && (
        <>
          {/* Today's Plan */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Today's Recommended Learning
              <span className="text-xs text-[var(--color-text-dim)] font-normal ml-2">
                ({plan.total_study_time} min total)
              </span>
            </h3>
            <div className="space-y-3">
              {plan.daily_plan.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-500)]/20 flex items-center justify-center text-[var(--color-primary-300)] font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.action} — {item.topic}</p>
                    <p className="text-xs text-[var(--color-text-dim)]">{item.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-text-dim)]" />
                    <span className="text-sm text-[var(--color-text-muted)]">{item.time_minutes} min</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleGenerateRevision('flashcards', item.topic)} className="btn-secondary py-1.5 px-2.5 text-xs">
                      <CreditCard className="w-3 h-3" /> Cards
                    </button>
                    <button onClick={() => handleGenerateRevision('notes', item.topic)} className="btn-secondary py-1.5 px-2.5 text-xs">
                      <FileText className="w-3 h-3" /> Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak vs Strong */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Weak Topics (Priority)
              </h3>
              {plan.weak_topics.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-sm text-white">{t.topic}</span>
                  <span className="text-xs font-mono text-red-400">{Math.round(t.mastery * 100)}%</span>
                </div>
              ))}
              {plan.weak_topics.length === 0 && <p className="text-sm text-[var(--color-text-dim)]">No weak topics! 🎉</p>}
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Strong Topics
              </h3>
              {plan.strong_topics.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-sm text-white">{t.topic}</span>
                  <span className="text-xs font-mono text-emerald-400">{Math.round(t.mastery * 100)}%</span>
                </div>
              ))}
              {plan.strong_topics.length === 0 && <p className="text-sm text-[var(--color-text-dim)]">Keep studying to build strong topics!</p>}
            </div>
          </div>
        </>
      )}

      {/* Revision Material */}
      {revisionLoading && (
        <div className="glass-card p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary-400)]" />
          <span className="text-[var(--color-text-muted)]">Generating {revisionType} for {revisionTopic}...</span>
        </div>
      )}

      {revisionData && revisionType === 'flashcards' && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[var(--color-primary-400)]" />
            Flashcards — {revisionTopic}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(revisionData.cards || []).map((card: RevisionCard, i: number) => (
              <div
                key={i}
                onClick={() => setFlippedCards(prev => {
                  const next = new Set(prev);
                  next.has(i) ? next.delete(i) : next.add(i);
                  return next;
                })}
                className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary-400)] transition-all min-h-[120px] flex flex-col justify-between"
              >
                <p className="text-sm text-white">
                  {flippedCards.has(i) ? card.back : card.front}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[var(--color-text-dim)]">{card.source}</span>
                  <span className="text-xs text-[var(--color-primary-400)]">
                    {flippedCards.has(i) ? 'Click to see question' : 'Click to reveal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {revisionData && revisionType === 'notes' && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Quick Notes — {revisionTopic}
          </h3>
          <div className="prose prose-invert prose-sm max-w-none p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <pre className="whitespace-pre-wrap text-sm text-[var(--color-text)] leading-relaxed font-sans">
              {revisionData.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
