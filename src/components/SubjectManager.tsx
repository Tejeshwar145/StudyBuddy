import React, { useState } from 'react';
import { Plus, BookOpen, Target, Trash2, Edit3, Palette } from 'lucide-react';
import { Subject } from '../types';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#8B5A3C',
  '#6366F1', '#14B8A6', '#F97316', '#EC4899', '#84CC16', '#6B7280'
];

export default function SubjectManager({ subjects, onAddSubject, onUpdateSubject, onDeleteSubject }: SubjectManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0],
    targetHours: 10,
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: PRESET_COLORS[0],
      targetHours: 10,
      description: ''
    });
    setEditingSubject(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subjectData = {
      name: formData.name,
      color: formData.color,
      targetHours: formData.targetHours,
      totalHours: editingSubject?.totalHours || 0,
      description: formData.description
    };

    if (editingSubject) {
      onUpdateSubject(editingSubject.id, subjectData);
    } else {
      onAddSubject(subjectData);
    }

    resetForm();
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      color: subject.color,
      targetHours: subject.targetHours,
      description: subject.description || ''
    });
    setShowForm(true);
  };

  const getProgressPercentage = (subject: Subject) => {
    return Math.min((subject.totalHours / subject.targetHours) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Subject Manager</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Add/Edit Subject Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            {editingSubject ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mathematics, Physics, History"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Hours
                </label>
                <input
                  type="number"
                  value={formData.targetHours}
                  onChange={(e) => setFormData({ ...formData, targetHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  step="1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Color Theme
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-900 scale-110' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
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
                placeholder="Brief description of this subject"
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
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No subjects yet</h3>
            <p className="text-gray-500">Add your first subject to start organizing your studies</p>
          </div>
        ) : (
          subjects.map(subject => {
            const progressPercentage = getProgressPercentage(subject);
            return (
              <div
                key={subject.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(subject.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {subject.description && (
                  <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Progress
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {subject.totalHours}h / {subject.targetHours}h
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progressPercentage}%`,
                        backgroundColor: subject.color 
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {Math.round(progressPercentage)}% complete
                    </span>
                    {progressPercentage >= 100 && (
                      <span className="text-xs text-green-600 font-medium">
                        🎉 Goal achieved!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}