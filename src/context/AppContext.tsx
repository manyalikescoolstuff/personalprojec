'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import {
  AppScreen,
  AppTheme,
  UserProfile,
  Task,
  ScheduleBlock,
  BrainDumpItem,
  BrainDumpInputType,
  AIRecommendation,
  ExtractedBrainItem,
} from '@/types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_TASKS,
  INITIAL_WEEK_SCHEDULE,
  INITIAL_AI_RECOMMENDATION,
  INITIAL_BRAIN_DUMPS,
} from '@/services/mockData';
import { aiAssistantService } from '@/services/aiAssistantService';
import { subscribeToAuthState } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  subscribeToTasks,
  createTaskDoc,
  updateTaskDoc,
  deleteTaskDoc,
  batchSetTasks,
  subscribeToSchedule,
  saveScheduleBlockDoc,
  updateScheduleBlockDoc,
  deleteScheduleBlockDoc,
  batchSetSchedule,
  subscribeToBrainDumps,
  saveBrainDumpDoc,
  updateBrainDumpDoc,
  deleteBrainDumpDoc,
  batchSetBrainDumps,
  subscribeToProfile,
  saveUserProfileDoc,
} from '@/lib/supabase/database';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local';

interface AppContextType {
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Supabase Auth & Cloud Sync
  authUser: User | null;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isSupabaseActive: boolean;
  isFirebaseActive: boolean; // Alias for backward compatibility
  syncStatus: SyncStatus;

