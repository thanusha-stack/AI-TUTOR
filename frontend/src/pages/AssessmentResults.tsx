import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import type { AssessmentResult } from '../types';
import {
  CheckCircle2, XCircle, AlertTriangle, ArrowLeft,
  FileText, Presentation, Video, Trophy, Brain, Target
} from 'lucide-react';

export default function AssessmentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const result: AssessmentResult | null = location.state;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-[var(--color-text-muted)]">No results data available.</p>
        <Link to="/assessment" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Assessments
        </Link>
      </div>
    );
  }

  const scoreColor = result.score >= 80 ? 'text-emerald-400' : result.score >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = result.score >= 80 ? 'from-emerald-500/20 to-emerald-600/5' : result.score >= 60 ? 'from-amber-500/20 to-amber-600/5' : 'from-red-500/20 to-red-600/5';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/assessment')} className="btn-secondary text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Assessments
      </button>

      {/* Score Card */}
      <div className={`glass-card p-8 text-center bg-gradient-to-br ${scoreBg}`}>
        <Trophy className={`w-12 h-12 mx-auto mb-3 ${scoreColor}`} />
        <p className={`text-5xl font-bold ${scoreColor}`}>{Math.round(result.score)}%</p>
        <p className="text-[var(--color-text-muted)] mt-2">
          {result.correct} / {result.total} correct
        </p>
      </div>

      {/* Topic Performance */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--color-primary-400)]" />
          Topic Performance
        </h3>
        <div className="space-y-3">
          {result.topic_performance.map((tp, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-white w-40 truncate">{tp.topic}</span>
              <div className="flex-1 h-3 bg-[var(--color-surface-4)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${tp.percentage}%`,
                    background: tp.percentage >= 80 ? '#10b981' : tp.percentage >= 60 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-sm font-mono text-[var(--color-text-muted)] w-12 text-right">{Math.round(tp.percentage)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Misconceptions */}
      {result.misconceptions.length > 0 && (
        <div className="glass-card p-5 border-amber-500/30">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Possible Misconceptions Detected
          </h3>
          {result.misconceptions.map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
              <p className="text-sm text-amber-300 font-medium">{m.message}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{m.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Results */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Detailed Results</h3>
        <div className="space-y-4">
          {result.results.map((r, i) => (
            <div key={i} className={`p-4 rounded-xl border ${r.is_correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex items-start gap-3">
                {r.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{r.question_text}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs">
                      <span className="text-[var(--color-text-dim)]">Your answer: </span>
                      <span className={r.is_correct ? 'text-emerald-400' : 'text-red-400'}>{r.user_answer || '(no answer)'}</span>
                    </p>
                    {!r.is_correct && (
                      <p className="text-xs">
                        <span className="text-[var(--color-text-dim)]">Correct answer: </span>
                        <span className="text-emerald-400">{r.correct_answer}</span>
                      </p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{r.explanation}</p>
                    {r.source_citation && (
                      <span className="citation-chip text-[10px] mt-1 inline-flex">
                        <FileText className="w-3 h-3" />
                        {r.source_citation}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
