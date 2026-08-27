'use client';

import React, { useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Plus,
  CheckCircle,
  FileText,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import { BrainDumpAttachment } from '@/types';
import { Button } from '@/components/ui/Button';

interface ScreenshotUploaderProps {
  screenshots: BrainDumpAttachment[];
  onAddScreenshot: (screenshot: BrainDumpAttachment) => void;
  onRemoveScreenshot: (id: string) => void;
}

// Helper to generate visual SVG Data URLs for test presets
function createSvgDataUrl(title: string, lines: string[], bgHeader: string, tag: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
    <rect width="600" height="340" fill="#0D1412" rx="12" />
    <rect width="600" height="48" fill="${bgHeader}" rx="12" />
    <rect y="36" width="600" height="12" fill="${bgHeader}" />
    <text x="20" y="30" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="bold">${title}</text>
    <rect x="500" y="14" width="80" height="22" rx="4" fill="#000000" opacity="0.3" />
    <text x="540" y="29" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">${tag}</text>
    <g fill="#F3F4F1" font-family="system-ui, sans-serif" font-size="14">
      ${lines
        .map((line, idx) => `<text x="24" y="${80 + idx * 32}">${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`)
        .join('')}
    </g>
    <line x1="20" y1="290" x2="580" y2="290" stroke="#1E2824" stroke-width="1" />
    <text x="24" y="315" fill="#8C9E90" font-family="system-ui, sans-serif" font-size="11">GetDone Vision Test Fixture • High Fidelity Sample</text>
  </svg>`;
  return `data:image/svg+xml;base64,${typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(svg))) : ''}`;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  screenshots,
  onAddScreenshot,
  onRemoveScreenshot,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets: BrainDumpAttachment[] = [
    {
      id: 'shot-assign-2',
      name: 'DBMS_Assignment_2_Notice.png',
      type: 'assignment',
      previewUrl: createSvgDataUrl(
        'DBMS Assignment 2',
        [
          'Submission deadline: 25 August',
          'Submit via: Google Classroom',
          'Requirements:',
          '1. ER Diagram for University Schema',
          '2. SQL Queries for Aggregation and Indexing',
          'Note: Late submissions lose 20% marks.'
        ],
        '#1E3A2F',
        'Assignment'
      ),
      fileSize: '42.8 KB',
      extractedText: 'DBMS Assignment 2 · Due 25 August via Google Classroom (ER Diagram & SQL Queries)',
      timestamp: 'Today · 9:15 AM',
    },
    {
      id: 'shot-wa-meet',
      name: 'WhatsApp_Project_Meeting.png',
      type: 'whatsapp',
      previewUrl: createSvgDataUrl(
        'WhatsApp • CS Capstone Group',
        [
          'Alex: Hey everyone!',
          'Prof. Sharma asked us to meet for project review.',
          '"Hey, don\'t forget our project meeting tomorrow at 4 in Lab 3."',
          'Please bring your updated architecture diagrams.'
        ],
        '#0E4A36',
        'Chat'
      ),
      fileSize: '36.2 KB',
      extractedText: 'Alex: "Hey, don\'t forget our project meeting tomorrow at 4 in Lab 3."',
      timestamp: 'Today · 8:14 AM',
    },
    {
      id: 'shot-tt-sem',
      name: 'Weekly_Timetable_Schedule.png',
      type: 'timetable',
      previewUrl: createSvgDataUrl(
        'B.Tech CS - 5th Semester Timetable',
        [
          'Mon 10:00-11:30 : Operating Systems (Room 201)',
          'Wed 14:00-16:00 : Database Systems Lab (Lab 4)',
          'Thu 11:30-13:00 : Computer Networks (Room 304)',
          'Fri 09:00-10:30 : Algorithms Tutorial (Hall B)'
        ],
        '#1E2C3A',
        'Timetable'
      ),
      fileSize: '51.4 KB',
      extractedText: 'Weekly Timetable: OS, DBMS Lab, Computer Networks & Algorithms tutorials',
      timestamp: 'Aug 20',
    },
    {
      id: 'shot-event-hack',
      name: 'Hackathon_Event_Announcement.png',
      type: 'event',
      previewUrl: createSvgDataUrl(
        'Campus AI Buildathon 2026',
        [
          'Date: Saturday, 28 August · 10:00 AM - 6:00 PM',
          'Venue: Main Auditorium B',
          'Host: Tech Innovation Club',
          'Important: Team registration closes Friday at 5:00 PM',
          'Prizes for Top 3 AI Agent Implementations'
        ],
        '#3B2446',
        'Event'
      ),
      fileSize: '48.1 KB',
      extractedText: 'Campus AI Buildathon: Saturday 10 AM (Auditorium B). Team registration by Friday 5 PM.',
      timestamp: 'Yesterday',
    },
    {
      id: 'shot-multi-dates',
      name: 'Multi_Deadline_Syllabus.png',
      type: 'syllabus',
      previewUrl: createSvgDataUrl(
        'Project Milestones & Deliverables',
        [
          'Milestone 1: Problem Statement & Literature Review - Due Sept 15',
          'Milestone 2: Database Schema & API Implementation - Due Oct 05',
          'Milestone 3: UI Frontend & Integration - Due Oct 24',
          'Final Defense & Demo: Nov 10 · 2:00 PM in Seminar Hall'
        ],
        '#3A2C18',
        'Milestones'
      ),
      fileSize: '54.7 KB',
      extractedText: 'Multiple project milestones: Sept 15, Oct 05, Oct 24, Final Demo Nov 10',
      timestamp: 'Aug 18',
    },
    {
      id: 'shot-ambiguous-note',
      name: 'Blurry_Cropped_Notice.png',
      type: 'ambiguous',
      previewUrl: createSvgDataUrl(
        '[Partially Cropped Notice]',
        [
          '...exam paper re-evaluation form...',
          '...submit fee at counter before Friday [date torn]...',
          '...contact Prof. [name blurry] for room allocation...',
          '[Corner of document missing]'
        ],
        '#3D1E1E',
        'Unclear'
      ),
      fileSize: '29.3 KB',
      extractedText: 'Partially cropped notice: re-evaluation form submission with missing date and blurry contact.',
      timestamp: 'Aug 15',
    },
  ];

  const handleSelectPreset = (preset: BrainDumpAttachment) => {
    if (!screenshots.find((s) => s.id === preset.id)) {
      onAddScreenshot(preset);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        const attachment: BrainDumpAttachment = {
          id: `shot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: 'custom',
          previewUrl,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          extractedText: `Uploaded image ready for analysis (${file.name})`,
          timestamp: 'Just now',
        };
        onAddScreenshot(attachment);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so re-uploading the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4 font-kalam">
      {/* Upload Drag & Drop Surface */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1E2824] hover:border-[#9ED8A3]/60 bg-[#111816] rounded-xl cursor-pointer transition-colors dark:bg-[#111816] dark:border-[#1E2824] dark:hover:border-[#9ED8A3]/60 light:bg-[#F8FAFC] light:border-[#E2E8F0] light:hover:border-[#2563EB]/60 text-center"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#18221E] text-[#9ED8A3] dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] mb-2">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-[#F3F4F1] dark:text-[#F3F4F1] light:text-[#111827]">
          Attach screenshots or photos
        </p>
        <p className="text-xs text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] mt-0.5">
          WhatsApp chats, announcements, assignment portals, timetables, or handwritten notes
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Preset Samples */}
      <div className="space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8]">
          Test scenario fixtures (6 categories):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {samplePresets.map((preset) => {
            const isAttached = screenshots.some((s) => s.id === preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isAttached}
                className={`p-2.5 rounded-lg border text-left flex items-start justify-between gap-2 transition-all ${
                  isAttached
                    ? 'bg-[#18221E] border-[#9ED8A3]/40 text-[#9ED8A3] dark:bg-[#18221E] dark:text-[#9ED8A3] light:bg-[#EFF6FF] light:text-[#2563EB] light:border-[#BFDBFE] opacity-80'
                    : 'bg-[#111816] border-[#1E2824] hover:border-[#9ED8A3]/50 text-[#8C9E90] hover:text-[#F3F4F1] dark:bg-[#111816] dark:border-[#1E2824] light:bg-[#FFFFFF] light:border-[#E2E8F0] light:text-[#64748B] light:hover:text-[#111827]'
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {preset.type === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-[#4ADE80]" />}
                    {preset.type === 'assignment' && <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />}
                    {preset.type === 'timetable' && <Calendar className="w-3.5 h-3.5 text-[#FBBF24]" />}
                    {preset.type === 'event' && <Calendar className="w-3.5 h-3.5 text-[#C084FC]" />}
                    {preset.type === 'syllabus' && <FileText className="w-3.5 h-3.5 text-[#F472B6]" />}
                    {preset.type === 'ambiguous' && <X className="w-3.5 h-3.5 text-[#F87171]" />}
                    <span className="text-xs font-medium truncate">{preset.name}</span>
                  </div>
                  <p className="text-[10px] text-[#55665A] dark:text-[#55665A] light:text-[#94A3B8] truncate">
                    {preset.extractedText}
                  </p>
                </div>
                {isAttached && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Currently Attached Images & Previews */}
      {screenshots.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1E2824] dark:border-[#1E2824] light:border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB] font-medium">
              Attached Images ({screenshots.length}):
            </span>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Plus className="w-3 h-3" />}
              className="text-xs py-1 h-auto"
            >
              Add another
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {screenshots.map((shot) => (
              <div
                key={shot.id}
                className="p-3 rounded-lg bg-[#151D1A] border border-[#1E2824] flex items-start justify-between gap-3 text-xs text-[#F3F4F1] dark:bg-[#151D1A] dark:border-[#1E2824] dark:text-[#F3F4F1] light:bg-[#F8FAFC] light:border-[#E2E8F0] light:text-[#111827]"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Image Preview Box */}
                  <div className="w-12 h-12 rounded bg-[#111816] border border-[#1E2824] overflow-hidden flex items-center justify-center shrink-0">
                    {shot.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shot.previewUrl}
                        alt={shot.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#9ED8A3] dark:text-[#9ED8A3] light:text-[#2563EB]" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="font-medium truncate block text-xs">{shot.name}</span>
                    <p className="text-[10px] text-[#8C9E90] dark:text-[#8C9E90] light:text-[#64748B] line-clamp-2">
                      {shot.extractedText || 'Ready for processing'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveScreenshot(shot.id)}
                  className="p-1 rounded text-[#55665A] hover:text-[#E07A7A] transition-colors shrink-0"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
