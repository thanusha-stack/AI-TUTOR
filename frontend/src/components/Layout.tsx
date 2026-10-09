import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import {
  LayoutDashboard, BookOpen, Brain, MessageSquare, ClipboardCheck,
  BarChart3, Calendar, FlaskConical, Upload, ChevronDown,
  Search, Bell, Globe, Sparkles
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { path: '/tutor', label: 'AI Tutor', icon: MessageSquare },
  { path: '/assessment', label: 'Assessments', icon: ClipboardCheck },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/study-plan', label: 'Study Plan', icon: Calendar },
  { path: '/evaluation', label: 'Evaluation', icon: FlaskConical },
  { path: '/upload', label: 'Upload', icon: Upload },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
];

export default function Layout() {
  const { user, activeCourse, language, setLanguage } = useApp();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-[var(--color-surface-2)] border-r border-[var(--color-border)] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">StudyMate AI</h1>
              <p className="text-[10px] text-[var(--color-text-dim)] tracking-wider uppercase">Adaptive Learning</p>
            </div>
          </div>
        </div>

        {/* Course Selector */}
        {activeCourse && (
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-3)] cursor-pointer hover:bg-[var(--color-surface-4)] transition-colors">
              <Sparkles className="w-4 h-4 text-[var(--color-primary-400)]" />
              <span className="text-sm font-medium text-[var(--color-text)] truncate flex-1">{activeCourse.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-dim)]" />
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--color-primary-600)]/20 to-transparent text-[var(--color-primary-300)] border-l-2 border-[var(--color-primary-500)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)]'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)] flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Demo Student'}</p>
              <p className="text-xs text-[var(--color-text-dim)] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/80 backdrop-blur-lg flex items-center px-6 gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-dim)]" />
              <input
                type="text"
                placeholder="Search topics, concepts..."
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="btn-secondary py-1.5 px-3 text-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                {languages.find(l => l.code === language)?.label}
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-1 bg-[var(--color-surface-3)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 min-w-[120px]">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-surface-4)] transition-colors ${language === l.code ? 'text-[var(--color-primary-400)]' : 'text-[var(--color-text)]'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-[var(--color-surface-3)] transition-colors">
              <Bell className="w-4.5 h-4.5 text-[var(--color-text-muted)]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary-500)] rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
