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
  | 'task_breakdown'
  | 'priority_prompt';

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
  pendingTaskData?: Partial<Task>;
  isDismissed?: boolean;
  isApplied?: boolean;
}

export type CourseResourceType = 'file' | 'folder' | 'image' | 'text' | 'link';

export interface CourseFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface CourseResource {
  id: string;
  name: string;
  type: CourseResourceType;
  folderId?: string | null; // For nesting inside a folder
  fileSize?: string;
  fileUrl?: string; // base64 or external URL
  textContent?: string; // for text notes & cheatsheets
  createdAt: string;
  tags?: string[];
}

export interface CourseInfo {
  id: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Database Management Systems"
  professor?: string;
  credits?: number;
  semester?: string;
  portalUrl?: string; // e.g. Moodle, Canvas, Classroom link
  notes?: string;
  color?: string;
  folders?: CourseFolder[];
  resources?: CourseResource[];
}

// Creative Idea Incubator & Enhancer Types
export type IdeaCategory =
  | 'Tech & Code'
  | 'College & Academic'
  | 'Creative & Design'
  | 'Startup & Business'
  | 'Writing & Content'
  | 'Personal Experiment';

export type IdeaStage = 'sprout' | 'incubating' | 'blueprint' | 'planted';

export type EnhancementMode = 'blueprint' | 'action_plan' | 'brainstorm' | 'pitch_outline';

export interface IdeaMilestone {
  phase: string;
  title: string;
  duration?: string;
  tasks: string[];
}

export interface IdeaBlueprint {
  conceptSummary: string;
  targetAudienceOrValue: string;
  techStackOrTools: string[];
  keyFeatures: string[];
  milestones: IdeaMilestone[];
  potentialBottlenecks: string[];
  totoroProTip: string;
}

export interface CreativeIdea {
  id: string;
  title: string;
  rawThought: string;
  category: IdeaCategory;
  stage: IdeaStage;
  tags: string[];
  blueprint?: IdeaBlueprint;
  createdAt: string;
  updatedAt: string;
  isPlantedAsTasks?: boolean;
}

export type AppScreen = 'home' | 'braindump' | 'incubator' | 'plan' | 'tasks' | 'library' | 'settings';
export type AppTheme = 'dark' | 'light';

export type AssistantTone = 'Calm & Direct' | 'Brief & Analytical' | 'Gentle & Supportive';
export type LearningStyle = 'Visual & Diagrams' | 'Hands-on Projects' | 'Step-by-step Bullet Points' | 'Concise Summaries';
export type PeakFocusWindow = 'Early Morning (6 AM - 11 AM)' | 'Afternoon (12 PM - 5 PM)' | 'Evening (5 PM - 9 PM)' | 'Night Owl (9 PM - 2 AM)';

export interface UserProfile {
  name: string;
  roleTitle: string;
  assistantTone: AssistantTone;
  dailyFocusLimitHours: number;
  morningBriefingTime: string;
  autoWorkloadEasing: boolean;
  calendarSyncEnabled: boolean;
  voiceInputMode: boolean;

  // Personal Library Fields
  bio?: string;
  primaryGoal?: string;
  learningStyle?: LearningStyle;
  peakFocusWindow?: PeakFocusWindow;
  burnoutTriggers?: string;
  routines?: string;
  sideProjects?: string;

  // Academic Library Fields
  university?: string;
  degree?: string;
  major?: string;
  semester?: string;
  targetCgpa?: string;
  academicNotes?: string;
  courses?: CourseInfo[];
}

export interface OneNextActionResult {
  task: Task | null;
  reason: string;
  timeContext: string;
  firstStep: string | null;
  hasSubtasks: boolean;
  isUrgent: boolean;
  totalActiveTasks: number;
  hasAlternatives: boolean;
  confidenceScore?: number;
}

