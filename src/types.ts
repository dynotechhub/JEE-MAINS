export interface Profile {
  name: string;
  avatar: string;
  bio: string;
  exam: string;
  targetScore: string;
  goals: string[];
  examDate: string;
}

export interface Chapter {
  id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Hard' | 'Medium' | 'Easy';
  teacher: string;
  status: 'Completed' | 'In Progress' | 'To Do';
  progress: number; // 0 to 100
  expectedTime: number; // hours
  actualTime: number; // hours
  revisionCount: number;
  mistakeCount: number;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface Lecture {
  id: string;
  name: string;
  teacher: string;
  platform: string;
  duration: number; // minutes
  watchedPercent: number; // 0 to 100
  playbackSpeed: number;
  lectureLink: string;
  status: 'Completed' | 'In Progress' | 'To Do';
  chapterId: string;
  completedDate: string; // YYYY-MM-DD
  rating: number; // 1-5
  bookmarked: boolean;
}

export interface NoteVersion {
  date: string;
  content: string;
}

export interface Note {
  id: string;
  name: string;
  content: string; // Markdown or plain text
  chapterId: string;
  tags: string[];
  updatedAt: string;
  versionHistory: NoteVersion[];
  drawingData?: string; // base64 string for drawing board/mind map
}

export interface DPP {
  id: string;
  name: string;
  questionsCount: number;
  solvedCount: number;
  wrongCount: number;
  accuracy: number; // calculated percent
  timeSpent: number; // minutes
  status: 'Completed' | 'In Progress' | 'To Do';
  chapterId: string;
  bookmarkedQuestions: number[]; // question numbers
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  chapters: Chapter[];
  lectures: Lecture[];
  notes: Note[];
  dpps: DPP[];
}

export interface Revision {
  id: string;
  subjectId: string;
  chapterId: string;
  lastRevised: string; // YYYY-MM-DD
  nextRevised: string; // YYYY-MM-DD
  intervalDays: number; // e.g. 1, 3, 7, 15, 30, 60, 90
  completedSessions: number;
}

export interface PlannerTask {
  id: string;
  title: string;
  subjectId: string;
  chapterId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  type: 'Lecture' | 'Note' | 'DPP' | 'Revision' | 'Test' | 'Custom';
}

export interface Planner {
  tasks: PlannerTask[];
}

export interface Mistake {
  id: string;
  questionImageOrText: string;
  wrongReason: string;
  correctMethod: string;
  subjectId: string;
  chapterId: string;
  solvedAgain: boolean;
  confidence: 'High' | 'Medium' | 'Low';
  createdAt: string; // YYYY-MM-DD
  lastRevisedAt?: string;
}

export interface TestResult {
  id: string;
  title: string;
  totalMarks: number;
  marksObtained: number;
  timeLimit: number; // minutes
  timeTaken: number; // minutes
  accuracy: number;
  negativeMarks: number;
  rank?: number;
  createdAt: string; // YYYY-MM-DD
  topicAnalysis?: string;
}

export interface FocusLog {
  date: string; // YYYY-MM-DD
  durationMinutes: number;
}

export interface Habit {
  id: string;
  name: string;
  history: Record<string, boolean>; // date -> completed
}

export interface StudyResource {
  id: string;
  name: string;
  type: 'PDF' | 'Video' | 'Link' | 'Cheat Sheet' | 'Image';
  url: string;
  base64File?: string; // stored inline for simple persistence
  subjectId: string;
  notes?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subjectId: string;
  chapterId: string;
  nextReviewDate: string; // YYYY-MM-DD
  box: number; // Leitner box (1 to 5)
}

export interface Streak {
  current: number;
  lastActiveDate: string; // YYYY-MM-DD
  xp: number;
  level: number;
}

export interface Settings {
  theme: 'dark' | 'light';
  language: string;
  notifications: boolean;
  dailyXpGoal: number;
  showAiRecommendation: boolean;
}

export interface StudyDatabase {
  profile: Profile;
  subjects: Subject[];
  revisions: Revision[];
  planner: Planner;
  mistakeBook: Mistake[];
  tests: TestResult[];
  focusLogs: FocusLog[];
  habits: Habit[];
  resources: StudyResource[];
  flashcards: Flashcard[];
  streak: Streak;
  settings: Settings;
}
