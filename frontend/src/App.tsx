import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { api } from './api';
import type { User, Course } from './types';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import AITutor from './pages/AITutor';
import AssessmentPage from './pages/AssessmentPage';
import AssessmentResults from './pages/AssessmentResults';
import ProgressPage from './pages/ProgressPage';
import StudyPlanPage from './pages/StudyPlanPage';
import EvaluationPage from './pages/EvaluationPage';
import UploadPage from './pages/UploadPage';

interface AppContextType {
  user: User | null;
  courses: Course[];
  activeCourse: Course | null;
  setActiveCourse: (c: Course) => void;
  language: string;
  setLanguage: (l: string) => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  courses: [],
  activeCourse: null,
  setActiveCourse: () => {},
  language: 'en',
  setLanguage: () => {},
});

export const useApp = () => useContext(AppContext);

const DEMO_COURSE_ID = 'course-os-001';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [language, setLanguage] = useState('en');

  const handleLogin = async () => {
    try {
      const res: any = await api.login();
      setUser(res.user);
      const courseList: any = await api.getCourses();
      setCourses(courseList);
      const demo = courseList.find((c: Course) => c.id === DEMO_COURSE_ID);
      if (demo) setActiveCourse(demo);
      else if (courseList.length > 0) setActiveCourse(courseList[0]);
    } catch (e) {
      console.error('Login failed:', e);
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppContext.Provider value={{ user, courses, activeCourse, setActiveCourse, language, setLanguage }}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/tutor" element={<AITutor />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/assessment/:id/results" element={<AssessmentResults />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
