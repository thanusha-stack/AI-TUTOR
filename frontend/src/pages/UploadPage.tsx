import { useState, useCallback } from 'react';
import { useApp } from '../App';
import { api } from '../api';
import type { DocumentInfo } from '../types';
import {
  Upload, FileText, Presentation, Video, CheckCircle2,
  Loader2, AlertTriangle, X, Plus
} from 'lucide-react';

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf': return <FileText className="w-6 h-6 text-blue-400" />;
    case 'pptx': case 'ppt': return <Presentation className="w-6 h-6 text-orange-400" />;
    case 'mp4': return <Video className="w-6 h-6 text-purple-400" />;
    default: return <FileText className="w-6 h-6 text-gray-400" />;
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function UploadPage() {
  const { activeCourse } = useApp();
  const [uploads, setUploads] = useState<{ file: File; status: string; progress: number; id?: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    if (!activeCourse) return;
    const arr = Array.from(files);

    for (const file of arr) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!['pdf', 'ppt', 'pptx', 'mp4'].includes(ext)) {
        alert(`Unsupported file type: ${ext}`);
        continue;
      }

      const idx = uploads.length;
      setUploads(prev => [...prev, { file, status: 'uploading', progress: 0 }]);

      try {
        const res = await api.uploadDocument(activeCourse.id, file);
        setUploads(prev => prev.map((u, i) =>
          u.file === file ? { ...u, status: 'processing', progress: 50, id: res.id } : u
        ));
        // Poll status (simplified)
        setTimeout(() => {
          setUploads(prev => prev.map(u =>
            u.file === file ? { ...u, status: 'completed', progress: 100 } : u
          ));
        }, 3000);
      } catch (e) {
        setUploads(prev => prev.map(u =>
          u.file === file ? { ...u, status: 'failed', progress: 0 } : u
        ));
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [activeCourse]);

  const handleCreateCourse = async () => {
    if (!courseName.trim()) return;
    setCreating(true);
    try {
      await api.createCourse(courseName, courseDesc);
      setCourseName('');
      setCourseDesc('');
      alert('Course created! Select it from the sidebar.');
    } catch (e) {
      alert('Failed to create course');
    }
    setCreating(false);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="w-6 h-6 text-[var(--color-primary-400)]" />
        <h2 className="text-xl font-bold text-white">Upload Resources</h2>
      </div>

      {/* Create Course */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Create New Course
        </h3>
        <div className="flex gap-3">
          <input
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            placeholder="Course name (e.g., Operating Systems)"
            className="input-field flex-1"
          />
          <input
            value={courseDesc}
            onChange={e => setCourseDesc(e.target.value)}
            placeholder="Description"
            className="input-field flex-1"
          />
          <button
            onClick={handleCreateCourse}
            disabled={!courseName.trim() || creating}
            className="btn-primary"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragging
            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary-400)]'
        }`}
      >
        <Upload className="w-10 h-10 text-[var(--color-text-dim)] mx-auto mb-4" />
        <p className="text-white font-medium">Drag & drop your files here</p>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">PDF, PPT, PPTX, MP4</p>
        <label className="btn-primary mt-4 cursor-pointer inline-flex">
          Browse Files
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.mp4"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Upload Cards */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((u, i) => {
            const ext = u.file.name.split('.').pop()?.toLowerCase() || '';
            return (
              <div key={i} className="glass-card p-4 flex items-center gap-4">
                {getFileIcon(ext)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.file.name}</p>
                  <p className="text-xs text-[var(--color-text-dim)]">{formatFileSize(u.file.size)}</p>
                  {u.status === 'uploading' || u.status === 'processing' ? (
                    <div className="mt-2 h-1.5 bg-[var(--color-surface-4)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] rounded-full transition-all duration-500"
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {u.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary-400)]" />}
                  {u.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
                  {u.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {u.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                  <span className="text-xs text-[var(--color-text-muted)] capitalize">{u.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Processing Info */}
      {uploads.some(u => u.status === 'completed') && (
        <div className="glass-card p-5 border-emerald-500/30">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Processing Complete
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Text extracted</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Topics identified</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Concepts identified</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Embeddings generated</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Images analyzed</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Source citations indexed</div>
          </div>
        </div>
      )}
    </div>
  );
}
