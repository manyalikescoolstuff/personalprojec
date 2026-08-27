import {
  Task,
  AIRecommendation,
  BrainDumpItem,
  BrainDumpInputType,
  ExtractedTaskPreview,
  ExtractedBrainItem,
  BrainDumpScreenshot,
  BrainDumpAnalysisResult,
  Subtask,
  OneNextActionResult,
} from '@/types';

// Specialized Sub-Parsers for Clean AI Architecture
export const textParser = {
  parse(rawText: string): ExtractedBrainItem[] {
    const lower = rawText.toLowerCase();
    const items: ExtractedBrainItem[] = [];

    // Check for DBMS / Database assignment
    if (lower.includes('dbms') || lower.includes('database')) {
      items.push({
        id: `ext-${Date.now()}-dbms`,
        title: 'Finish DBMS Assignment (B+ Trees & Query Cost)',
        type: 'deadline',
        category: 'Academics',
        priority: 'high',
        deadline: 'Tomorrow · 11:59 PM',
        notes: 'Chapter 14 exercises & SQL query analysis',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Check for DSA / Coding / LeetCode
    if (lower.includes('dsa') || lower.includes('leetcode') || lower.includes('graph') || lower.includes('algorithm')) {
      items.push({
        id: `ext-${Date.now()}-dsa`,
        title: 'Revise DSA: Graph Traversal & Topological Sort',
        type: 'task',
        category: 'Academics',
        priority: 'medium',
        deadline: 'Today · Evening',
        notes: '2 LeetCode problems (Course Schedule & Islands)',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Check for Java / Project
    if (lower.includes('java') || lower.includes('project') || lower.includes('code')) {
      items.push({
        id: `ext-${Date.now()}-java`,
        title: 'Draft Java Project Architecture & Setup Repository',
        type: 'task',
        category: 'Projects',
        priority: 'high',
        deadline: 'Thursday · 5:00 PM',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Check for Call Mom / Family
    if (lower.includes('mom') || lower.includes('call') || lower.includes('phone')) {
      items.push({
        id: `ext-${Date.now()}-mom`,
        title: 'Call Mom',
        type: 'reminder',
        category: 'Personal',
        priority: 'medium',
        deadline: 'Tonight · 9:00 PM',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Check for Shampoo / Groceries / Shopping
    if (lower.includes('shampoo') || lower.includes('buy') || lower.includes('groceries') || lower.includes('store')) {
      items.push({
        id: `ext-${Date.now()}-shampoo`,
        title: 'Buy shampoo & grocery essentials',
        type: 'task',
        category: 'Personal',
        priority: 'low',
        deadline: 'Friday',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Check for Gym / Workout / Health
    if (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise') || lower.includes('water')) {
      items.push({
        id: `ext-${Date.now()}-gym`,
        title: 'Gym session: Strength & mobility',
        type: 'task',
        category: 'Health',
        priority: 'medium',
        deadline: 'Today · 6:00 PM',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Check for Form / Portal / Declaration
    if (lower.includes('form') || lower.includes('submit') || lower.includes('declaration')) {
      items.push({
        id: `ext-${Date.now()}-form`,
        title: 'Submit project declaration form on college portal',
        type: 'deadline',
        category: 'Admin',
        priority: 'urgent',
        deadline: 'Today · 5:00 PM',
        notes: 'Portal closes strictly at 5 PM',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    // Fallback if no specific keywords matched
    if (items.length === 0 && rawText.trim().length > 0) {
      items.push({
        id: `ext-${Date.now()}-generic`,
        title: rawText.trim().slice(0, 60) + (rawText.trim().length > 60 ? '...' : ''),
        type: 'task',
        category: 'Personal',
        priority: 'medium',
        deadline: 'This week',
        sourceType: 'text',
        sourceLabel: 'Text thought',
        selected: true,
      });
    }

    return items;
  },
};

export const voiceParser = {
  parse(transcript: string): ExtractedBrainItem[] {
    const items = textParser.parse(transcript);
    return items.map((item) => ({
      ...item,
      sourceType: 'voice' as const,
      sourceLabel: 'Voice dictation',
    }));
  },
};

export const screenshotParser = {
  parse(screenshots: BrainDumpScreenshot[]): ExtractedBrainItem[] {
    const items: ExtractedBrainItem[] = [];

    screenshots.forEach((shot) => {
      if (shot.type === 'whatsapp') {
        items.push({
          id: `ext-shot-${shot.id}-1`,
          title: 'Review WhatsApp group assignment guidelines',
          type: 'task',
          category: 'Academics',
          priority: 'high',
          deadline: 'Wednesday · 11:59 PM',
          notes: 'Source: ' + shot.name,
          sourceType: 'screenshot',
          sourceLabel: shot.name,
          selected: true,
        });
      } else if (shot.type === 'assignment') {
        items.push({
          id: `ext-shot-${shot.id}-2`,
          title: 'Database Query Optimization Problem Set',
          type: 'deadline',
          category: 'Academics',
          priority: 'high',
          deadline: 'Thursday · 5:00 PM',
          notes: 'Source: ' + shot.name,
          sourceType: 'screenshot',
          sourceLabel: shot.name,
          selected: true,
        });
      } else if (shot.type === 'timetable') {
        items.push({
          id: `ext-shot-${shot.id}-3`,
          title: 'Computer Networks Lab Session',
          type: 'event',
          category: 'Academics',
          priority: 'medium',
          deadline: 'Thursday · 2:00 PM',
          timeSlot: '14:00 - 16:00',
          day: 'Thu',
          notes: 'Source: ' + shot.name,
          sourceType: 'screenshot',
          sourceLabel: shot.name,
          selected: true,
        });
      } else {
        items.push({
          id: `ext-shot-${shot.id}-gen`,
          title: `Actionable item from ${shot.name}`,
          type: 'task',
          category: 'Admin',
          priority: 'medium',
          deadline: 'This week',
          notes: shot.extractedText || 'Extracted from attachment',
          sourceType: 'screenshot',
          sourceLabel: shot.name,
          selected: true,
        });
      }
    });

    return items;
  },
};

export const aiAssistantService = {
  /**
   * Principle 3: "One Next Action"
   * Intelligently selects the single highest leverage task to execute right now.
   * Considers deadlines, priority levels, time of day, estimated effort, and skipped task IDs.
   */
  determineOneNextAction(
    tasks: Task[],
    currentHour: number = new Date().getHours(),
    skippedIds: string[] = []
  ): OneNextActionResult {
    const uncompletedTasks = tasks.filter((t) => !t.isCompleted);
    const totalActive = uncompletedTasks.length;

    if (totalActive === 0) {
      return {
        task: null,
        reason: 'Your sanctuary is all clear! Everything on your plate has been harvested.',
        timeContext: 'Rest, recharge, or dump new seeds when ready 🌱',
        firstStep: null,
        hasSubtasks: false,
        isUrgent: false,
        totalActiveTasks: 0,
        hasAlternatives: false,
      };
    }

    // Filter out skipped IDs if possible, but fallback to all uncompleted if all were skipped
    let pool = uncompletedTasks.filter((t) => !skippedIds.includes(t.id));
    if (pool.length === 0) {
      pool = uncompletedTasks; // Reset pool if user cycled through all
    }

    // Heuristic Scoring
    const scored = pool.map((task) => {
      let score = 0;

      // 1. Base Priority Weight
      if (task.priority === 'urgent') score += 120;
      else if (task.priority === 'high') score += 80;
      else if (task.priority === 'medium') score += 40;
      else score += 15;

      // 2. Today's Focus flag
      if (task.isPriorityToday) score += 35;

      // 3. Deadline urgency
      const dl = (task.deadline || '').toLowerCase();
      const hasTodayDeadline =
        dl.includes('today') ||
        dl.includes('tonight') ||
        dl.includes('now') ||
        dl.includes('11:59');
      const hasTomorrowDeadline = dl.includes('tomorrow');

      if (hasTodayDeadline) score += 90;
      else if (hasTomorrowDeadline) score += 45;

      // 4. Time of Day Context Weighting
      // Morning (5:00 - 11:59): Peak cognitive window -> Academics & complex Projects
      if (currentHour >= 5 && currentHour < 12) {
        if (task.category === 'Academics' || task.category === 'Projects') score += 30;
      }
      // Afternoon (12:00 - 17:00): Steady execution
      else if (currentHour >= 12 && currentHour < 17) {
        if (task.category === 'Projects' || task.category === 'Admin') score += 20;
      }
      // Evening (17:00 - 21:30): Deadline wrap-up
      else if (currentHour >= 17 && currentHour < 22) {
        if (hasTodayDeadline) score += 50;
      }
      // Night (22:00 - 05:00): Low friction quick wins or urgent last-minute submissions
      else {
        if (hasTodayDeadline) score += 60;
        else if (task.priority === 'low' || task.category === 'Personal') score += 25;
      }

      return { task, score, hasTodayDeadline };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0].task;
    const isUrgent = best.priority === 'urgent' || scored[0].hasTodayDeadline;

    // Generate human-friendly reasoning
    let reason = '';
    const dl = best.deadline || '';
    if (isUrgent) {
      reason = dl
        ? `Urgent deadline (${dl}) · Clear this out first to eliminate pressure`
        : 'Top priority item · High leverage focus';
    } else if (best.category === 'Academics') {
      reason = 'Academic focus · Peak cognitive momentum window';
    } else if (best.category === 'Projects') {
      reason = 'Project milestone · Great time to build flow and progress';
    } else if (best.category === 'Personal' || best.priority === 'low') {
      reason = 'Low-friction task · Quick win to keep your momentum going';
    } else {
      reason = 'Recommended next focus based on your energy and schedule';
    }

    // Time context string
    const estTime =
      best.estimatedTime || (best.estimatedMinutes ? `${best.estimatedMinutes}m` : '25m');
    let timeContext = `Estimated ${estTime} focus session`;
    if (currentHour < 12) timeContext += ' · Morning deep work';
    else if (currentHour < 17) timeContext += ' · Afternoon sprint';
    else if (currentHour < 22) timeContext += ' · Evening wrap-up';
    else timeContext += ' · Calm night rhythm';

    // First Step (Micro-action to crush starter friction)
    let firstStep: string | null = null;
    const hasSubtasks = Array.isArray(best.subtasks) && best.subtasks.length > 0;

    if (hasSubtasks) {
      const firstIncomplete = best.subtasks.find((s) => !s.isCompleted);
      if (firstIncomplete) {
        firstStep = firstIncomplete.title;
      }
    }

    if (!firstStep) {
      const lowerTitle = best.title.toLowerCase();
      if (
        lowerTitle.includes('dbms') ||
        lowerTitle.includes('database') ||
        lowerTitle.includes('sql')
      ) {
        firstStep = 'Open notes / assignment portal and read question #1';
      } else if (
        lowerTitle.includes('dsa') ||
        lowerTitle.includes('leetcode') ||
        lowerTitle.includes('code')
      ) {
        firstStep = 'Open IDE / editor and outline test input cases';
      } else if (
        lowerTitle.includes('form') ||
        lowerTitle.includes('submit') ||
        lowerTitle.includes('internship')
      ) {
        firstStep = 'Open submission link and check required fields';
      } else if (lowerTitle.includes('call') || lowerTitle.includes('email')) {
        firstStep = 'Open dialer / draft app and write first greeting sentence';
      } else {
        firstStep = `Dedicate just the first 5 minutes to start "${best.title}"`;
      }
    }

    return {
      task: best,
      reason,
      timeContext,
      firstStep,
      hasSubtasks,
      isUrgent,
      totalActiveTasks: totalActive,
      hasAlternatives: pool.length > 1 || uncompletedTasks.length > 1,
      confidenceScore: Math.min(Math.round((scored[0].score / 250) * 100), 98),
    };
  },

  /**
   * Evaluates active priorities and deadlines to answer:
   * "What should I do right now?"
   */
  getRightNowRecommendation(tasks: Task[]): AIRecommendation {
    const uncompleted = tasks.filter((t) => !t.isCompleted);
    const urgentTask = uncompleted.find((t) => t.priority === 'urgent');
    const highTask = uncompleted.find((t) => t.priority === 'high');
    const priorityTask = urgentTask || highTask || uncompleted[0];

    if (!priorityTask) {
      return {
        id: `rec-now-${Date.now()}`,
        type: 'right_now',
        title: 'All priorities are clear',
        message: 'You have cleared all key priorities for today. Take a cognitive break or start a low-pressure review.',
        actionLabel: 'Plan Ahead',
      };
    }

    if (priorityTask.priority === 'urgent') {
      return {
        id: `rec-now-${Date.now()}`,
        type: 'right_now',
        title: 'Immediate Focus Recommendation',
        message: `Your top deadline is "${priorityTask.title}". Finishing this 20-minute submission eliminates your highest pressure point.`,
        context: `Deadline: ${priorityTask.deadline || 'Today'} · Est. time: ${priorityTask.estimatedTime || '20m'}`,
        recommendedTaskId: priorityTask.id,
        actionLabel: 'Start Focus Window',
        secondaryActionLabel: 'View Task Details',
      };
    }

    return {
      id: `rec-now-${Date.now()}`,
      type: 'right_now',
      title: 'Current Recommended Priority',
      message: `Work on "${priorityTask.title}" for your next focus session. Your schedule is clear until 6:00 PM.`,
      context: `Category: ${priorityTask.category} · Est: ${priorityTask.estimatedTime || '45m'}`,
      recommendedTaskId: priorityTask.id,
      actionLabel: 'Start Focus Window',
      secondaryActionLabel: 'Pick Next Task',
    };
  },

  /**
   * Generates workload reduction plan on exhaustion
   */
  getExhaustionReductionPlan(tasks: Task[]): AIRecommendation {
    const nonEssentialTasks = tasks.filter(
      (t) => !t.isCompleted && (t.priority === 'low' || t.priority === 'medium')
    );

    const tasksToMove = nonEssentialTasks.slice(0, 3);
    const taskNames = tasksToMove.map((t) => t.title);

    return {
      id: `rec-exhaustion-${Date.now()}`,
      type: 'exhaustion_reduction',
      title: 'Workload Easing Mode',
      message: "I'll reduce today's workload. You currently have non-essential tasks that can be safely rescheduled. Want me to move them to Thursday?",
      context: taskNames.length > 0 
        ? `Identified for postponement: ${taskNames.join(', ')}`
        : 'All heavy tasks will be paused for this evening.',
      suggestedTasksToMove: tasksToMove.map((t) => t.id),
      actionLabel: 'Review & Move Tasks',
      secondaryActionLabel: "Keep Today's Schedule",
    };
  },

  /**
   * Comprehensive Multi-Modal Brain Dump Analyzer
   */
  analyzeMultiModalDump(
    text: string,
    voiceTranscript: string,
    screenshots: BrainDumpScreenshot[]
  ): BrainDumpAnalysisResult {
    const textItems = text.trim() ? textParser.parse(text) : [];
    const voiceItems = voiceTranscript.trim() ? voiceParser.parse(voiceTranscript) : [];
    const screenshotItems = screenshots.length > 0 ? screenshotParser.parse(screenshots) : [];

    // Deduplicate items with similar titles
    const allItems: ExtractedBrainItem[] = [];
    const seenTitles = new Set<string>();

    [...textItems, ...voiceItems, ...screenshotItems].forEach((item) => {
      const key = item.title.toLowerCase().trim();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        allItems.push(item);
      }
    });

    const tasksCount = allItems.filter((i) => i.type === 'task').length;
    const deadlinesCount = allItems.filter((i) => i.type === 'deadline').length;
    const remindersCount = allItems.filter((i) => i.type === 'reminder').length;
    const eventsCount = allItems.filter((i) => i.type === 'event').length;

    const summaryParts: string[] = [];
    if (tasksCount > 0) summaryParts.push(`${tasksCount} Task${tasksCount > 1 ? 's' : ''}`);
    if (deadlinesCount > 0) summaryParts.push(`${deadlinesCount} Deadline${deadlinesCount > 1 ? 's' : ''}`);
    if (remindersCount > 0) summaryParts.push(`${remindersCount} Reminder${remindersCount > 1 ? 's' : ''}`);
    if (eventsCount > 0) summaryParts.push(`${eventsCount} Event${eventsCount > 1 ? 's' : ''}`);

    const summary = `I found ${allItems.length} items (${summaryParts.join(', ')}).`;

    return {
      summary,
      items: allItems,
      counts: {
        tasks: tasksCount,
        deadlines: deadlinesCount,
        reminders: remindersCount,
        events: eventsCount,
      },
    };
  },

  /**
   * Legacy simple parser
   */
  organizeBrainDump(rawText: string, inputType: BrainDumpInputType = 'text'): Partial<BrainDumpItem> {
    const analysis = this.analyzeMultiModalDump(rawText, '', []);
    const tasks: ExtractedTaskPreview[] = analysis.items.map((i) => ({
      title: i.title,
      category: i.category,
      priority: i.priority,
      deadline: i.deadline,
      estimatedTime: '30m',
    }));

    return {
      rawText,
      inputType,
      status: 'organized',
      timestamp: 'Just now',
      extractedSummary: analysis.summary,
      extractedTasks: tasks,
      extractedBrainItems: analysis.items,
    };
  },

  /**
   * Generates step-by-step actionable subtasks for breaking down a large task
   */
  breakTaskIntoSubtasks(taskTitle: string): Subtask[] {
    const lower = taskTitle.toLowerCase();

    if (lower.includes('dbms') || lower.includes('database')) {
      return [
        { id: `sub-${Date.now()}-1`, title: 'Review B+ Tree indexing theory (Ch. 14)', isCompleted: false },
        { id: `sub-${Date.now()}-2`, title: 'Solve indexing questions 1 to 4', isCompleted: false },
        { id: `sub-${Date.now()}-3`, title: 'Draft SQL query optimization cost analysis', isCompleted: false },
        { id: `sub-${Date.now()}-4`, title: 'Compile final PDF submission', isCompleted: false },
      ];
    }

    if (lower.includes('dsa') || lower.includes('algorithm')) {
      return [
        { id: `sub-${Date.now()}-1`, title: 'Clarify graph problem constraints & edge cases', isCompleted: false },
        { id: `sub-${Date.now()}-2`, title: 'Implement topological sort solution', isCompleted: false },
        { id: `sub-${Date.now()}-3`, title: 'Test edge cases & verify time complexity O(V+E)', isCompleted: false },
      ];
    }

    if (lower.includes('form') || lower.includes('submit')) {
      return [
        { id: `sub-${Date.now()}-1`, title: 'Verify group member registration details', isCompleted: false },
        { id: `sub-${Date.now()}-2`, title: 'Attach signed faculty confirmation PDF', isCompleted: false },
        { id: `sub-${Date.now()}-3`, title: 'Upload and confirm submission receipt', isCompleted: false },
      ];
    }

    return [
      { id: `sub-${Date.now()}-1`, title: `Outline prerequisites for "${taskTitle}"`, isCompleted: false },
      { id: `sub-${Date.now()}-2`, title: 'Execute primary 30-minute working block', isCompleted: false },
      { id: `sub-${Date.now()}-3`, title: 'Review completion and file away notes', isCompleted: false },
    ];
  },
};
