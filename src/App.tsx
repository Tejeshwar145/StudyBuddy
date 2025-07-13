import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Timer, BarChart3, Settings, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import SubjectManager from './components/SubjectManager';
import StudyTimer from './components/StudyTimer';
import ScheduleView from './components/ScheduleView';
import { StudySession, Subject, Task, Analytics } from './types';
import { generateSmartSchedule, calculateProductivityScore, getStreakInfo } from './utils/scheduler';

type ActiveView = 'dashboard' | 'tasks' | 'subjects' | 'schedule' | 'timer';

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleSubjects: Subject[] = [
      {
        id: '1',
        name: 'Mathematics',
        color: '#3B82F6',
        totalHours: 8,
        targetHours: 20,
        description: 'Calculus and Linear Algebra'
      },
      {
        id: '2',
        name: 'Physics',
        color: '#8B5CF6',
        totalHours: 6,
        targetHours: 15,
        description: 'Quantum Mechanics and Thermodynamics'
      },
      {
        id: '3',
        name: 'Computer Science',
        color: '#10B981',
        totalHours: 12,
        targetHours: 25,
        description: 'Algorithms and Data Structures'
      }
    ];

    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Complete Calculus Problem Set 3',
        subject: sampleSubjects[0],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'high',
        completed: false,
        estimatedTime: 120,
        description: 'Focus on integration techniques'
      },
      {
        id: '2',
        title: 'Study Quantum Mechanics Chapter 4',
        subject: sampleSubjects[1],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        completed: false,
        estimatedTime: 90
      },
      {
        id: '3',
        title: 'Implement Binary Search Tree',
        subject: sampleSubjects[2],
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        priority: 'high',
        completed: false,
        estimatedTime: 150
      }
    ];

    setSubjects(sampleSubjects);
    setTasks(sampleTasks);

    // Generate initial schedule
    const initialSessions = generateSmartSchedule(sampleTasks, sampleSubjects, 8);
    setSessions(initialSessions);
  }, []);

  // Calculate analytics
  const analytics: Analytics = {
    totalStudyTime: sessions.filter(s => s.completed).reduce((acc, s) => acc + (s.actualDuration || s.duration), 0),
    weeklyGoal: 2400, // 40 hours in minutes
    dailyAverage: 180, // 3 hours in minutes
    subjectBreakdown: subjects.reduce((acc, subject) => {
      acc[subject.id] = subject.totalHours * 60;
      return acc;
    }, {} as { [key: string]: number }),
    productivityScore: calculateProductivityScore(sessions),
    streak: {
      ...getStreakInfo(sessions),
      lastStudyDate: sessions.filter(s => s.completed).sort((a, b) => 
        new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
      )[0]?.scheduledTime ? new Date(sessions.filter(s => s.completed).sort((a, b) => 
        new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
      )[0].scheduledTime) : null
    }
  };

  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.scheduledTime);
    return sessionDate.toDateString() === today.toDateString();
  });

  // Handlers
  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: Date.now().toString()
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleUpdateSubject = (subjectId: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map(subject => 
      subject.id === subjectId ? { ...subject, ...updates } : subject
    ));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
    setTasks(tasks.filter(task => task.subject.id !== subjectId));
    setSessions(sessions.filter(session => session.subject.id !== subjectId));
  };

  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    };
    setTasks([...tasks, newTask]);
    
    // Regenerate schedule when new task is added
    const newSessions = generateSmartSchedule([...tasks, newTask], subjects, 8);
    setSessions(newSessions);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    setTasks(updatedTasks);
    
    // Regenerate schedule
    const newSessions = generateSmartSchedule(updatedTasks, subjects, 8);
    setSessions(newSessions);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    setSessions(sessions.filter(session => !session.title.includes(tasks.find(t => t.id === taskId)?.title || '')));
  };

  const handleStartSession = (session: StudySession) => {
    setActiveSession(session);
    setActiveView('timer');
  };

  const handleCompleteSession = (sessionId: string, actualDuration: number) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, completed: true, actualDuration }
        : session
    ));
    
    // Update subject total hours
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSubjects(subjects.map(subject => 
        subject.id === session.subject.id 
          ? { ...subject, totalHours: subject.totalHours + (actualDuration / 60) }
          : subject
      ));
    }
    
    setActiveSession(null);
    setActiveView('dashboard');
  };

  const handleStartStudying = () => {
    const nextSession = todaySessions.find(s => !s.completed);
    if (nextSession) {
      handleStartSession(nextSession);
    } else {
      setActiveView('tasks');
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'tasks', name: 'Tasks', icon: BookOpen },
    { id: 'subjects', name: 'Subjects', icon: Settings },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'timer', name: 'Timer', icon: Timer },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            analytics={analytics}
            todaySessions={todaySessions}
            onStartStudying={handleStartStudying}
          />
        );
      case 'tasks':
        return (
          <TaskManager
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'subjects':
        return (
          <SubjectManager
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        );
      case 'schedule':
        return (
          <ScheduleView
            sessions={sessions}
            onStartSession={handleStartSession}
            onCompleteSession={(sessionId) => {
              const session = sessions.find(s => s.id === sessionId);
              if (session) {
                handleCompleteSession(sessionId, session.duration);
              }
            }}
          />
        );
      case 'timer':
        return (
          <StudyTimer
            session={activeSession}
            onComplete={handleCompleteSession}
            onCancel={() => {
              setActiveSession(null);
              setActiveView('dashboard');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Study Scheduler</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ActiveView);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
          <div className="flex items-center px-6 py-8 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Study Scheduler</h1>
            </div>
          </div>
          
          <nav className="flex-1 p-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navigation.find(nav => nav.id === activeView)?.name}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;