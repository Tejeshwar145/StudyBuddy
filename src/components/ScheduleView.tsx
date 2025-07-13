import React, { useState } from 'react';
import { Calendar, Clock, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { StudySession } from '../types';
import { formatDuration } from '../utils/scheduler';

interface ScheduleViewProps {
  sessions: StudySession[];
  onStartSession: (session: StudySession) => void;
  onCompleteSession: (sessionId: string) => void;
}

export default function ScheduleView({ sessions, onStartSession, onCompleteSession }: ScheduleViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const selectedDateSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduledTime).toISOString().split('T')[0];
    return sessionDate === selectedDate;
  });

  const upcomingSessions = sessions
    .filter(session => !session.completed && new Date(session.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Clock className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Study Schedule</h2>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            
            {selectedDateSessions.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No sessions scheduled</h4>
                <p className="text-gray-500">Add some tasks to generate a smart study schedule</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {selectedDateSessions.map(session => (
                  <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl text-white font-semibold" 
                             style={{ backgroundColor: session.subject.color }}>
                          {session.subject.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${session.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {session.title}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-gray-600">
                              {formatTime(new Date(session.scheduledTime))}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDuration(session.duration)}
                            </span>
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(session.priority)}
                              <span className="text-sm text-gray-600 capitalize">
                                {session.priority} priority
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {session.completed ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onStartSession(session)}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            <span>Start</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <div className="p-6 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No upcoming sessions</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: session.subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.scheduledTime).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {formatTime(new Date(session.scheduledTime))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="text-sm font-semibold">{sessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-semibold text-green-600">
                  {sessions.filter(s => s.completed).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-orange-600">
                  {sessions.filter(s => !s.completed).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Time</span>
                <span className="text-sm font-semibold">
                  {formatDuration(sessions.reduce((acc, s) => acc + s.duration, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}