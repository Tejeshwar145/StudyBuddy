import React, { useState } from 'react';
import { Plus, Calendar, Clock, Flag, Trash2, Edit3 } from 'lucide-react';
import { Task, Subject } from '../types';
import { formatDuration } from '../utils/scheduler';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskManager({ tasks, subjects, onAddTask, onUpdateTask, onDeleteTask }: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedTime: 60,
    description: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subjectId: '',
      dueDate: '',
      priority: 'medium',
      estimatedTime: 60,
      description: ''
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedSubject = subjects.find(s => s.id === formData.subjectId);
    if (!selectedSubject) return;

    const taskData = {
      title: formData.title,
      subject: selectedSubject,
      dueDate: new Date(formData.dueDate),
      priority: formData.priority,
      estimatedTime: formData.estimatedTime,
      description: formData.description,
      completed: false
    };

    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onAddTask(taskData);
    }

    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      subjectId: task.subject.id,
      dueDate: task.dueDate.toISOString().split('T')[0],
      priority: task.priority,
      estimatedTime: task.estimatedTime,
      description: task.description || ''
    });
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Task Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Add/Edit Task Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="15"
                  step="15"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sortedTasks.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks yet</h3>
            <p className="text-gray-500">Add your first task to get started with smart scheduling</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedTasks.map(task => (
              <div key={task.id} className={`p-4 hover:bg-gray-50 transition-colors ${task.completed ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => onUpdateTask(task.id, { completed: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${task.subject.color}20`,
                            color: task.subject.color 
                          }}
                        >
                          {task.subject.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                          <Flag className="w-3 h-3 inline mr-1" />
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(task.estimatedTime)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {task.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}