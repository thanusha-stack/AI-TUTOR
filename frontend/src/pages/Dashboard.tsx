import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { DashboardData } from '../types';
import { Link } from 'react-router-dom';
import {
  Trophy, Target, AlertTriangle, HelpCircle, Flame,
  ArrowRight, BookOpen, Brain, TrendingUp, ChevronRight
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { activeCourse } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCourse) return;
    setLoading(true);
    api.getDashboard(activeCourse.id).then((d: any) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeCourse]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-80" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28" />)}
        </div>
        <div className="skeleton h-64" />
      </div>
    );
  }

  const stats = [
    { label: 'Overall Mastery', value: `${data.overall_mastery}%`, icon: Trophy, color: 'text-yellow-400', bg: 'from-yellow-500/15 to-yellow-600/5' },
    { label: 'Topics Mastered', value: `${data.topics_mastered}/${data.topics_total}`, icon: Target, color: 'text-emerald-400', bg: 'from-emerald-500/15 to-emerald-600/5' },
    { label: 'Needs Attention', value: data.topics_needing_attention, icon: AlertTriangle, color: 'text-amber-400', bg: 'from-amber-500/15 to-amber-600/5' },
    { label: 'Questions Answered', value: data.questions_answered, icon: HelpCircle, color: 'text-blue-400', bg: 'from-blue-500/15 to-blue-600/5' },
    { label: 'Study Streak', value: `${data.study_streak} days`, icon: Flame, color: 'text-orange-400', bg: 'from-orange-500/15 to-orange-600/5' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {getGreeting()}, {data.user.name} 👋
        </h2>
        <p className="text-[var(--color-text-muted)] mt-1">Here's your learning overview for <span className="text-[var(--color-primary-400)]">{activeCourse?.name}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card bg-gradient-to-br ${s.bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Weak Areas */}
        <div className="glass-card p-5 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Your Weak Areas
            </h3>
          </div>
          <div className="space-y-3">
            {data.weak_areas.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{w.topic}</p>
                  <div className="mt-1 h-1.5 bg-[var(--color-surface-4)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${w.mastery}%`,
                        background: w.mastery < 50 ? 'var(--color-danger)' : w.mastery < 70 ? 'var(--color-warning)' : 'var(--color-success)',
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-[var(--color-text-muted)]">
                  {w.mastery}%
                </span>
              </div>
            ))}
            {data.weak_areas.length === 0 && (
              <p className="text-sm text-[var(--color-text-dim)]">No weak areas detected! 🎉</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-card p-5 col-span-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-[var(--color-primary-400)]" />
            Recommended Next
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((r, i) => (
              <Link
                key={i}
                to="/study-plan"
                className="block p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary-400)] transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{r.action}</p>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-dim)] group-hover:text-[var(--color-primary-400)] transition-colors" />
                </div>
                <p className="text-xs text-[var(--color-text-dim)] mt-1">{r.reason}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="glass-card p-5 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Recent Assessments
            </h3>
            <Link to="/assessment" className="text-xs text-[var(--color-primary-400)] hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.recent_assessments.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--color-surface-2)]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${a.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : a.score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                  {Math.round(a.score)}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.title}</p>
                  <p className="text-xs text-[var(--color-text-dim)]">
                    {a.difficulty} • {new Date(a.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why StudyMate */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Why StudyMate AI?</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { emoji: '📚', text: 'Understand your course' },
            { emoji: '🔎', text: 'Trust every answer' },
            { emoji: '🧠', text: 'Learn by your mastery' },
            { emoji: '🎯', text: 'Practice what you need' },
            { emoji: '📊', text: 'Track your progress' },
          ].map((f, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <span className="text-2xl">{f.emoji}</span>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
