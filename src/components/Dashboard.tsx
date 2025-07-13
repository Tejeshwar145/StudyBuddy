import React from 'react';
import { BookOpen, Clock, Target, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { Analytics, StudySession } from '../types';
import { formatDuration } from '../utils/scheduler';

interface DashboardProps {
  analytics: Analytics;
  todaySessions: StudySession[];
  onStartStudying: () => void;
}

export default function Dashboard({ analytics, todaySessions, onStartStudying }: DashboardProps) {
  const completedToday = todaySessions.filter(s => s.completed).length;
  const totalToday = todaySessions.length;
  const todayProgress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Good morning, Scholar! 🌟</h1>
            <p className="text-blue-100">
              You have {totalToday - completedToday} study sessions planned for today
            </p>
          </div>
          <button
            onClick={onStartStudying}
            className="bg-white/20 hover:bg-white/30 transition-colors px-6 py-3 rounded-xl font-semibold"
          >
            Start Studying
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Study Time</p>
              <p className="text-xl font-bold">{formatDuration(analytics.totalStudyTime)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Goal</p>
              <p className="text-xl font-bold">{Math.round((analytics.totalStudyTime / analytics.weeklyGoal) * 100)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productivity Score</p>
              <p className="text-xl font-bold">{analytics.productivityScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Study Streak</p>
              <p className="text-xl font-bold">{analytics.streak.current} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Today's Progress</span>
          </h3>
          <span className="text-sm text-gray-600">
            {completedToday}/{totalToday} sessions completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${todayProgress}%` }}
          ></div>
        </div>

        {todaySessions.length > 0 ? (
          <div className="space-y-2">
            {todaySessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-3 h-3 rounded-full ${session.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                  ></div>
                  <span className={`${session.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {session.title}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDuration(session.duration)}
                </span>
              </div>
            ))}
            {todaySessions.length > 3 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                +{todaySessions.length - 3} more sessions
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No study sessions scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}