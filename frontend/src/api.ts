// StudyMate AI - API Service Layer

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: () => request('/auth/login', { method: 'POST', body: JSON.stringify({ mode: 'demo' }) }),

  // Health
  health: () => request<{ status: string; has_openai: boolean; demo_mode: boolean; chunks_indexed: number }>('/health'),

  // Dashboard
  getDashboard: (courseId: string) => request(`/dashboard?course_id=${courseId}`),

  // Courses
  getCourses: () => request('/courses'),
  getCourse: (id: string) => request(`/courses/${id}`),
  createCourse: (name: string, description: string) =>
    request('/courses', { method: 'POST', body: JSON.stringify({ name, description }) }),

  // Documents
  getDocuments: (courseId: string) => request(`/documents/${courseId}`),
  uploadDocument: async (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('file', file);
    const res = await fetch(`${BASE}/documents/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Topics
  getTopics: (courseId: string) => request(`/topics/${courseId}`),
  getTopicGraph: (courseId: string) => request(`/topics/${courseId}/graph`),

  // Tutor
  askTutor: (courseId: string, question: string, sessionId?: string, language: string = 'en') =>
    request('/tutor/query', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, question, session_id: sessionId, language }),
    }),

  // Assessments
  generateAssessment: (courseId: string, topics: string[], difficulty: string, count: number, types: string[]) =>
    request('/assessments/generate', {
      method: 'POST',
      body: JSON.stringify({
        course_id: courseId, topics, difficulty,
        question_count: count, question_types: types,
      }),
    }),
  submitAssessment: (assessmentId: string, answers: Record<string, string>) =>
    request(`/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  getAssessments: (courseId: string) => request(`/assessments/${courseId}`),
  getAssessmentDetail: (assessmentId: string) => request(`/assessments/detail/${assessmentId}`),

  // Mastery
  getMastery: (courseId: string) => request(`/mastery/${courseId}`),

  // Study Plan
  getStudyPlan: (courseId: string, examDate?: string, dailyHours: number = 2) =>
    request(`/study-plan/${courseId}?daily_hours=${dailyHours}${examDate ? `&exam_date=${examDate}` : ''}`),

  // Revision
  generateRevision: (courseId: string, topic: string, type: string) =>
    request('/revision/generate', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId, topic, type }),
    }),

  // Sources
  getSources: (courseId: string, topic?: string) =>
    request(`/sources/${courseId}${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`),

  // Evaluation
  runEvaluation: (courseId: string) =>
    request(`/evaluation/run?course_id=${courseId}`, { method: 'POST' }),
  getEvaluationResults: (courseId: string) =>
    request(`/evaluation/results?course_id=${courseId}`),
};
