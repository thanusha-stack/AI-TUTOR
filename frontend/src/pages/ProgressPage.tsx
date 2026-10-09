import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { MasteryInfo, TopicGraphData } from '../types';
import {
  BarChart3, TrendingUp, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell, Legend
} from 'recharts';

export default function ProgressPage() {
  const { activeCourse } = useApp();
  const [mastery, setMastery] = useState<MasteryInfo[]>([]);
  const [graphData, setGraphData] = useState<TopicGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCourse) return;
    setLoading(true);
    Promise.all([
      api.getMastery(activeCourse.id),
      api.getTopicGraph(activeCourse.id),
    ]).then(([m, g]: any) => {
      setMastery(m);
      setGraphData(g);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeCourse]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-80" />
          <div className="skeleton h-80" />
        </div>
      </div>
    );
  }

  const barData = mastery.map(m => ({
    topic: m.topic.length > 15 ? m.topic.substring(0, 12) + '...' : m.topic,
    fullTopic: m.topic,
    mastery: Math.round(m.mastery_score * 100),
    confidence: Math.round(m.confidence * 100),
    attempts: m.attempts,
    correct: m.correct,
  }));

  const radarData = mastery.map(m => ({
    topic: m.topic,
    mastery: Math.round(m.mastery_score * 100),
  }));

  const getBarColor = (value: number) => {
    if (value >= 75) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const overallMastery = mastery.length > 0
    ? Math.round(mastery.reduce((s, m) => s + m.mastery_score, 0) / mastery.length * 100)
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-[var(--color-primary-400)]" />
        <h2 className="text-xl font-bold text-white">Progress Dashboard</h2>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-[var(--color-primary-500)]/15 to-transparent">
          <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">Overall Mastery</p>
          <p className="text-3xl font-bold text-white">{overallMastery}%</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-emerald-500/15 to-transparent">
          <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">Topics Mastered</p>
          <p className="text-3xl font-bold text-emerald-400">{mastery.filter(m => m.mastery_score >= 0.75).length}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-amber-500/15 to-transparent">
          <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">Total Attempts</p>
          <p className="text-3xl font-bold text-amber-400">{mastery.reduce((s, m) => s + m.attempts, 0)}</p>
        </div>
        <div className="stat-card bg-gradient-to-br from-blue-500/15 to-transparent">
          <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">Accuracy</p>
          <p className="text-3xl font-bold text-blue-400">
            {mastery.reduce((s, m) => s + m.attempts, 0) > 0
              ? Math.round(mastery.reduce((s, m) => s + m.correct, 0) / mastery.reduce((s, m) => s + m.attempts, 0) * 100)
              : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Topic Mastery
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--color-text-dim)', fontSize: 12 }} />
              <YAxis dataKey="topic" type="category" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={120} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'white' }}
                formatter={(value: any, name: any) => [`${value}%`, name === 'mastery' ? 'Mastery' : 'Confidence']}
                labelFormatter={(label: any) => barData.find(d => d.topic === label)?.fullTopic || label}
              />
              <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={20}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.mastery)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-primary-400)]" />
            Mastery Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--color-text-dim)', fontSize: 10 }} />
              <Radar name="Mastery" dataKey="mastery" stroke="var(--color-primary-500)" fill="var(--color-primary-500)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mastery Heatmap */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Topic × Mastery Heatmap</h3>
        <div className="grid grid-cols-5 gap-3">
          {mastery.map((m, i) => {
            const pct = Math.round(m.mastery_score * 100);
            const bg = pct >= 75 ? 'bg-emerald-500/30 border-emerald-500/30' :
              pct >= 50 ? 'bg-amber-500/30 border-amber-500/30' :
              'bg-red-500/30 border-red-500/30';
            return (
              <div key={i} className={`p-4 rounded-xl border ${bg} text-center`}>
                <p className="text-sm font-medium text-white">{m.topic}</p>
                <p className="text-2xl font-bold mt-1 text-white">{pct}%</p>
                <p className="text-xs text-[var(--color-text-dim)] mt-1">{m.correct}/{m.attempts} correct</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Flow Graph */}
      {graphData && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Course Flow</h3>
          <div className="flex items-center justify-center gap-6 py-4 overflow-x-auto">
            {graphData.nodes.map((node, i) => {
              const pct = Math.round(node.mastery * 100);
              const color = pct >= 75 ? 'border-emerald-500 bg-emerald-500/10' :
                pct >= 50 ? 'border-amber-500 bg-amber-500/10' :
                'border-red-500 bg-red-500/10';
              return (
                <div key={node.id} className="flex items-center gap-3">
                  <div className={`topic-node ${color} min-w-[120px]`}>
                    <p className="text-sm font-medium text-white">{node.label}</p>
                    <p className="text-lg font-bold text-white mt-1">{pct}%</p>
                  </div>
                  {i < graphData.nodes.length - 1 && (
                    <div className="text-[var(--color-text-dim)] text-2xl">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
