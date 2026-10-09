// StudyMate AI - TypeScript Types

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  language: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  is_demo: boolean;
  created_at?: string;
  document_count?: number;
  topic_count?: number;
}

export interface DocumentInfo {
  id: string;
  name: string;
  file_type: string;
  status: string;
  file_size: number;
  processing_progress: number;
  created_at?: string;
}

export interface Citation {
  index: number;
  source_type: string;
  source_name: string;
  page_number?: number;
  slide_number?: number;
  timestamp_start?: string;
  timestamp_end?: string;
  topic?: string;
  content_preview?: string;
}

export interface TopicInfo {
  id: string;
  name: string;
  unit?: string;
  description?: string;
  difficulty?: string;
  subtopics: { id: string; name: string }[];
  concepts: { id: string; name: string }[];
  sources: SourceInfo[];
  prerequisites: string[];
  chunk_count: number;
}

export interface SourceInfo {
  source_type: string;
  source_name: string;
  page_number?: number;
  slide_number?: number;
  timestamp_start?: string;
  timestamp_end?: string;
  content_preview?: string;
}

export interface TutorResponse {
  answer: string;
  is_grounded: boolean;
  citations: Citation[];
  suggest_outside: boolean;
  session_id: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  is_grounded?: boolean;
  created_at?: string;
}

export interface AssessmentInfo {
  id: string;
  title: string;
  topics: string[];
  difficulty: string;
  question_count: number;
  score?: number;
  completed: boolean;
  created_at?: string;
  completed_at?: string;
}

export interface QuestionInfo {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  source_citation?: string;
  source_type?: string;
  source_location?: string;
  topic: string;
  difficulty: string;
  order_index: number;
}

export interface AssessmentResult {
  assessment_id: string;
  score: number;
  correct: number;
  total: number;
  results: QuestionResult[];
  topic_performance: TopicPerformance[];
  misconceptions: Misconception[];
}

export interface QuestionResult {
  question_id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  source_citation: string;
  topic: string;
  difficulty: string;
}

export interface TopicPerformance {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface Misconception {
  type: string;
  topic: string;
  confused_concepts?: string[];
  message: string;
  recommendation: string;
}

export interface MasteryInfo {
  topic: string;
  mastery_score: number;
  raw_mastery: number;
  confidence: number;
  attempts: number;
  correct: number;
  last_reviewed?: string;
}

export interface StudyPlanData {
  daily_plan: StudyPlanItem[];
  priorities: StudyPriority[];
  total_study_time: number;
  exam_date?: string;
  days_until_exam?: number;
  weak_topics: StudyPriority[];
  strong_topics: StudyPriority[];
}

export interface StudyPlanItem {
  topic: string;
  action: string;
  time_minutes: number;
  reason: string;
  mastery: number;
}

export interface StudyPriority {
  topic: string;
  priority_score: number;
  mastery: number;
  action: string;
  time_minutes: number;
  reason: string;
}

export interface DashboardData {
  user: { name: string; id: string };
  overall_mastery: number;
  topics_mastered: number;
  topics_total: number;
  topics_needing_attention: number;
  questions_answered: number;
  study_streak: number;
  weak_areas: { topic: string; mastery: number }[];
  topic_mastery: { topic: string; mastery: number }[];
  recent_assessments: {
    id: string;
    title: string;
    score: number;
    topics: string[];
    difficulty: string;
    date: string;
  }[];
  recommendations: {
    action: string;
    reason: string;
    topic: string;
    priority: string;
  }[];
}

export interface EvaluationData {
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  context_recall: number;
  total_questions: number;
  details: EvalDetail[];
  personalization: {
    mastery_gain: number;
    question_repetition_rate: number;
    weak_topic_improvement: number;
  };
  timestamp?: string;
}

export interface EvalDetail {
  question: string;
  type: string;
  generated_answer: string;
  is_grounded: boolean;
  faithfulness: number;
  relevancy: number;
  precision: number;
  recall: number;
  citations_count: number;
  expected_source: string;
}

export interface RevisionCard {
  front: string;
  back: string;
  source: string;
  topic: string;
  concept: string;
}

export interface TopicGraphData {
  nodes: {
    id: string;
    label: string;
    mastery: number;
    unit: string;
    position: { x: number; y: number };
  }[];
  edges: {
    source: string;
    target: string;
  }[];
}
