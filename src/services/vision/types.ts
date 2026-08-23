import { ExtractedBrainItem, TaskCategory, Priority, ExtractedItemType, DayOfWeek } from '@/types';

export interface VisionImageInput {
  data: string; // base64 string or data URL
  mimeType?: string;
  name?: string;
}

export interface VisionAnalysisInput {
  images: VisionImageInput[];
  userContextText?: string;
}

export interface VisionRawExtractedItem {
  title: string;
  type: ExtractedItemType;
  category: TaskCategory;
  priority: Priority;
  deadline?: string;
  timeSlot?: string;
  day?: DayOfWeek;
  notes?: string;
  location?: string;
  people?: string[];
  dependencies?: string[];
  confidence?: number;
  needsClarification?: boolean;
  clarificationNote?: string;
}

export interface VisionRawResponse {
  summary: string;
  items: VisionRawExtractedItem[];
  confidenceOverall?: number;
  unclearOrAmbiguous?: boolean;
  clarificationReason?: string;
}

export interface VisionAnalysisResponse {
  configured: boolean;
  providerUsed: string;
  summary: string;
  items: ExtractedBrainItem[];
  confidence?: number;
  needsClarification?: boolean;
  clarificationNote?: string;
  errorMessage?: string;
  rawResponse?: string;
}

export interface VisionProvider {
  name: string;
  isConfigured(): boolean;
  analyze(input: VisionAnalysisInput): Promise<VisionAnalysisResponse>;
}

export const VISION_SYSTEM_PROMPT = `
You are the Vision Intelligence Engine for "GetDone", an intelligent personal productivity assistant.

Your task is to analyze user-provided images (such as college assignment notices, WhatsApp messages, university timetables, event flyers, emails, or handwritten notes) and user-provided context text.

Extract actionable information into a structured JSON response.

### GUIDELINES:
1. Identify all applicable elements:
   - Tasks & Goals (actionable items to be done)
   - Deadlines (specific due dates, dates and times)
   - Times & Schedules (start/end times, lecture slots)
   - Events (meetings, exams, seminars, labs)
   - Reminders (commitments, notifications to remember)
   - People & Organizers (professors, team members, senders)
   - Locations (rooms, labs, portals, links, buildings)
   - Dependencies (prerequisites that must be done before another item)
2. DO NOT invent information that is not in the image.
3. If an image is blurry, cropped, ambiguous, or lacks critical dates:
   - Set "confidenceOverall" to a lower number (e.g. 0.3 - 0.7).
   - Set "unclearOrAmbiguous" to true.
   - Set "clarificationReason" explaining specifically what is unclear.
   - For affected items, set "confidence" < 0.7 and "needsClarification": true with a "clarificationNote".
4. For Timetables:
   - Extract recurring classes/lectures as "event" or "routine" with "day" (Mon/Tue/Wed/Thu/Fri/Sat/Sun), "timeSlot", "location", and "title".
5. For Assignments/Notices:
   - Extract the overall goal as a task or deadline.
   - Extract individual deliverables/subtasks (e.g., ER Diagram, SQL queries, PDF submission).
   - Note dependencies (e.g., ER Diagram must be completed before submission).
6. For WhatsApp/Chat messages:
   - Extract events (e.g. project meeting), date/time, location, and reminders.
   - Do NOT create duplicate tasks for the same event.
7. Combine with user text intent:
   - If the user provided additional context text (e.g., "Please make sure I don't forget this"), incorporate their intent.

### STRICT JSON RESPONSE SCHEMA:
Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Short 1-2 sentence overview of what was identified in the image.",
  "confidenceOverall": 0.95,
  "unclearOrAmbiguous": false,
  "clarificationReason": null,
  "items": [
    {
      "title": "Clear concise actionable title",
      "type": "task" | "deadline" | "reminder" | "event" | "routine",
      "category": "Academics" | "Projects" | "Personal" | "Health" | "Admin",
      "priority": "urgent" | "high" | "medium" | "low",
      "deadline": "e.g. 25 August · 11:59 PM or Tomorrow · 4:00 PM or null",
      "timeSlot": "e.g. 14:00 - 16:00 or null",
      "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | null,
      "location": "e.g. Lab 3, Google Classroom, Room 304, or null",
      "people": ["e.g. Prof. Sharma"],
      "dependencies": ["e.g. ER Diagram required before submission"],
      "notes": "Relevant details from image",
      "confidence": 0.95,
      "needsClarification": false,
      "clarificationNote": null
    }
  ]
}
`;
