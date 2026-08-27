'use client';

import React, { useState } from 'react';
import {
  Check,
  Trash2,
  Clock,
  PhoneCall,
  Calendar,
  CheckSquare,
  Edit2,
  Activity,
  CheckCircle2,
  MapPin,
  User,
  AlertCircle,
} from 'lucide-react';
import { ExtractedBrainItem, Priority, TaskCategory, ExtractedItemType } from '@/types';
import { Button } from '@/components/ui/Button';

interface EditableExtractedItemProps {
  item: ExtractedBrainItem;
  onUpdate: (updated: ExtractedBrainItem) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onAcceptSingle?: (item: ExtractedBrainItem) => void;
}

export const EditableExtractedItem: React.FC<EditableExtractedItemProps> = ({
  item,
  onUpdate,
  onDelete,
  onToggleSelect,
  onAcceptSingle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [editDeadline, setEditDeadline] = useState(item.deadline || '');
  const [editCategory, setEditCategory] = useState<TaskCategory>(item.category);
  const [editPriority, setEditPriority] = useState<Priority>(item.priority);
  const [editType, setEditType] = useState<ExtractedItemType>(item.type);

  const handleSaveInline = () => {
    if (editTitle.trim()) {
      onUpdate({
        ...item,
        title: editTitle.trim(),
        notes: editNotes.trim() || undefined,
        deadline: editDeadline.trim() || undefined,
        category: editCategory,
        priority: editPriority,
        type: editType,
      });
      setIsEditing(false);
    }
  };

  const typeConfig: Record<
    ExtractedItemType,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    task: {
      label: 'Task',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      color: 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]',
    },
    deadline: {
      label: 'Deadline',
      icon: <Clock className="w-3.5 h-3.5" />,
      color: 'text-[#E07A7A] dark:text-[#E07A7A] light:text-[#DC2626]',
    },
    reminder: {
      label: 'Reminder',
      icon: <PhoneCall className="w-3.5 h-3.5" />,
      color: 'text-[#D8B07A] dark:text-[#D8B07A] light:text-[#D97706]',
    },
    routine: {
      label: 'Routine',
      icon: <Activity className="w-3.5 h-3.5" />,
      color: 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]',
    },
    event: {
      label: 'Event',
      icon: <Calendar className="w-3.5 h-3.5" />,
      color: 'text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]',
    },
  };

  const currentType = typeConfig[item.type] || typeConfig.task;

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        item.isAccepted
          ? 'bg-[#18221E]/60 border-[#9ED8A3]/40 opacity-90 dark:bg-[#18221E]/60 light:bg-[#EFF6FF] light:border-[#BFDBFE]'
          : item.selected
          ? 'bg-[#151D1A] border-[#1E2824] hover:border-[#9ED8A3]/50 dark:bg-[#151D1A] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:hover:border-[#2563EB]/40'
          : 'bg-[#111816]/60 border-[#1A231F] text-[#55665A] opacity-60 dark:bg-[#111816]/60 dark:border-[#1A231F] light:bg-[#F8FAFC] light:border-[#E2E8F0]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Checkbox & Title */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {!item.isAccepted ? (
            <button
              type="button"
              onClick={() => onToggleSelect(item.id)}
              className={`w-4 h-4 rounded-sm mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                item.selected
                  ? 'bg-[#9ED8A3] border-[#9ED8A3] text-[#0A0F0D] dark:bg-[#9ED8A3] dark:border-[#9ED8A3] dark:text-[#0A0F0D] light:bg-[#2563EB] light:border-[#2563EB] light:text-white'
                  : 'border-[#283630] dark:border-[#283630] light:border-[#CBD5E1]'
              }`}
              aria-label={item.selected ? 'Deselect item' : 'Select item'}
            >
              {item.selected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          ) : (
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] shrink-0" />
          )}

          <div className="space-y-1.5 min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2.5 bg-[#111816] p-3 rounded-lg border border-[#1E2824]">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded px-2.5 py-1 text-sm font-kalam focus:outline-none focus:border-[#9ED8A3] dark:bg-[#151D1A] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block mb-0.5">Type</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as ExtractedItemType)}
                      className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded px-2 py-1 text-xs font-kalam dark:bg-[#151D1A] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                    >
                      <option value="task">Task</option>
                      <option value="deadline">Deadline</option>
                      <option value="reminder">Reminder</option>
                      <option value="routine">Routine</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block mb-0.5">Deadline</label>
                    <input
                      type="text"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      placeholder="Tomorrow, Today, etc."
                      className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded px-2 py-1 text-xs font-kalam placeholder:text-[#55665A] dark:bg-[#151D1A] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block mb-0.5">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as Priority)}
                      className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded px-2 py-1 text-xs font-kalam dark:bg-[#151D1A] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block mb-0.5">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
                      className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded px-2 py-1 text-xs font-kalam dark:bg-[#151D1A] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                    >
                      <option value="Academics">Academics</option>
                      <option value="Projects">Projects</option>
                      <option value="Personal">Personal</option>
                      <option value="Health">Health</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-[#8C9E90] tracking-wider block mb-0.5">Notes (Optional)</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Additional context or details"
                    className="w-full bg-[#151D1A] text-[#F3F4F1] border border-[#1E2824] rounded px-2 py-1 text-xs font-kalam placeholder:text-[#55665A] dark:bg-[#151D1A] dark:text-[#F3F4F1] light:bg-[#FFFFFF] light:text-[#111827] light:border-[#E2E8F0]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveInline}
                    className="text-xs py-1 h-auto"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs py-1 h-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
                    {item.title}
                  </span>
                  {!item.isAccepted && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="opacity-60 hover:opacity-100 text-[#8C9E90] hover:text-[#F3F4F1] p-0.5 transition-opacity"
                      title="Edit item"
                      aria-label="Edit item"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {item.notes && (
                  <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] font-sans">
                    {item.notes}
                  </p>
                )}
              </div>
            )}

            {/* Clarification Alert if Uncertain or Blurry */}
            {item.needsClarification && (
              <div className="flex items-start gap-1.5 p-2 rounded bg-[#2D1B1B] border border-[#E07A7A]/40 text-[#E07A7A] text-xs font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Uncertain / Needs Review:</strong>
                  <span>{item.clarificationNote || 'Some details in the screenshot are ambiguous.'}</span>
                </div>
              </div>
            )}

            {/* Badges and Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
              {/* Type indicator */}
              <span className={`inline-flex items-center gap-1 font-medium ${currentType.color}`}>
                {currentType.icon}
                <span>{currentType.label}</span>
              </span>

              {/* Deadline */}
              <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
              <span className="text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                Due: <strong className="text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827] font-medium">{item.deadline || 'Not specified'}</strong>
              </span>

              {/* Priority */}
              <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
              <span className="capitalize text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                {item.priority} Priority
              </span>

              {/* Category */}
              <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
              <span className="text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B]">
                {item.category}
              </span>

              {/* Location Tag */}
              {item.location && (
                <>
                  <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                  <span className="text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                </>
              )}

              {/* People Tag */}
              {item.people && item.people.length > 0 && (
                <>
                  <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                  <span className="text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {item.people.join(', ')}
                  </span>
                </>
              )}

              {/* Confidence badge */}
              {typeof item.confidence === 'number' && (
                <>
                  <span className="text-[#3D4A3E] dark:text-[#3D4A3E] light:text-[#CBD5E1]">·</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded font-mono ${
                      item.confidence >= 0.8
                        ? 'bg-[#18221E] text-[#9ED8A3] border border-[#9ED8A3]/30'
                        : 'bg-[#2A1D1A] text-[#E07A7A] border border-[#E07A7A]/30'
                    }`}
                  >
                    {Math.round(item.confidence * 100)}% vision match
                  </span>
                </>
              )}

              {item.sourceLabel && (
                <span className="text-[10px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] ml-auto">
                  via {item.sourceLabel}
                </span>
              )}
            </div>

            {/* Dependencies */}
            {item.dependencies && item.dependencies.length > 0 && (
              <div className="text-[11px] text-[#D8B07A] dark:text-[#D8B07A] light:text-[#D97706] font-sans flex items-center gap-1">
                <span>↳ Dependency:</span>
                <span className="italic">{item.dependencies.join('; ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {item.isAccepted ? (
            <span className="text-xs text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium px-2 py-0.5 rounded bg-[#9ED8A3]/10">
              Accepted
            </span>
          ) : (
            <>
              {onAcceptSingle && (
                <button
                  type="button"
                  onClick={() => onAcceptSingle(item)}
                  className="px-2.5 py-1 text-xs rounded bg-[#18221E] hover:bg-[#9ED8A3] text-[#9ED8A3] hover:text-[#0A0F0D] border border-[#9ED8A3]/40 transition-colors font-medium flex items-center gap-1 dark:bg-[#18221E] dark:text-[#9ED8A3] dark:hover:bg-[#9ED8A3] dark:hover:text-[#0A0F0D] light:bg-[#EFF6FF] light:text-[#2563EB] light:hover:bg-[#2563EB] light:hover:text-white"
                  title="Accept into tasks"
                >
                  <Check className="w-3 h-3" />
                  <span>Accept</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-[#55665A] hover:text-[#E07A7A] p-1.5 rounded transition-colors"
                title="Remove item"
                aria-label="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
