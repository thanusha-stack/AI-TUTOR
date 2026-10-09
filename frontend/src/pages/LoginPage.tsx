import { Brain, Sparkles, ArrowRight, BookOpen, Search, Target, BarChart3 } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-primary-600)]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--color-accent-500)]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-primary-500)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)] flex items-center justify-center shadow-lg shadow-[var(--color-primary-500)]/25 animate-pulse-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          StudyMate AI
        </h1>
        <p className="text-lg text-[var(--color-text-muted)] mb-8">
          Personalized Tutoring & Adaptive Learning
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: BookOpen, label: 'Understand your course', color: 'from-blue-500/20 to-blue-600/5' },
            { icon: Search, label: 'Trust every answer', color: 'from-purple-500/20 to-purple-600/5' },
            { icon: Target, label: 'Practice what you need', color: 'from-emerald-500/20 to-emerald-600/5' },
            { icon: BarChart3, label: 'Track your progress', color: 'from-amber-500/20 to-amber-600/5' },
          ].map((f, i) => (
            <div key={i} className={`glass-card p-4 bg-gradient-to-br ${f.color}`}>
              <f.icon className="w-5 h-5 text-[var(--color-primary-300)] mb-2" />
              <p className="text-sm text-[var(--color-text)]">{f.label}</p>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <button
          onClick={onLogin}
          className="w-full btn-primary py-4 text-base justify-center rounded-2xl group"
        >
          <Sparkles className="w-5 h-5" />
          Continue as Demo Student
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-xs text-[var(--color-text-dim)] mt-4">
          No signup required • Full demo with sample OS course
        </p>
      </div>
    </div>
  );
}
