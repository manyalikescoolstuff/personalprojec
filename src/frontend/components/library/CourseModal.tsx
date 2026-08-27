'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, X, Plus, Save } from 'lucide-react';
import { CourseInfo } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: CourseInfo | null;
  onSave: (courseData: Omit<CourseInfo, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<CourseInfo>) => void;
}

const COLOR_OPTIONS = [
  { id: 'emerald', bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', label: 'Emerald' },
  { id: 'amber', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400', label: 'Amber' },
  { id: 'teal', bg: 'bg-teal-500/20 border-teal-500/40 text-teal-400', label: 'Teal' },
  { id: 'indigo', bg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400', label: 'Indigo' },
  { id: 'rose', bg: 'bg-rose-500/20 border-rose-500/40 text-rose-400', label: 'Rose' },
  { id: 'violet', bg: 'bg-violet-500/20 border-violet-500/40 text-violet-400', label: 'Violet' },
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  initialCourse,
  onSave,
  onUpdate,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [credits, setCredits] = useState<number>(4);
  const [semester, setSemester] = useState('Sem 5');
  const [portalUrl, setPortalUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('emerald');

  useEffect(() => {
    if (initialCourse) {
      setCode(initialCourse.code || '');
      setName(initialCourse.name || '');
      setProfessor(initialCourse.professor || '');
      setCredits(initialCourse.credits || 4);
      setSemester(initialCourse.semester || 'Sem 5');
      setPortalUrl(initialCourse.portalUrl || '');
      setNotes(initialCourse.notes || '');
      setColor(initialCourse.color || 'emerald');
    } else {
      setCode('');
      setName('');
      setProfessor('');
      setCredits(4);
      setSemester('Sem 5');
      setPortalUrl('');
      setNotes('');
      setColor('emerald');
    }
  }, [initialCourse, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      code: code.trim().toUpperCase() || 'CS101',
      name: name.trim(),
      professor: professor.trim(),
      credits: Number(credits) || 4,
      semester: semester.trim(),
      portalUrl: portalUrl.trim(),
      notes: notes.trim(),
      color,
    };

    if (initialCourse && onUpdate) {
      onUpdate(initialCourse.id, payload);
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialCourse ? 'Edit Academic Subject' : 'Add Academic Subject'}
      subtitle="Totoro uses your registered courses to break down assignments & syllabus topics"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-kalam">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Course Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CS301"
              className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Database Management Systems"
              className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Professor / Faculty
            </label>
            <input
              type="text"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="e.g. Dr. Sharma"
              className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Credits
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
              Semester
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. Sem 5"
              className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
            Assignment / LMS Portal Link
          </label>
          <input
            type="url"
            value={portalUrl}
            onChange={(e) => setPortalUrl(e.target.value)}
            placeholder="e.g. https://classroom.google.com/c/..."
            className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
            Key Syllabus Topics & Focus Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. B+ Trees, Query Cost, Normalization up to BCNF, Midterm in Week 8..."
            className="w-full bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none resize-none"
          />
        </div>

        {/* Color Badge Selector */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
            Subject Tag Accent
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${c.bg} ${
                  color === c.id ? 'ring-2 ring-white shadow-md scale-105' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
          <Button variant="subtle" type="button" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button variant="primary" type="submit" size="sm" className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>{initialCourse ? 'Save Changes' : 'Add to Library'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
