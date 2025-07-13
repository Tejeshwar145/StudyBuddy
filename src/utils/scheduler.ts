import { StudySession, Task, Subject } from '../types';

export const generateSmartSchedule = (
  tasks: Task[],
  subjects: Subject[],
  availableHours: number,
  startDate: Date = new Date()
): StudySession[] => {
  const sessions: StudySession[] = [];
  const sortedTasks = [...tasks]
    .filter(task => !task.completed)
    .sort((a, b) => {
      // Sort by priority and due date
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  let currentTime = new Date(startDate);
  let remainingHours = availableHours;

  sortedTasks.forEach(task => {
    if (remainingHours <= 0) return;

    const sessionDuration = Math.min(task.estimatedTime, remainingHours * 60);
    
    if (sessionDuration >= 25) { // Minimum 25-minute session
      const session: StudySession = {
        id: `session-${task.id}-${Date.now()}`,
        title: task.title,
        subject: task.subject,
        duration: sessionDuration,
        scheduledTime: new Date(currentTime),
        completed: false,
        priority: task.priority,
        type: 'study'
      };

      sessions.push(session);
      currentTime = new Date(currentTime.getTime() + (sessionDuration + 15) * 60000); // Add break time
      remainingHours -= sessionDuration / 60;
    }
  });

  return sessions;
};

export const calculateProductivityScore = (sessions: StudySession[]): number => {
  if (sessions.length === 0) return 0;

  const completedSessions = sessions.filter(s => s.completed);
  const completionRate = completedSessions.length / sessions.length;
  
  const efficiencyScore = completedSessions.reduce((acc, session) => {
    if (session.actualDuration && session.duration > 0) {
      const efficiency = Math.min(session.actualDuration / session.duration, 1);
      return acc + efficiency;
    }
    return acc + 1;
  }, 0) / completedSessions.length || 0;

  return Math.round((completionRate * 0.6 + efficiencyScore * 0.4) * 100);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const getStreakInfo = (sessions: StudySession[]): { current: number; longest: number } => {
  const completedSessions = sessions
    .filter(s => s.completed)
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  if (completedSessions.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = new Date(completedSessions[0].scheduledTime);

  for (let i = 1; i < completedSessions.length; i++) {
    const currentDate = new Date(completedSessions[i].scheduledTime);
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      tempStreak++;
    } else if (daysDiff > 1) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }

    lastDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Calculate current streak from today backwards
  const today = new Date();
  const recentSessions = completedSessions.reverse();
  
  for (const session of recentSessions) {
    const sessionDate = new Date(session.scheduledTime);
    const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= currentStreak + 1) {
      if (daysDiff === currentStreak) {
        currentStreak++;
      }
    } else {
      break;
    }
  }

  return { current: currentStreak, longest: longestStreak };
};