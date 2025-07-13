import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, Settings } from 'lucide-react';
import { StudySession } from '../types';

interface StudyTimerProps {
  session: StudySession | null;
  onComplete: (sessionId: string, actualDuration: number) => void;
  onCancel: () => void;
}

export default function StudyTimer({ session, onComplete, onCancel }: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (session) {
      setTimeLeft(session.duration * 60);
      setMode('study');
      setIsRunning(false);
      setIsPaused(false);
      setStartTime(null);
    }
  }, [session]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            if (mode === 'study' && session) {
              const actualDuration = startTime ? 
                Math.round((Date.now() - startTime.getTime()) / 60000) : 
                session.duration;
              onComplete(session.id, actualDuration);
            }
            // Auto-switch to break after study session
            if (mode === 'study') {
              setMode('break');
              setTimeLeft(breakTime * 60);
            } else {
              setMode('study');
              setTimeLeft(studyTime * 60);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, session, onComplete, startTime, studyTime, breakTime]);

  const handleStart = () => {
    if (!startTime) {
      setStartTime(new Date());
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (session && startTime) {
      const actualDuration = Math.round((Date.now() - startTime.getTime()) / 60000);
      onComplete(session.id, actualDuration);
    }
    onCancel();
  };

  const handleSkip = () => {
    if (mode === 'study' && session) {
      const actualDuration = startTime ? 
        Math.round((Date.now() - startTime.getTime()) / 60000) : 
        session.duration;
      onComplete(session.id, actualDuration);
    }
    setMode(mode === 'study' ? 'break' : 'study');
    setTimeLeft(mode === 'study' ? breakTime * 60 : studyTime * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = session ? 
    ((session.duration * 60 - timeLeft) / (session.duration * 60)) * 100 : 0;

  if (!session) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-gray-400 mb-4">
          <Play className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Session</h3>
        <p className="text-gray-500">Select a study session to begin</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        {/* Session Info */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h3>
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${session.subject.color}20`,
              color: session.subject.color 
            }}
          >
            {session.subject.name}
          </span>
        </div>

        {/* Timer Display */}
        <div className="mb-8">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={mode === 'study' ? '#3b82f6' : '#10b981'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {mode} Time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>{isPaused ? 'Resume' : 'Start'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}
          
          <button
            onClick={handleSkip}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <SkipForward className="w-5 h-5" />
            <span>Skip</span>
          </button>
          
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Square className="w-5 h-5" />
            <span>Stop</span>
          </button>
        </div>

        {/* Timer Settings */}
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Study:</span>
            <input
              type="number"
              value={studyTime}
              onChange={(e) => setStudyTime(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              min="1"
              max="120"
            />
            <span className="text-gray-600">min</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Break:</span>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              min="1"
              max="30"
            />
            <span className="text-gray-600">min</span>
          </div>
        </div>
      </div>
    </div>
  );
}