  // Tasks
  tasks: Task[];
  addTask: (taskData: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  generateSubtasksWithAI: (taskId: string) => void;

  // Schedule & Plan
  schedule: ScheduleBlock[];
  addScheduleBlock: (block: ScheduleBlock) => void;
  updateScheduleBlock: (id: string, updates: Partial<ScheduleBlock>) => void;
  deleteScheduleBlock: (id: string) => void;

  // AI Recommendations & Commands
  aiRecommendation: AIRecommendation | null;
  setAiRecommendation: (rec: AIRecommendation | null) => void;
  executeCommand: (command: string) => void;
  acceptRecommendation: (recId: string) => void;
  dismissRecommendation: (recId: string) => void;

  // Brain Dump
  brainDumps: BrainDumpItem[];
  addBrainDump: (rawText: string, inputType: BrainDumpInputType) => void;
  addBrainDumpRecord: (dump: BrainDumpItem) => void;
  updateBrainDump: (dumpId: string, updates: Partial<BrainDumpItem>) => void;
  acceptExtractedItem: (dumpId: string, item: ExtractedBrainItem) => void;
  acceptAllExtractedItems: (dumpId: string, items: ExtractedBrainItem[]) => void;
  acceptExtractedTasks: (dumpId: string) => void;
  addExtractedBrainItems: (items: ExtractedBrainItem[]) => void;
  deleteBrainDump: (dumpId: string) => void;

  // Modals & UI States
  selectedTaskDetail: Task | null;
  setSelectedTaskDetail: (task: Task | null) => void;
  isExhaustionModalOpen: boolean;
  setExhaustionModalOpen: (open: boolean) => void;
  applyExhaustionPlan: (taskIdsToMove: string[]) => void;
  focusSessionTask: Task | null;
  isFocusTimerOpen: boolean;
  startFocusSession: (task?: Task) => void;
  closeFocusSession: () => void;
  isQuickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(INITIAL_WEEK_SCHEDULE);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(
    INITIAL_AI_RECOMMENDATION
  );
  const [brainDumps, setBrainDumps] = useState<BrainDumpItem[]>(INITIAL_BRAIN_DUMPS);

  // Supabase Auth & Cloud Sync States
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const isSupabaseActive = Boolean(isSupabaseConfigured() && authUser);

  // Modals
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [isExhaustionModalOpen, setExhaustionModalOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [focusSessionTask, setFocusSessionTask] = useState<Task | null>(null);
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);

  // Flags to avoid overwriting remote DB with initial local state on first login
  const isInitializedRef = useRef(false);

  // Synchronize HTML theme class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else {
        root.classList.remove('light');
        root.classList.add('dark');
      }
    }
  }, [theme]);

  // Subscribe to Supabase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setAuthUser(user);
      if (user) {
        setSyncStatus('syncing');
      } else {
        setSyncStatus(isSupabaseConfigured() ? 'offline' : 'local');
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Supabase Database Subscriptions
  useEffect(() => {
    if (!authUser || !isSupabaseConfigured()) {
      return;
    }

    const userId = authUser.id;
    setSyncStatus('syncing');

    // Subscribe to Tasks
    const unsubTasks = subscribeToTasks(
      userId,
      (remoteTasks) => {
        if (remoteTasks.length > 0) {
          setTasks(remoteTasks);
        } else if (!isInitializedRef.current && INITIAL_TASKS.length > 0) {
          batchSetTasks(userId, INITIAL_TASKS).catch(console.error);
        }
        setSyncStatus('synced');
      },
      () => setSyncStatus('offline')
    );

    // Subscribe to Schedule
    const unsubSchedule = subscribeToSchedule(
      userId,
      (remoteSchedule) => {
        if (remoteSchedule.length > 0) {
          setSchedule(remoteSchedule);
        } else if (!isInitializedRef.current && INITIAL_WEEK_SCHEDULE.length > 0) {
          batchSetSchedule(userId, INITIAL_WEEK_SCHEDULE).catch(console.error);
        }
      }
    );

    // Subscribe to Brain Dumps
    const unsubDumps = subscribeToBrainDumps(
      userId,
      (remoteDumps) => {
        if (remoteDumps.length > 0) {
          setBrainDumps(remoteDumps);
        } else if (!isInitializedRef.current && INITIAL_BRAIN_DUMPS.length > 0) {
          batchSetBrainDumps(userId, INITIAL_BRAIN_DUMPS).catch(console.error);
        }
      }
    );

    // Subscribe to Profile
    const unsubProfile = subscribeToProfile(
      userId,
      (remoteProfile) => {
        if (remoteProfile && remoteProfile.name) {
          setProfile((prev) => ({ ...prev, ...remoteProfile }));
        }
      }
    );

    isInitializedRef.current = true;

    return () => {
      unsubTasks();
      unsubSchedule();
      unsubDumps();
      unsubProfile();
    };
  }, [authUser]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    if (authUser) {
      saveUserProfileDoc(authUser.id, { ...profile, ...updates }).catch(console.warn);
    }
  };

  // Task Operations
  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title?.trim() || 'Untitled Priority',
      description: taskData.description || '',
      category: taskData.category || 'Academics',
      priority: taskData.priority || 'medium',
      estimatedTime: taskData.estimatedTime || '30m',
      estimatedMinutes: taskData.estimatedMinutes || 30,
      deadline: taskData.deadline || 'Today',
      scheduledDay: taskData.scheduledDay || 'Wed',
      scheduledTime: taskData.scheduledTime,
      isCompleted: false,
      isPriorityToday: taskData.isPriorityToday ?? true,
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [taskData.category || 'Personal'],
      notes: taskData.notes || '',
    };

    setTasks((prev) => [newTask, ...prev]);

    if (authUser) {
      createTaskDoc(authUser.id, newTask).catch(console.warn);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail((prev) => (prev ? { ...prev, ...updates } : null));
    }
    if (authUser) {
      updateTaskDoc(authUser.id, taskId, updates).catch(console.warn);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail(null);
    }
    if (authUser) {
      deleteTaskDoc(authUser.id, taskId).catch(console.warn);
    }
  };

  const toggleTaskComplete = (taskId: string) => {
    let targetUpdate: Partial<Task> | null = null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = !t.isCompleted;
          targetUpdate = {
            isCompleted: next,
            completedAt: next
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
          return {
            ...t,
            ...targetUpdate,
          };
        }
        return t;
      })
    );

    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail((prev) =>
        prev
          ? {
              ...prev,
              isCompleted: !prev.isCompleted,
              completedAt: !prev.isCompleted
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : undefined,
            }
          : null
      );
    }

    if (authUser && targetUpdate) {
      updateTaskDoc(authUser.id, taskId, targetUpdate).catch(console.warn);
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    let updatedSubtasks: Task['subtasks'] = [];
    let allDone = false;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          updatedSubtasks = task.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
          );
          allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.isCompleted);
          return {
            ...task,
            subtasks: updatedSubtasks,
            isCompleted: allDone ? true : task.isCompleted,
          };
        }
        return task;
      })
    );

    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: updatedSubtasks,
          isCompleted: allDone ? true : prev.isCompleted,
        };
      });
    }

    if (authUser) {
      updateTaskDoc(authUser.id, taskId, {
        subtasks: updatedSubtasks,
      }).catch(console.warn);
    }
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSubtask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      isCompleted: false,
    };
    const currentTask = tasks.find((t) => t.id === taskId);
    const updatedSubtasks = [...(currentTask?.subtasks || []), newSubtask];

    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const generateSubtasksWithAI = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const generated = aiAssistantService.breakTaskIntoSubtasks(task.title);
    updateTask(taskId, {
      subtasks: [...task.subtasks, ...generated],
    });
  };

  // Schedule Operations
  const addScheduleBlock = (block: ScheduleBlock) => {
    setSchedule((prev) => [...prev, block]);
    if (authUser) {
      saveScheduleBlockDoc(authUser.id, block).catch(console.warn);
    }
  };

  const updateScheduleBlock = (id: string, updates: Partial<ScheduleBlock>) => {
    setSchedule((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    if (authUser) {
      updateScheduleBlockDoc(authUser.id, id, updates).catch(console.warn);
    }
  };

  const deleteScheduleBlock = (id: string) => {
    setSchedule((prev) => prev.filter((b) => b.id !== id));
    if (authUser) {
      deleteScheduleBlockDoc(authUser.id, id).catch(console.warn);
    }
  };

  // Command Bar Execution
  const executeCommand = (command: string) => {
    const cleanCmd = command.trim().toLowerCase();

    if (!cleanCmd) return;

    if (cleanCmd.includes('what should i do') || cleanCmd.includes('right now') || cleanCmd === 'priority') {
      const rec = aiAssistantService.getRightNowRecommendation(tasks);
      setAiRecommendation(rec);
      return;
    }

    if (cleanCmd.includes('tired') || cleanCmd.includes('exhausted') || cleanCmd.includes('reduce')) {
      const rec = aiAssistantService.getExhaustionReductionPlan(tasks);
      setAiRecommendation(rec);
      setExhaustionModalOpen(true);
      return;
    }

    if (cleanCmd.includes('braindump') || cleanCmd.includes('dump')) {
      setActiveScreen('braindump');
      return;
    }

    if (cleanCmd.includes('plan') || cleanCmd.includes('week') || cleanCmd.includes('schedule')) {
      setActiveScreen('plan');
      return;
    }

    if (cleanCmd.includes('task') || cleanCmd.includes('todo')) {
      setActiveScreen('tasks');
      return;
    }

    if (cleanCmd.startsWith('add ') || cleanCmd.startsWith('new ')) {
      const title = command.replace(/^(add|new)\s+(task\s*:?|todo\s*:?)?/i, '').trim();
      if (title) {
        addTask({ title, priority: 'medium', category: 'Personal', isPriorityToday: true });
        setAiRecommendation({
          id: `rec-created-${Date.now()}`,
          type: 'right_now',
          title: 'Priority Created',
          message: `Added "${title}" to your active priorities for today.`,
          actionLabel: 'View in Tasks',
        });
        return;
      }
    }

    // Call Totoro's Live Gemini AI Brain
    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: command,
        tasks,
        schedule,
        tone: profile.assistantTone,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.reply) {
          setAiRecommendation({
            id: `rec-cmd-${Date.now()}`,
            type: 'right_now',
            title: 'Totoro Forest AI',
            message: data.reply,
            actionLabel: 'Focus Sanctuary',
          });
        }
      })
      .catch(() => {
        setAiRecommendation({
          id: `rec-cmd-${Date.now()}`,
          type: 'right_now',
          title: 'Command Acknowledged',
          message: `Analyzing: "${command}". All scheduled priority windows are synchronized.`,
          actionLabel: 'View Schedule',
        });
      });
  };

  const acceptRecommendation = (recId: string) => {
    if (aiRecommendation?.id === recId) {
      if (aiRecommendation.type === 'schedule_optimization') {
        const updatedSchedule = schedule.map((block) => {
          if (block.title.includes('DBMS')) {
            return {
              ...block,
              day: 'Thu' as const,
              startTime: '09:30',
              endTime: '12:00',
              isAIRecommended: false,
              notes: 'Optimized into morning focus block.',
            };
          }
          return block;
        });
        setSchedule(updatedSchedule);
        if (authUser) {
          batchSetSchedule(authUser.id, updatedSchedule).catch(console.warn);
        }
      }
      setAiRecommendation((prev) => (prev ? { ...prev, isApplied: true } : null));
    }
  };

  const dismissRecommendation = (recId: string) => {
    if (aiRecommendation?.id === recId) {
      setAiRecommendation(null);
    }
  };

  // Exhaustion reduction executor
  const applyExhaustionPlan = (taskIdsToMove: string[]) => {
    const updatedTasks = tasks.map((t) => {
      if (taskIdsToMove.includes(t.id)) {
        return {
          ...t,
          isPriorityToday: false,
          scheduledDay: 'Thu',
          deadline: 'Thursday · Postponed',
          notes: (t.notes ? t.notes + ' · ' : '') + 'Postponed during workload easing.',
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    if (authUser) {
      batchSetTasks(authUser.id, updatedTasks).catch(console.warn);
    }

    setExhaustionModalOpen(false);
    setAiRecommendation({
      id: `rec-post-ease-${Date.now()}`,
      type: 'exhaustion_reduction',
      title: "Today's Workload Eased",
      message: 'Moved 3 non-essential tasks to Thursday. Your remaining schedule for tonight is clear.',
      actionLabel: 'Dismiss',
    });
  };

  // Brain Dump Operations
  const addBrainDump = (rawText: string, inputType: BrainDumpInputType) => {
    const parsed = aiAssistantService.organizeBrainDump(rawText, inputType);
    const newDump: BrainDumpItem = {
      id: `dump-${Date.now()}`,
      rawText: rawText.trim(),
      inputType,
      timestamp: 'Just now',
      status: 'organized',
      extractedSummary: parsed.extractedSummary,
      extractedTasks: parsed.extractedTasks,
      extractedSchedule: parsed.extractedSchedule,
    };
    setBrainDumps((prev) => [newDump, ...prev]);
    if (authUser) {
      saveBrainDumpDoc(authUser.id, newDump).catch(console.warn);
    }
  };

  const addBrainDumpRecord = (dump: BrainDumpItem) => {
    setBrainDumps((prev) => {
      const exists = prev.some((d) => d.id === dump.id);
      if (exists) {
        return prev.map((d) => (d.id === dump.id ? { ...d, ...dump } : d));
      }
      return [dump, ...prev];
    });
    if (authUser) {
      saveBrainDumpDoc(authUser.id, dump).catch(console.warn);
    }
  };

  const updateBrainDump = (dumpId: string, updates: Partial<BrainDumpItem>) => {
    setBrainDumps((prev) =>
      prev.map((d) => (d.id === dumpId ? { ...d, ...updates } : d))
    );
    if (authUser) {
      updateBrainDumpDoc(authUser.id, dumpId, updates).catch(console.warn);
    }
  };

  const acceptExtractedItem = (dumpId: string, item: ExtractedBrainItem) => {
    if (item.type === 'event' && item.day) {
      addScheduleBlock({
        id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        day: item.day,
        startTime: item.timeSlot?.split('-')[0]?.trim() || '14:00',
        endTime: item.timeSlot?.split('-')[1]?.trim() || '16:00',
        title: item.title,
        category: item.category,
        priority: item.priority,
        notes: item.notes,
      });
    } else {
      addTask({
        title: item.title,
        description: item.notes || '',
        category: item.category,
        priority: item.priority,
        estimatedTime: item.type === 'routine' ? '45m' : item.type === 'reminder' ? '15m' : '30m',
        estimatedMinutes: item.type === 'routine' ? 45 : item.type === 'reminder' ? 15 : 30,
        deadline: item.deadline || 'Today',
        scheduledDay: item.day || 'Wed',
        isCompleted: false,
        isPriorityToday: true,
        subtasks: [],
        tags: [item.category, item.type],
        notes: item.notes,
      });
    }

    const updatedDumps = brainDumps.map((d) => {
      if (d.id === dumpId) {
        const acceptedItemIds = Array.from(new Set([...(d.acceptedItemIds || []), item.id]));
        const extractedItems = (d.extractedItems || d.extractedBrainItems || []).map((ei) =>
          ei.id === item.id ? { ...ei, isAccepted: true } : ei
        );
        return {
          ...d,
          status: 'accepted' as const,
          acceptedItemIds,
          extractedItems,
          extractedBrainItems: extractedItems,
        };
      }
      return d;
    });

    setBrainDumps(updatedDumps);
    if (authUser) {
      const dumpToSave = updatedDumps.find((d) => d.id === dumpId);
      if (dumpToSave) {
        updateBrainDumpDoc(authUser.id, dumpId, dumpToSave).catch(console.warn);
      }
    }
  };

  const acceptAllExtractedItems = (dumpId: string, items: ExtractedBrainItem[]) => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) return;

    const newTasks: Task[] = [];
    const newScheduleBlocks: ScheduleBlock[] = [];
    const acceptedIds: string[] = [];

    selected.forEach((item) => {
      acceptedIds.push(item.id);
      if (item.type === 'event' && item.day) {
        const block: ScheduleBlock = {
          id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          day: item.day,
          startTime: item.timeSlot?.split('-')[0]?.trim() || '14:00',
          endTime: item.timeSlot?.split('-')[1]?.trim() || '16:00',
          title: item.title,
          category: item.category,
          priority: item.priority,
          notes: item.notes,
        };
        newScheduleBlocks.push(block);
        if (authUser) {
          saveScheduleBlockDoc(authUser.id, block).catch(console.warn);
        }
      } else {
        const task: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          title: item.title,
          description: item.notes || '',
          category: item.category,
          priority: item.priority,
          estimatedTime: item.type === 'routine' ? '45m' : item.type === 'reminder' ? '15m' : '30m',
          estimatedMinutes: item.type === 'routine' ? 45 : item.type === 'reminder' ? 15 : 30,
          deadline: item.deadline || 'Today',
          scheduledDay: item.day || 'Wed',
          isCompleted: false,
          isPriorityToday: true,
          subtasks: [],
          tags: [item.category, item.type],
          notes: item.notes,
        };
        newTasks.push(task);
        if (authUser) {
          createTaskDoc(authUser.id, task).catch(console.warn);
        }
      }
    });

    if (newTasks.length > 0) {
      setTasks((prev) => [...newTasks, ...prev]);
    }

    if (newScheduleBlocks.length > 0) {
      setSchedule((prev) => [...prev, ...newScheduleBlocks]);
    }

    const updatedDumps = brainDumps.map((d) => {
      if (d.id === dumpId) {
        const acceptedItemIds = Array.from(new Set([...(d.acceptedItemIds || []), ...acceptedIds]));
        const extractedItems = (d.extractedItems || d.extractedBrainItems || []).map((ei) =>
          acceptedIds.includes(ei.id) ? { ...ei, isAccepted: true } : ei
        );
        return {
          ...d,
          status: 'accepted' as const,
          acceptedItemIds,
          extractedItems,
          extractedBrainItems: extractedItems,
        };
      }
      return d;
    });

    setBrainDumps(updatedDumps);
    if (authUser) {
      const dumpToSave = updatedDumps.find((d) => d.id === dumpId);
      if (dumpToSave) {
        updateBrainDumpDoc(authUser.id, dumpId, dumpToSave).catch(console.warn);
      }
    }
  };

  const acceptExtractedTasks = (dumpId: string) => {
    const dump = brainDumps.find((d) => d.id === dumpId);
    if (!dump || !dump.extractedTasks) return;

    dump.extractedTasks.forEach((ext) => {
      addTask({
        title: ext.title,
        category: ext.category,
        priority: ext.priority,
        estimatedTime: ext.estimatedTime,
        deadline: ext.deadline,
        isPriorityToday: true,
      });
    });

    setBrainDumps((prev) =>
      prev.map((d) => (d.id === dumpId ? { ...d, status: 'organized' } : d))
    );
  };

  const addExtractedBrainItems = (items: ExtractedBrainItem[]) => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) return;

    const newTasks: Task[] = [];
    const newScheduleBlocks: ScheduleBlock[] = [];

    selected.forEach((item) => {
      if (item.type === 'event' && item.day) {
        const block: ScheduleBlock = {
          id: `sched-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          day: item.day,
          startTime: item.timeSlot?.split('-')[0]?.trim() || '14:00',
          endTime: item.timeSlot?.split('-')[1]?.trim() || '16:00',
          title: item.title,
          category: item.category,
          priority: item.priority,
          notes: item.notes,
        };
        newScheduleBlocks.push(block);
        if (authUser) {
          saveScheduleBlockDoc(authUser.id, block).catch(console.warn);
        }
      } else {
        const task: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          title: item.title,
          description: item.notes || '',
          category: item.category,
          priority: item.priority,
          estimatedTime: '30m',
          estimatedMinutes: 30,
          deadline: item.deadline || 'Today',
          isCompleted: false,
          isPriorityToday: true,
          subtasks: [],
          tags: [item.category, item.type],
          notes: item.notes,
        };
        newTasks.push(task);
        if (authUser) {
          createTaskDoc(authUser.id, task).catch(console.warn);
        }
      }
    });

    if (newTasks.length > 0) {
      setTasks((prev) => [...newTasks, ...prev]);
    }

    if (newScheduleBlocks.length > 0) {
      setSchedule((prev) => [...prev, ...newScheduleBlocks]);
    }

    const newDump: BrainDumpItem = {
      id: `dump-${Date.now()}`,
      rawText: selected.map((s) => s.title).join(', '),
      inputType: 'text',
      timestamp: 'Just now',
      status: 'organized',
      extractedSummary: `Organized ${selected.length} items into tasks and schedule.`,
      extractedBrainItems: selected,
    };
    setBrainDumps((prev) => [newDump, ...prev]);
    if (authUser) {
      saveBrainDumpDoc(authUser.id, newDump).catch(console.warn);
    }

    setAiRecommendation({
      id: `rec-dump-added-${Date.now()}`,
      type: 'right_now',
      title: 'Brain Dump Organized',
      message: `Added ${selected.length} items to your workspace. Your priorities and schedule are updated.`,
      actionLabel: 'View in Tasks',
    });
  };

  const deleteBrainDump = (dumpId: string) => {
    setBrainDumps((prev) => prev.filter((d) => d.id !== dumpId));
    if (authUser) {
      deleteBrainDumpDoc(authUser.id, dumpId).catch(console.warn);
    }
  };

  // Focus Timer
  const startFocusSession = (task?: Task) => {
    const target = task || tasks.find((t) => !t.isCompleted && t.isPriorityToday) || tasks[0] || null;
    setFocusSessionTask(target);
    setIsFocusTimerOpen(true);
  };

  const closeFocusSession = () => {
    setIsFocusTimerOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        theme,
        toggleTheme,
        setTheme,
        profile,
        updateProfile,
        authUser,
        isAuthModalOpen,
        setAuthModalOpen,
        isSupabaseActive,
        isFirebaseActive: isSupabaseActive,
        syncStatus,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtask,
        addSubtask,
        generateSubtasksWithAI,
        schedule,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
        aiRecommendation,
        setAiRecommendation,
        executeCommand,
        acceptRecommendation,
        dismissRecommendation,
        brainDumps,
        addBrainDump,
        addBrainDumpRecord,
        updateBrainDump,
        acceptExtractedItem,
        acceptAllExtractedItems,
        acceptExtractedTasks,
        addExtractedBrainItems,
        deleteBrainDump,
        selectedTaskDetail,
        setSelectedTaskDetail,
        isExhaustionModalOpen,
        setExhaustionModalOpen,
        applyExhaustionPlan,
        focusSessionTask,
        isFocusTimerOpen,
        startFocusSession,
        closeFocusSession,
        isQuickAddOpen,
        setQuickAddOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;
