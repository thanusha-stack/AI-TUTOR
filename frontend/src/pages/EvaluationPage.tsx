import { useState, useEffect } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { EvaluationData } from '../types';
import {
  FlaskConical, Play, Loader2, CheckCircle2, AlertTriangle,
  BarChart3, Target, TrendingUp, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function EvaluationPage() {
  const { activeCourse } = useApp();
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!activeCourse) return;
    api.getEvaluationResults(activeCourse.id).then((d: any) => {
      if (d) setData(d);
      setInitialLoad(false);
    }).catch(() => setInitialLoad(false));
  }, [activeCourse]);

  const runEvaluation = async () => {
    if (!activeCourse) return;
    setLoading(true);
    try {
      const res: any = await api.runEvaluation(activeCourse.id);
      setData(res);
    } catch (e) {
      alert('Evaluation failed');
    }
    setLoading(false);
  };

  const metrics = data ? [
    { label: 'Faithfulness', value: data.faithfulness, color: '#6366f1', desc: 'Answer fidelity to source material' },
    { label: 'Answer Relevancy', value: data.answer_relevancy, color: '#10b981', desc: 'How relevant answers are to questions' },
    { label: 'Context Precision', value: data.context_precision, color: '#f59e0b', desc: 'Precision of retrieved contexts' },
    { label: 'Context Recall', value: data.context_recall, color: '#3b82f6', desc: 'Coverage of needed information' },
  ] : [];

  const personMetrics = data?.personalization ? [
    { label: 'Mastery Gain', value: data.personalization.mastery_gain, suffix: '%', color: '#10b981' },
    { label: 'Question Repetition', value: data.personalization.question_repetition_rate, suffix: '%', color: '#f59e0b' },
    { label: 'Weak Topic Improvement', value: data.personalization.weak_topic_improvement, suffix: '%', color: '#6366f1' },
  ] : [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-[var(--color-primary-400)]" />
          <h2 className="text-xl font-bold text-white">RAG Evaluation</h2>
        </div>
        <button
          onClick={runEvaluation}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Running Evaluation...' : 'Run Evaluation'}
        </button>
      </div>

      {loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary-400)]" />
          <p className="text-[var(--color-text-muted)]">Evaluating RAG pipeline against test dataset...</p>
          <p className="text-xs text-[var(--color-text-dim)]">Testing faithfulness, relevancy, precision, and recall</p>
        </div>
      )}

      {!loading && !data && !initialLoad && (
        <div className="glass-card p-12 text-center">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-dim)] opacity-50" />
          <p className="text-[var(--color-text-muted)]">No evaluation results yet.</p>
          <p className="text-sm text-[var(--color-text-dim)] mt-1">Click "Run Evaluation" to evaluate the RAG pipeline.</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* RAG Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="stat-card">
                <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-2">{m.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold" style={{ color: m.color }}>{m.value}%</p>
                </div>
                <p className="text-xs text-[var(--color-text-dim)] mt-1">{m.desc}</p>
                <div className="mt-2 h-2 bg-[var(--color-surface-4)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--color-primary-400)]" />
                RAG Quality Metrics
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-dim)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'white' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {metrics.map((m, i) => <Cell key={i} fill={m.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Personalization Metrics
              </h3>
              <div className="space-y-4 pt-4">
                {personMetrics.map((m, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{m.label}</span>
                      <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}{m.suffix}</span>
                    </div>
                    <div className="h-3 bg-[var(--color-surface-4)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(m.value, 100)}%`, backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          {data.details && data.details.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Test Questions Detail</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 px-3 text-[var(--color-text-dim)] font-medium">Question</th>
                      <th className="text-left py-3 px-3 text-[var(--color-text-dim)] font-medium">Type</th>
                      <th className="text-center py-3 px-3 text-[var(--color-text-dim)] font-medium">Grounded</th>
                      <th className="text-center py-3 px-3 text-[var(--color-text-dim)] font-medium">Faith.</th>
                      <th className="text-center py-3 px-3 text-[var(--color-text-dim)] font-medium">Relev.</th>
                      <th className="text-center py-3 px-3 text-[var(--color-text-dim)] font-medium">Prec.</th>
                      <th className="text-center py-3 px-3 text-[var(--color-text-dim)] font-medium">Recall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.details.map((d, i) => (
                      <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-surface-3)] transition-colors">
                        <td className="py-3 px-3 text-white max-w-xs truncate">{d.question}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            d.type === 'off_material' ? 'bg-amber-500/20 text-amber-400' :
                            d.type === 'multi_hop' ? 'bg-purple-500/20 text-purple-400' :
                            d.type === 'citation' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {d.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {d.is_grounded ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto" />}
                        </td>
                        <td className="py-3 px-3 text-center text-white">{(d.faithfulness * 100).toFixed(0)}%</td>
                        <td className="py-3 px-3 text-center text-white">{(d.relevancy * 100).toFixed(0)}%</td>
                        <td className="py-3 px-3 text-center text-white">{(d.precision * 100).toFixed(0)}%</td>
                        <td className="py-3 px-3 text-center text-white">{(d.recall * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[var(--color-text-dim)] mt-3">
                Evaluated {data.total_questions} test questions • {data.timestamp && `Last run: ${new Date(data.timestamp).toLocaleString()}`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
