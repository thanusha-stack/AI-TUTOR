import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import type { TopicInfo, QuestionInfo, AssessmentInfo } from '../types';
import {
  ClipboardCheck, Sparkles, Loader2, ChevronRight,
  CheckCircle2, XCircle, Flag, ArrowLeft, ArrowRight, Send
} from 'lucide-react';

type Phase = 'config' | 'quiz' | 'submitted';

export default function AssessmentPage() {
  const { activeCourse } = useApp();
  const navigate = useNavigate();

  // Config state
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [types, setTypes] = useState<string[]>(['mcq', 'short_answer']);

  // Quiz state
  const [phase, setPhase] = useState<Phase>('config');
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [assessmentId, setAssessmentId] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Past assessments
  const [pastAssessments, setPastAssessments] = useState<AssessmentInfo[]>([]);

  useEffect(() => {
    if (!activeCourse) return;
    api.getTopics(activeCourse.id).then((t: any) => setTopics(t));
    api.getAssessments(activeCourse.id).then((a: any) => setPastAssessments(a));
  }, [activeCourse]);

  const toggleTopic = (name: string) => {
    setSelectedTopics(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  };

  const toggleType = (t: string) => {
    setTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handleGenerate = async () => {
    if (!activeCourse || selectedTopics.length === 0) return;
    setGenerating(true);
    try {
      const res: any = await api.generateAssessment(
        activeCourse.id, selectedTopics, difficulty, count, types
      );
      setAssessmentId(res.id);
      setQuestions(res.questions);
      setCurrentQ(0);
      setAnswers({});
      setFlagged(new Set());
      setPhase('quiz');
    } catch (e) {
      alert('Failed to generate assessment');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res: any = await api.submitAssessment(assessmentId, answers);
      navigate(`/assessment/${assessmentId}/results`, { state: res });
    } catch (e) {
      alert('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  // CONFIG PHASE
  if (phase === 'config') {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6 text-[var(--color-primary-400)]" />
          <h2 className="text-xl font-bold text-white">Generate Assessment</h2>
        </div>

        {/* Topic Selection */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Select Topics</h3>
          <div className="grid grid-cols-3 gap-2">
            {topics.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.name)}
                className={`text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                  selectedTopics.includes(t.name)
                    ? 'bg-[var(--color-primary-600)]/20 border-[var(--color-primary-500)] text-white'
                    : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedTopics.includes(t.name) ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)]' : 'border-[var(--color-border)]'
                  }`}>
                    {selectedTopics.includes(t.name) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  {t.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Difficulty */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Difficulty</h3>
            <div className="space-y-2">
              {['easy', 'medium', 'hard', 'adaptive'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                    difficulty === d
                      ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-300)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Questions: {count}</h3>
            <input
              type="range"
              min={3}
              max={15}
              value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full accent-[var(--color-primary-500)]"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-dim)] mt-1">
              <span>3</span><span>15</span>
            </div>
          </div>

          {/* Types */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Question Types</h3>
            {['mcq', 'short_answer', 'numerical'].map(t => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm capitalize mb-1 transition-all flex items-center gap-2 ${
                  types.includes(t) ? 'bg-[var(--color-primary-600)]/20 text-[var(--color-primary-300)]' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  types.includes(t) ? 'bg-[var(--color-primary-500)] border-[var(--color-primary-500)]' : 'border-[var(--color-border)]'
                }`}>
                  {types.includes(t) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={selectedTopics.length === 0 || generating}
          className="btn-primary py-3 px-8 text-base"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Generate Assessment
        </button>

        {/* Past Assessments */}
        {pastAssessments.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Past Assessments</h3>
            <div className="space-y-2">
              {pastAssessments.map(a => (
                <div
                  key={a.id}
                  onClick={() => a.completed && navigate(`/assessment/${a.id}/results`, { state: null })}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary-400)] cursor-pointer transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${
                    (a.score || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    (a.score || 0) >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {a.score != null ? `${Math.round(a.score)}%` : '—'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{a.title}</p>
                    <p className="text-xs text-[var(--color-text-dim)]">
                      {a.difficulty} • {a.question_count} questions • {a.created_at && new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-text-dim)]" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // QUIZ PHASE
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
            Question {currentQ + 1} / {questions.length}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Topic: <span className="text-[var(--color-primary-300)]">{q.topic}</span> • Difficulty: <span className="capitalize">{q.difficulty}</span>
          </p>
        </div>
        <button
          onClick={() => setFlagged(prev => {
            const next = new Set(prev);
            next.has(q.id) ? next.delete(q.id) : next.add(q.id);
            return next;
          })}
          className={`btn-secondary py-1.5 px-3 text-xs ${flagged.has(q.id) ? 'border-amber-400 text-amber-400' : ''}`}
        >
          <Flag className="w-3.5 h-3.5" />
          {flagged.has(q.id) ? 'Flagged' : 'Flag'}
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] rounded-full transition-all duration-500"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-card p-6">
        <p className="text-lg font-medium text-white mb-6">{q.question_text}</p>

        {q.question_type === 'mcq' && q.options ? (
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const selected = answers[q.id] === letter;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm transition-all border flex items-center gap-3 ${
                    selected
                      ? 'bg-[var(--color-primary-600)]/20 border-[var(--color-primary-500)] text-white'
                      : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    selected ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--color-surface-4)] text-[var(--color-text-dim)]'
                  }`}>
                    {letter}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={answers[q.id] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder={q.question_type === 'numerical' ? 'Enter a number...' : 'Type your answer...'}
              className="input-field py-3"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentQ ? 'bg-[var(--color-primary-500)] scale-125' :
                answers[questions[i].id] ? 'bg-emerald-500' :
                flagged.has(questions[i].id) ? 'bg-amber-500' :
                'bg-[var(--color-surface-4)]'
              }`}
            />
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(prev => prev + 1)} className="btn-primary">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Assessment
          </button>
        )}
      </div>
    </div>
  );
}
