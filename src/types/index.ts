export interface StudySession {
  id: string;
  title: string;
  subject: Subject;
  duration: number; // in minutes
  scheduledTime: Date;
  completed: boolean;
  actualDuration?: number;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'study' | 'review' | 'practice' | 'reading';
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  totalHours: number;
  targetHours: number;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  subject: Subject;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  estimatedTime: number; // in minutes
  description?: string;
}

export interface StudyStreak {
  current: number;
  longest: number;
  lastStudyDate: Date | null;
}

export interface Analytics {
  totalStudyTime: number;
  weeklyGoal: number;
  dailyAverage: number;
  subjectBreakdown: { [subjectId: string]: number };
  productivityScore: number;
  streak: StudyStreak;
}