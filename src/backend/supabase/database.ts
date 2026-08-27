import { Task, ScheduleBlock, BrainDumpItem, UserProfile } from '@/types';
import { getSupabase, isSupabaseConfigured } from './client';

// ===========================================================================
// Tasks Database Operations & Realtime Subscriptions
// ===========================================================================

export const subscribeToTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured() || !userId) {
    return () => {};
  }

  // 1. Initial Fetch
  supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .then(({ data, error }) => {
      if (error) {
        console.warn('Supabase fetch tasks error:', error);
        if (onError) onError(new Error(error.message));
        return;
      }
      if (data) {
        onUpdate(data.map(mapRowToTask));
      }
    });

  // 2. Realtime Channel Subscription
  const channel = supabase
    .channel(`realtime:tasks:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
      () => {
        // Re-fetch latest snapshot on any change
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .then(({ data }) => {
            if (data) onUpdate(data.map(mapRowToTask));
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const createTaskDoc = async (userId: string, task: Task): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const row = mapTaskToRow(userId, task);
  const { error } = await supabase.from('tasks').upsert(row);
  if (error) console.warn('Supabase create task error:', error);
};

export const updateTaskDoc = async (
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const partialRow: Record<string, unknown> = {};
  if (updates.title !== undefined) partialRow.title = updates.title;
  if (updates.description !== undefined) partialRow.description = updates.description;
  if (updates.category !== undefined) partialRow.category = updates.category;
  if (updates.priority !== undefined) partialRow.priority = updates.priority;
  if (updates.estimatedTime !== undefined) partialRow.estimated_time = updates.estimatedTime;
  if (updates.estimatedMinutes !== undefined) partialRow.estimated_minutes = updates.estimatedMinutes;
  if (updates.deadline !== undefined) partialRow.deadline = updates.deadline;
  if (updates.scheduledDay !== undefined) partialRow.scheduled_day = updates.scheduledDay;
  if (updates.scheduledTime !== undefined) partialRow.scheduled_time = updates.scheduledTime;
  if (updates.isCompleted !== undefined) partialRow.is_completed = updates.isCompleted;
  if (updates.completedAt !== undefined) partialRow.completed_at = updates.completedAt;
  if (updates.subtasks !== undefined) partialRow.subtasks = updates.subtasks;
  if (updates.tags !== undefined) partialRow.tags = updates.tags;
  if (updates.notes !== undefined) partialRow.notes = updates.notes;
  if (updates.isPriorityToday !== undefined) partialRow.is_priority_today = updates.isPriorityToday;

  const { error } = await supabase
    .from('tasks')
    .update(partialRow)
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) console.warn('Supabase update task error:', error);
};

export const deleteTaskDoc = async (userId: string, taskId: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) console.warn('Supabase delete task error:', error);
};

export const batchSetTasks = async (userId: string, tasks: Task[]): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId || tasks.length === 0) return;

  const rows = tasks.map((t) => mapTaskToRow(userId, t));
  const { error } = await supabase.from('tasks').upsert(rows);
  if (error) console.warn('Supabase batch set tasks error:', error);
};

// ===========================================================================
// Schedule Blocks Operations
// ===========================================================================

export const subscribeToSchedule = (
  userId: string,
  onUpdate: (blocks: ScheduleBlock[]) => void
): (() => void) => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured() || !userId) return () => {};

  supabase
    .from('schedule_blocks')
    .select('*')
    .eq('user_id', userId)
    .then(({ data }) => {
      if (data) onUpdate(data.map(mapRowToScheduleBlock));
    });

  const channel = supabase
    .channel(`realtime:schedule:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'schedule_blocks', filter: `user_id=eq.${userId}` },
      () => {
        supabase
          .from('schedule_blocks')
          .select('*')
          .eq('user_id', userId)
          .then(({ data }) => {
            if (data) onUpdate(data.map(mapRowToScheduleBlock));
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const saveScheduleBlockDoc = async (
  userId: string,
  block: ScheduleBlock
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const row = mapScheduleBlockToRow(userId, block);
  await supabase.from('schedule_blocks').upsert(row);
};

export const updateScheduleBlockDoc = async (
  userId: string,
  blockId: string,
  updates: Partial<ScheduleBlock>
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const partialRow: Record<string, unknown> = {};
  if (updates.day !== undefined) partialRow.day = updates.day;
  if (updates.startTime !== undefined) partialRow.start_time = updates.startTime;
  if (updates.endTime !== undefined) partialRow.end_time = updates.endTime;
  if (updates.title !== undefined) partialRow.title = updates.title;
  if (updates.category !== undefined) partialRow.category = updates.category;
  if (updates.priority !== undefined) partialRow.priority = updates.priority;
  if (updates.isAIRecommended !== undefined) partialRow.is_ai_recommended = updates.isAIRecommended;
  if (updates.notes !== undefined) partialRow.notes = updates.notes;

  await supabase
    .from('schedule_blocks')
    .update(partialRow)
    .eq('id', blockId)
    .eq('user_id', userId);
};

export const deleteScheduleBlockDoc = async (
  userId: string,
  blockId: string
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  await supabase.from('schedule_blocks').delete().eq('id', blockId).eq('user_id', userId);
};

export const batchSetSchedule = async (
  userId: string,
  blocks: ScheduleBlock[]
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId || blocks.length === 0) return;

  const rows = blocks.map((b) => mapScheduleBlockToRow(userId, b));
  await supabase.from('schedule_blocks').upsert(rows);
};

// ===========================================================================
// Brain Dump Operations
// ===========================================================================

export const subscribeToBrainDumps = (
  userId: string,
  onUpdate: (dumps: BrainDumpItem[]) => void
): (() => void) => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured() || !userId) return () => {};

  supabase
    .from('brain_dumps')
    .select('*')
    .eq('user_id', userId)
    .then(({ data }) => {
      if (data) onUpdate(data.map(mapRowToBrainDump));
    });

  const channel = supabase
    .channel(`realtime:braindumps:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'brain_dumps', filter: `user_id=eq.${userId}` },
      () => {
        supabase
          .from('brain_dumps')
          .select('*')
          .eq('user_id', userId)
          .then(({ data }) => {
            if (data) onUpdate(data.map(mapRowToBrainDump));
          });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const saveBrainDumpDoc = async (
  userId: string,
  dump: BrainDumpItem
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const row = mapBrainDumpToRow(userId, dump);
  await supabase.from('brain_dumps').upsert(row);
};

export const updateBrainDumpDoc = async (
  userId: string,
  dumpId: string,
  updates: Partial<BrainDumpItem>
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const partialRow: Record<string, unknown> = {};
  if (updates.rawText !== undefined) partialRow.raw_text = updates.rawText;
  if (updates.inputType !== undefined) partialRow.input_type = updates.inputType;
  if (updates.status !== undefined) partialRow.status = updates.status;
  if (updates.extractedSummary !== undefined) partialRow.extracted_summary = updates.extractedSummary;
  if (updates.extractedTasks !== undefined) partialRow.extracted_tasks = updates.extractedTasks;
  if (updates.extractedSchedule !== undefined) partialRow.extracted_schedule = updates.extractedSchedule;
  if (updates.extractedBrainItems !== undefined) partialRow.extracted_brain_items = updates.extractedBrainItems;
  if (updates.extractedItems !== undefined) partialRow.extracted_items = updates.extractedItems;
  if (updates.acceptedItemIds !== undefined) partialRow.accepted_item_ids = updates.acceptedItemIds;
  if (updates.notes !== undefined) partialRow.notes = updates.notes;

  await supabase.from('brain_dumps').update(partialRow).eq('id', dumpId).eq('user_id', userId);
};

export const deleteBrainDumpDoc = async (
  userId: string,
  dumpId: string
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;
  await supabase.from('brain_dumps').delete().eq('id', dumpId).eq('user_id', userId);
};

export const batchSetBrainDumps = async (
  userId: string,
  dumps: BrainDumpItem[]
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId || dumps.length === 0) return;

  const rows = dumps.map((d) => mapBrainDumpToRow(userId, d));
  await supabase.from('brain_dumps').upsert(rows);
};

// ===========================================================================
// User Profile Operations
// ===========================================================================

export const subscribeToProfile = (
  userId: string,
  onUpdate: (profile: UserProfile) => void
): (() => void) => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured() || !userId) return () => {};

  supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
    .then(({ data }) => {
      if (data) onUpdate(mapRowToProfile(data));
    });

  return () => {};
};

export const saveUserProfileDoc = async (
  userId: string,
  profile: UserProfile
): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  const row = {
    id: userId,
    name: profile.name,
    role_title: profile.roleTitle,
    assistant_tone: profile.assistantTone,
    daily_focus_limit_hours: profile.dailyFocusLimitHours,
    morning_briefing_time: profile.morningBriefingTime,
    auto_workload_easing: profile.autoWorkloadEasing,
    calendar_sync_enabled: profile.calendarSyncEnabled,
    voice_input_mode: profile.voiceInputMode,
    updated_at: new Date().toISOString(),
  };

  await supabase.from('profiles').upsert(row);
};

// ===========================================================================
// Row Mappers (PostgreSQL Snake_case <-> Frontend CamelCase)
// ===========================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || undefined,
    category: row.category || 'Academics',
    priority: row.priority || 'medium',
    estimatedTime: row.estimated_time || undefined,
    estimatedMinutes: row.estimated_minutes || undefined,
    deadline: row.deadline || undefined,
    scheduledDay: row.scheduled_day || undefined,
    scheduledTime: row.scheduled_time || undefined,
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || undefined,
    subtasks: row.subtasks || [],
    tags: row.tags || [],
    notes: row.notes || undefined,
    isPriorityToday: Boolean(row.is_priority_today),
  };
}

function mapTaskToRow(userId: string, task: Task): Record<string, unknown> {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description || null,
    category: task.category,
    priority: task.priority,
    estimated_time: task.estimatedTime || null,
    estimated_minutes: task.estimatedMinutes || null,
    deadline: task.deadline || null,
    scheduled_day: task.scheduledDay || null,
    scheduled_time: task.scheduledTime || null,
    is_completed: task.isCompleted,
    completed_at: task.completedAt || null,
    subtasks: task.subtasks || [],
    tags: task.tags || [],
    notes: task.notes || null,
    is_priority_today: task.isPriorityToday || false,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToScheduleBlock(row: any): ScheduleBlock {
  return {
    id: row.id,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    title: row.title,
    category: row.category,
    priority: row.priority || undefined,
    isAIRecommended: Boolean(row.is_ai_recommended),
    notes: row.notes || undefined,
  };
}

function mapScheduleBlockToRow(userId: string, b: ScheduleBlock): Record<string, unknown> {
  return {
    id: b.id,
    user_id: userId,
    day: b.day,
    start_time: b.startTime,
    end_time: b.endTime,
    title: b.title,
    category: b.category,
    priority: b.priority || null,
    is_ai_recommended: b.isAIRecommended || false,
    notes: b.notes || null,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToBrainDump(row: any): BrainDumpItem {
  return {
    id: row.id,
    rawText: row.raw_text,
    inputType: row.input_type || 'text',
    timestamp: row.timestamp || row.created_at,
    status: row.status || 'draft',
    source: row.source || undefined,
    createdAt: row.created_at || undefined,
    attachments: row.attachments || [],
    extractedSummary: row.extracted_summary || undefined,
    extractedTasks: row.extracted_tasks || undefined,
    extractedSchedule: row.extracted_schedule || undefined,
    extractedBrainItems: row.extracted_brain_items || undefined,
    extractedItems: row.extracted_items || undefined,
    acceptedItemIds: row.accepted_item_ids || [],
    notes: row.notes || undefined,
  };
}

function mapBrainDumpToRow(userId: string, d: BrainDumpItem): Record<string, unknown> {
  return {
    id: d.id,
    user_id: userId,
    raw_text: d.rawText,
    input_type: d.inputType,
    timestamp: d.timestamp,
    status: d.status,
    source: d.source || null,
    created_at: d.createdAt || new Date().toISOString(),
    attachments: d.attachments || [],
    extracted_summary: d.extractedSummary || null,
    extracted_tasks: d.extractedTasks || null,
    extracted_schedule: d.extractedSchedule || null,
    extracted_brain_items: d.extractedBrainItems || null,
    extracted_items: d.extractedItems || null,
    accepted_item_ids: d.acceptedItemIds || [],
    notes: d.notes || null,
    updated_at: new Date().toISOString(),
  };
}

function mapRowToProfile(row: any): UserProfile {
  return {
    name: row.name || 'Scholar',
    roleTitle: row.role_title || 'Student & Creator',
    assistantTone: row.assistant_tone || 'Calm & Direct',
    dailyFocusLimitHours: row.daily_focus_limit_hours || 6,
    morningBriefingTime: row.morning_briefing_time || '08:30 AM',
    autoWorkloadEasing: row.auto_workload_easing !== false,
    calendarSyncEnabled: Boolean(row.calendar_sync_enabled),
    voiceInputMode: Boolean(row.voice_input_mode),
  };
}
