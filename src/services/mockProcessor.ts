import {
  ExtractedBrainItem,
  BrainDumpAttachment,
  BrainDumpAnalysisResult,
  BrainDumpSource,
  TaskCategory,
  Priority,
} from '@/types';

/**
 * Deterministic Mock Processor for Brain Dump.
 * Parses natural, messy text, voice transcripts, and screenshot attachments
 * without calling any external AI API.
 */
export const mockProcessor = {
  /**
   * Main processing pipeline
   */
  process(
    text: string,
    voiceTranscript: string,
    attachments: BrainDumpAttachment[] = []
  ): BrainDumpAnalysisResult {
    const rawInputs: { content: string; source: BrainDumpSource; label: string }[] = [];

    if (text.trim()) {
      rawInputs.push({ content: text.trim(), source: 'text', label: 'Text thought' });
    }

    if (voiceTranscript.trim()) {
      rawInputs.push({ content: voiceTranscript.trim(), source: 'voice', label: 'Voice dictation' });
    }

    const items: ExtractedBrainItem[] = [];
    const seenTitles = new Set<string>();

    // 1. Parse text & voice clauses
    rawInputs.forEach((input) => {
      const extracted = this.extractFromText(input.content, input.source, input.label);
      extracted.forEach((item) => {
        const key = item.title.toLowerCase().trim();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          items.push(item);
        }
      });
    });

    // 2. Parse attachments
    if (attachments.length > 0) {
      const attachmentItems = this.extractFromAttachments(attachments);
      attachmentItems.forEach((item) => {
        const key = item.title.toLowerCase().trim();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          items.push(item);
        }
      });
    }

    // 3. If no items extracted but there is text, create a fallback task
    if (items.length === 0 && (text.trim() || voiceTranscript.trim())) {
      const fallbackText = (text.trim() || voiceTranscript.trim());
      items.push({
        id: `ext-${Date.now()}-fallback`,
        title: fallbackText.length > 60 ? fallbackText.slice(0, 57) + '...' : fallbackText,
        type: 'task',
        category: 'Personal',
        priority: 'medium',
        deadline: 'Not specified',
        notes: fallbackText,
        sourceType: text.trim() ? 'text' : 'voice',
        sourceLabel: text.trim() ? 'Text thought' : 'Voice dictation',
        selected: true,
      });
    }

    // 4. Calculate counts
    const tasksCount = items.filter((i) => i.type === 'task' || i.type === 'routine').length;
    const deadlinesCount = items.filter((i) => i.type === 'deadline').length;
    const remindersCount = items.filter((i) => i.type === 'reminder').length;
    const eventsCount = items.filter((i) => i.type === 'event').length;

    const summaryParts: string[] = [];
    if (tasksCount > 0) summaryParts.push(`${tasksCount} task${tasksCount > 1 ? 's' : ''}`);
    if (deadlinesCount > 0) summaryParts.push(`${deadlinesCount} deadline${deadlinesCount > 1 ? 's' : ''}`);
    if (remindersCount > 0) summaryParts.push(`${remindersCount} reminder${remindersCount > 1 ? 's' : ''}`);
    if (eventsCount > 0) summaryParts.push(`${eventsCount} event${eventsCount > 1 ? 's' : ''}`);

    const summary = summaryParts.length > 0
      ? `Found ${items.length} items (${summaryParts.join(', ')}).`
      : `Extracted ${items.length} items ready for review.`;

    return {
      summary,
      items,
      counts: {
        tasks: tasksCount,
        deadlines: deadlinesCount,
        reminders: remindersCount,
        events: eventsCount,
      },
    };
  },

  /**
   * Split messy paragraphs into candidate clauses
   */
  splitClauses(raw: string): string[] {
    return raw
      .split(/\r?\n|;|\band\b|\balso\b|\bthen\b|\bplus\b|\bneed to\b|\bhave to\b|\bshould\b|,/i)
      .map((c) => c.trim())
      .filter((c) => c.length > 2);
  },

  /**
   * Extract items from natural language text
   */
  extractFromText(
    content: string,
    sourceType: BrainDumpSource,
    sourceLabel: string
  ): ExtractedBrainItem[] {
    const items: ExtractedBrainItem[] = [];
    const clauses = this.splitClauses(content);

    // Track matched themes so we don't duplicate for broad keywords
    const matchedThemes = new Set<string>();

    clauses.forEach((clause, idx) => {
      const lower = clause.toLowerCase();
      const deadline = this.extractDeadline(lower);

      // Check DBMS / Database
      if ((lower.includes('dbms') || lower.includes('database')) && !matchedThemes.has('dbms')) {
        matchedThemes.add('dbms');
        items.push({
          id: `ext-${Date.now()}-${idx}-dbms`,
          title: 'Finish DBMS',
          type: 'deadline',
          category: 'Academics',
          priority: 'high',
          deadline: deadline || 'Tomorrow',
          notes: 'Database assignments and query cost analysis.',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // Check Buy Shampoo / Essentials
      if (
        (lower.includes('shampoo') || lower.includes('buy') || lower.includes('groceries') || lower.includes('toiletries')) &&
        !matchedThemes.has('shampoo')
      ) {
        matchedThemes.add('shampoo');
        const itemName = lower.includes('shampoo') ? 'Buy shampoo' : `Buy ${clause.replace(/^(buy|get|purchase)\s+/i, '').trim() || 'essentials'}`;
        items.push({
          id: `ext-${Date.now()}-${idx}-buy`,
          title: itemName,
          type: 'task',
          category: 'Personal',
          priority: 'low',
          deadline: deadline || 'Today',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // Check Call Mom / Call Dad / Phone
      if (
        (lower.includes('call mom') || lower.includes('call dad') || lower.includes('call') || lower.includes('phone mom')) &&
        !matchedThemes.has('call_mom')
      ) {
        matchedThemes.add('call_mom');
        items.push({
          id: `ext-${Date.now()}-${idx}-call`,
          title: lower.includes('dad') ? 'Call Dad' : 'Call Mom',
          type: 'reminder',
          category: 'Personal',
          priority: 'medium',
          deadline: deadline || 'Not specified',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // Check DSA / LeetCode / Algorithms
      if (
        (lower.includes('dsa') || lower.includes('leetcode') || lower.includes('graph') || lower.includes('algorithm')) &&
        !matchedThemes.has('dsa')
      ) {
        matchedThemes.add('dsa');
        items.push({
          id: `ext-${Date.now()}-${idx}-dsa`,
          title: 'Start DSA',
          type: 'task',
          category: 'Academics',
          priority: 'medium',
          deadline: deadline || 'This weekend',
          notes: 'Practice problem sets and data structures.',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // Check Gym / Workout / Fitness
      if (
        (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise') || lower.includes('running')) &&
        !matchedThemes.has('gym')
      ) {
        matchedThemes.add('gym');
        items.push({
          id: `ext-${Date.now()}-${idx}-gym`,
          title: 'Gym',
          type: 'routine',
          category: 'Health',
          priority: 'medium',
          deadline: deadline || 'Today · 6:00 PM',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // Check Form / College Declaration / Admin
      if (
        (lower.includes('form') || lower.includes('declaration') || lower.includes('portal') || lower.includes('fee')) &&
        !matchedThemes.has('form')
      ) {
        matchedThemes.add('form');
        items.push({
          id: `ext-${Date.now()}-${idx}-form`,
          title: 'Submit project declaration form',
          type: 'deadline',
          category: 'Admin',
          priority: 'urgent',
          deadline: deadline || 'Today · 5:00 PM',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // Check Java / Project / Repository
      if (
        (lower.includes('java') || lower.includes('project') || lower.includes('repo') || lower.includes('coding')) &&
        !matchedThemes.has('project')
      ) {
        matchedThemes.add('project');
        items.push({
          id: `ext-${Date.now()}-${idx}-proj`,
          title: 'Java project architecture & setup',
          type: 'task',
          category: 'Projects',
          priority: 'high',
          deadline: deadline || 'Thursday',
          sourceType,
          sourceLabel,
          selected: true,
        });
        return;
      }

      // If clause contains a meaningful action phrase, create a structured item
      if (clause.length >= 5 && !['i think', 'maybe', 'just', 'i have', 'i need to', 'what else'].includes(lower)) {
        const cleanTitle = clause.charAt(0).toUpperCase() + clause.slice(1);
        items.push({
          id: `ext-${Date.now()}-${idx}-gen`,
          title: cleanTitle.length > 50 ? cleanTitle.slice(0, 47) + '...' : cleanTitle,
          type: deadline ? 'deadline' : 'task',
          category: this.inferCategory(lower),
          priority: this.inferPriority(lower),
          deadline: deadline || 'Not specified',
          sourceType,
          sourceLabel,
          selected: true,
        });
      }
    });

    return items;
  },

  /**
   * Extract items from attached screenshots & images
   */
  extractFromAttachments(attachments: BrainDumpAttachment[]): ExtractedBrainItem[] {
    const items: ExtractedBrainItem[] = [];

    attachments.forEach((shot) => {
      const type = shot.type?.toLowerCase() || '';
      const name = shot.name?.toLowerCase() || 'attachment';

      if (name.includes('dbms_assignment') || name.includes('assignment_2') || type.includes('assignment')) {
        items.push(
          {
            id: `ext-shot-${shot.id}-goal`,
            title: 'Submit DBMS Assignment 2',
            type: 'deadline',
            category: 'Academics',
            priority: 'urgent',
            deadline: '25 August · 11:59 PM',
            location: 'Google Classroom',
            notes: 'Requirements: ER Diagram & SQL Queries. Late submissions lose 20% marks.',
            dependencies: ['ER Diagram and SQL Queries must be completed before submission'],
            confidence: 0.96,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-sub1`,
            title: 'Create ER Diagram for University Schema',
            type: 'task',
            category: 'Academics',
            priority: 'high',
            deadline: '24 August',
            notes: 'DBMS Assignment 2 Requirement 1',
            confidence: 0.95,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-sub2`,
            title: 'Complete SQL Queries (Aggregation & Indexing)',
            type: 'task',
            category: 'Academics',
            priority: 'high',
            deadline: '25 August',
            notes: 'DBMS Assignment 2 Requirement 2',
            confidence: 0.95,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-sub3`,
            title: 'Upload final submission to Google Classroom',
            type: 'task',
            category: 'Academics',
            priority: 'medium',
            deadline: '25 August · 11:59 PM',
            location: 'Google Classroom',
            dependencies: ['Complete ER diagram & SQL queries first'],
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          }
        );
      } else if (name.includes('whatsapp') || name.includes('project_meeting') || type.includes('whatsapp')) {
        items.push({
          id: `ext-shot-${shot.id}-meet`,
          title: 'Capstone Project Review Meeting',
          type: 'event',
          category: 'Projects',
          priority: 'high',
          deadline: 'Tomorrow · 4:00 PM',
          timeSlot: '16:00 - 17:00',
          location: 'Lab 3',
          people: ['Alex', 'Prof. Sharma'],
          notes: 'Bring updated architecture diagrams to Lab 3.',
          confidence: 0.95,
          needsClarification: false,
          sourceType: 'image',
          sourceLabel: shot.name,
          selected: true,
        });
      } else if (name.includes('timetable') || type.includes('timetable')) {
        items.push(
          {
            id: `ext-shot-${shot.id}-tt1`,
            title: 'Operating Systems Lecture',
            type: 'routine',
            category: 'Academics',
            priority: 'medium',
            day: 'Mon',
            timeSlot: '10:00 - 11:30',
            location: 'Room 201',
            notes: 'Weekly class schedule',
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-tt2`,
            title: 'Database Systems Lab',
            type: 'routine',
            category: 'Academics',
            priority: 'medium',
            day: 'Wed',
            timeSlot: '14:00 - 16:00',
            location: 'Lab 4',
            notes: 'Weekly lab practicals',
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-tt3`,
            title: 'Computer Networks Class',
            type: 'routine',
            category: 'Academics',
            priority: 'medium',
            day: 'Thu',
            timeSlot: '11:30 - 13:00',
            location: 'Room 304',
            notes: 'Weekly lecture',
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-tt4`,
            title: 'Algorithms Tutorial Session',
            type: 'routine',
            category: 'Academics',
            priority: 'low',
            day: 'Fri',
            timeSlot: '09:00 - 10:30',
            location: 'Hall B',
            notes: 'Problem solving tutorial',
            confidence: 0.93,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          }
        );
      } else if (name.includes('hackathon') || name.includes('event') || type.includes('event')) {
        items.push(
          {
            id: `ext-shot-${shot.id}-reg`,
            title: 'Register Team for Campus AI Buildathon',
            type: 'deadline',
            category: 'Projects',
            priority: 'urgent',
            deadline: 'Friday · 5:00 PM',
            notes: 'Registration deadline for AI agent challenge.',
            confidence: 0.96,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-hack`,
            title: 'Campus AI Buildathon 2026',
            type: 'event',
            category: 'Projects',
            priority: 'high',
            deadline: 'Saturday · 10:00 AM',
            timeSlot: '10:00 - 18:00',
            location: 'Main Auditorium B',
            people: ['Tech Innovation Club'],
            notes: 'Full day AI buildathon event.',
            confidence: 0.95,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          }
        );
      } else if (name.includes('multi_deadline') || name.includes('syllabus') || type.includes('syllabus')) {
        items.push(
          {
            id: `ext-shot-${shot.id}-m1`,
            title: 'Milestone 1: Problem Statement & Literature Review',
            type: 'deadline',
            category: 'Projects',
            priority: 'high',
            deadline: '15 September',
            notes: 'Project deliverable 1',
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-m2`,
            title: 'Milestone 2: Database Schema & API Implementation',
            type: 'deadline',
            category: 'Projects',
            priority: 'high',
            deadline: '05 October',
            dependencies: ['Milestone 1 approval required'],
            notes: 'Project deliverable 2',
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-m3`,
            title: 'Milestone 3: UI Frontend & System Integration',
            type: 'deadline',
            category: 'Projects',
            priority: 'high',
            deadline: '24 October',
            dependencies: ['Backend API from Milestone 2'],
            notes: 'Project deliverable 3',
            confidence: 0.94,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          },
          {
            id: `ext-shot-${shot.id}-m4`,
            title: 'Final Project Defense & Live Demo',
            type: 'event',
            category: 'Projects',
            priority: 'urgent',
            deadline: '10 November · 2:00 PM',
            location: 'Seminar Hall',
            notes: 'Final presentation and evaluation.',
            confidence: 0.92,
            needsClarification: false,
            sourceType: 'image',
            sourceLabel: shot.name,
            selected: true,
          }
        );
      } else if (name.includes('blurry') || name.includes('ambiguous') || type.includes('ambiguous')) {
        items.push({
          id: `ext-shot-${shot.id}-unclear`,
          title: 'Submit Exam Paper Re-Evaluation Form & Fee',
          type: 'task',
          category: 'Admin',
          priority: 'medium',
          deadline: 'Friday (Date Unclear)',
          notes: 'Notice is partially torn. Contact administration to confirm fee amount and room allocation.',
          confidence: 0.48,
          needsClarification: true,
          clarificationNote:
            'The screenshot is partially cropped. Deadline date is torn and faculty contact name is blurry.',
          sourceType: 'image',
          sourceLabel: shot.name,
          selected: true,
        });
      } else {
        items.push({
          id: `ext-shot-${shot.id}-gen`,
          title: `Action item from ${shot.name}`,
          type: 'task',
          category: 'Admin',
          priority: 'medium',
          deadline: 'This week',
          notes: shot.extractedText || `Extracted from ${shot.name}`,
          confidence: 0.8,
          needsClarification: false,
          sourceType: 'image',
          sourceLabel: shot.name,
          selected: true,
        });
      }
    });

    return items;
  },

  /**
   * Helper: Extract date/deadline from text
   */
  extractDeadline(text: string): string | undefined {
    if (text.includes('tomorrow')) return 'Tomorrow';
    if (text.includes('today')) return 'Today';
    if (text.includes('tonight')) return 'Tonight · 9:00 PM';
    if (text.includes('this weekend') || text.includes('weekend')) return 'This weekend';
    if (text.includes('next week')) return 'Next week';
    if (text.includes('monday')) return 'Monday';
    if (text.includes('tuesday')) return 'Tuesday';
    if (text.includes('wednesday')) return 'Wednesday';
    if (text.includes('thursday')) return 'Thursday';
    if (text.includes('friday')) return 'Friday';
    if (text.includes('saturday')) return 'Saturday';
    if (text.includes('sunday')) return 'Sunday';
    if (text.includes('at 6') || text.includes('6pm') || text.includes('six')) return 'Today · 6:00 PM';
    if (text.includes('at 5') || text.includes('5pm') || text.includes('five')) return 'Today · 5:00 PM';
    return undefined;
  },

  /**
   * Helper: Infer category from keywords
   */
  inferCategory(text: string): TaskCategory {
    if (text.includes('gym') || text.includes('water') || text.includes('sleep') || text.includes('walk') || text.includes('health')) {
      return 'Health';
    }
    if (text.includes('code') || text.includes('build') || text.includes('app') || text.includes('project') || text.includes('git')) {
      return 'Projects';
    }
    if (text.includes('form') || text.includes('submit') || text.includes('fee') || text.includes('register') || text.includes('portal')) {
      return 'Admin';
    }
    if (text.includes('dbms') || text.includes('dsa') || text.includes('exam') || text.includes('study') || text.includes('class') || text.includes('lab') || text.includes('lecture')) {
      return 'Academics';
    }
    return 'Personal';
  },

  /**
   * Helper: Infer priority from keywords
   */
  inferPriority(text: string): Priority {
    if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) return 'urgent';
    if (text.includes('important') || text.includes('must') || text.includes('tomorrow')) return 'high';
    if (text.includes('maybe') || text.includes('eventually') || text.includes('later')) return 'low';
    return 'medium';
  },
};
