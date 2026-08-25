-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR GETDONE // PERSONAL AI COMMAND CENTER
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Scholar',
  role_title TEXT DEFAULT 'Student & Creator',
  assistant_tone TEXT DEFAULT 'Calm & Direct',
  daily_focus_limit_hours NUMERIC DEFAULT 6,
  morning_briefing_time TEXT DEFAULT '08:30 AM',
  auto_workload_easing BOOLEAN DEFAULT true,
  calendar_sync_enabled BOOLEAN DEFAULT false,
  voice_input_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Academics',
  priority TEXT DEFAULT 'medium',
  estimated_time TEXT,
  estimated_minutes INTEGER,
  deadline TEXT,
  scheduled_day TEXT,
  scheduled_time TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_priority_today BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Weekly Schedule Blocks Table
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Academics',
  priority TEXT,
  is_ai_recommended BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Brain Dumps Table
CREATE TABLE IF NOT EXISTS public.brain_dumps (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  input_type TEXT DEFAULT 'text',
  timestamp TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  source TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  extracted_summary TEXT,
  extracted_tasks JSONB DEFAULT '[]'::jsonb,
  extracted_schedule JSONB DEFAULT '[]'::jsonb,
  extracted_brain_items JSONB DEFAULT '[]'::jsonb,
  extracted_items JSONB DEFAULT '[]'::jsonb,
  accepted_item_ids TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;

-- 7. RLS Security Policies (User-isolated access)
CREATE POLICY "Users can view and manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view and manage their own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and manage their own schedule blocks"
  ON public.schedule_blocks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and manage their own brain dumps"
  ON public.brain_dumps FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Enable Realtime Replication for Real-Time Syncing
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_dumps;
