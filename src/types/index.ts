export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskCategory =
  | 'Academics'
  | 'Projects'
  | 'Personal'
  | 'Health'
  | 'Admin';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  estimatedTime?: string; // e.g. "45m", "1h 30m"
  estimatedMinutes?: number;
  deadline?: string; // e.g. "Today · 11:59 PM", "Tomorrow · 10:00 AM", "Thursday"
  scheduledDay?: string; // "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  scheduledTime?: string; // "09:00 AM", "02:00 PM"
  isCompleted: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  tags?: string[];
  notes?: string;
  isPriorityToday?: boolean;
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ScheduleBlock {
  id: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  title: string;
  category: TaskCategory | 'Focus Block' | 'Rest' | 'Lecture';
  priority?: Priority;
  isAIRecommended?: boolean;
  notes?: string;
}

export type BrainDumpInputType = 'text' | 'voice' | 'screenshot' | 'image' | 'mixed';
export type BrainDumpSource = 'text' | 'voice' | 'image' | 'screenshot' | 'mixed';
export type BrainDumpStatus = 'draft' | 'processing' | 'review' | 'accepted' | 'raw' | 'analyzing' | 'organized';

export type ExtractedItemType = 'task' | 'deadline' | 'reminder' | 'event' | 'routine';

export interface ExtractedBrainItem {
  id: string;
  title: string;
  type: ExtractedItemType;
  category: TaskCategory;
  priority: Priority;
  deadline?: string;
  timeSlot?: string;
  day?: DayOfWeek;
  notes?: string;
  sourceType: BrainDumpSource;
  sourceLabel?: string;
  selected: boolean;
  isAccepted?: boolean;
  confidence?: number;
  needsClarification?: boolean;
  clarificationNote?: string;
  location?: string;
  people?: string[];
  dependencies?: string[];
}

export interface BrainDumpAttachment {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'assignment' | 'timetable' | 'custom' | string;
  previewUrl?: string;
  fileSize?: string;
  extractedText?: string;
  timestamp: string;
}

// Backwards-compatible alias for existing code
export type BrainDumpScreenshot = BrainDumpAttachment;

export interface BrainDumpAnalysisResult {
  summary: string;
  items: ExtractedBrainItem[];
  counts: {
    tasks: number;
    deadlines: number;
    reminders: number;
    events: number;
  };
  visionConfigured?: boolean;
  visionProviderUsed?: string;
  visionStatusMessage?: string;
  rawVisionSummary?: string;
}

export interface ExtractedTaskPreview {
  title: string;
  category: TaskCategory;
  priority: Priority;
  estimatedTime?: string;
  deadline?: string;
}

export interface ExtractedSchedulePreview {
  title: string;
  day: DayOfWeek;
  timeSlot: string;
}

export interface BrainDump {
  id: string;
  createdAt: string;
  rawText: string;
  attachments: BrainDumpAttachment[];
  source: BrainDumpSource;
  inputType: BrainDumpInputType;
  timestamp: string;
  status: BrainDumpStatus;
  extractedItems: ExtractedBrainItem[];
  acceptedItemIds?: string[];
  extractedSummary?: string;
}

export interface BrainDumpItem {
  id: string;
  rawText: string;
  inputType: BrainDumpInputType;
  timestamp: string;
  status: BrainDumpStatus;
  source?: BrainDumpSource;
  createdAt?: string;
  attachments?: BrainDumpAttachment[];
  extractedSummary?: string;
  extractedTasks?: ExtractedTaskPreview[];
  extractedSchedule?: ExtractedSchedulePreview[];
  extractedBrainItems?: ExtractedBrainItem[];
  extractedItems?: ExtractedBrainItem[];
  acceptedItemIds?: string[];
  notes?: string;
}

export type RecommendationType =
  | 'right_now'
  | 'exhaustion_reduction'
  | 'schedule_optimization'
  | 'task_breakdown';

export interface AIRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  message: string;
  context?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  suggestedTasksToMove?: string[];
  recommendedTaskId?: string;
  isDismissed?: boolean;
  isApplied?: boolean;
}

export type AppScreen = 'home' | 'braindump' | 'plan' | 'tasks' | 'settings';
export type AppTheme = 'dark' | 'light';

export type AssistantTone = 'Calm & Direct' | 'Brief & Analytical' | 'Gentle & Supportive';

export interface UserProfile {
  name: string;
  roleTitle: string;
  assistantTone: AssistantTone;
  dailyFocusLimitHours: number;
  morningBriefingTime: string;
  autoWorkloadEasing: boolean;
  calendarSyncEnabled: boolean;
  voiceInputMode: boolean;
}
