# 🌿 GetDone — Personal AI Command Center

<div align="center">

![GetDone Banner](/public/assets/ghibli/totoro_hero.jpg)

**A calm, intelligent, and biophilic personal command center powered by Google Gemini & Totoro AI.**  
*Engineered for CS students and developers to conquer cognitive overload, organize academic vaults, incubate creative blueprints, and execute daily priorities with zero friction.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.1-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Android_Optimized-57B957?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[✨ Features](#-core-features) • [🏛️ Architecture](#%EF%B8%8F-project-architecture) • [🚀 Getting Started](#-getting-started) • [📱 Mobile PWA](#-mobile--android-pwa-experience) • [💡 Philosophy](#-product-philosophy)

</div>

---

## 🍃 Product Philosophy

Traditional productivity apps force you through an exhausting mental loop:
$$\text{Remember} \longrightarrow \text{Organize} \longrightarrow \text{Prioritize} \longrightarrow \text{Schedule} \longrightarrow \text{Execute}$$

**GetDone transforms the workflow:**
$$\textbf{Dump} \longrightarrow \textbf{AI Understands} \longrightarrow \textbf{AI Organizes} \longrightarrow \textbf{AI Prioritizes} \longrightarrow \textbf{AI Guides Your Next Action}$$

Instead of drowning in lists, you dump your raw thoughts, lecture slides, or voice notes. **Totoro AI** digests the context, schedules your week, prompts for priority, and hands you **One Next Action**.

---

## ✨ Core Features

### 1. 🌲 Sanctuary Command Center (Home)
- **One Next Action Focus Card**: Highlights the single most important task right now, with countdown timers and energy badges.
- **Natural Language & Voice Command Bar**: Type or speak natural commands (*e.g., "Add DBMS lab assignment", "What should I do right now?", "I feel exhausted"*).
- **Interactive Totoro Emote Companion**: A living animated Totoro with emote cycles, ear twitches, breathing animations, and a dream thought-cloud.
- **Biophilic Aesthetic**: Ghibli-inspired starlit canopy, floating bioluminescent fireflies, and custom handwritten **Hangyaboly** typography.

---

### 2. 🚌 Multi-Modal Brain Dump (Catbus Engine)
- **🎙️ Voice Dictation**: Hands-free stream of consciousness audio recording transcribed and parsed in real time.
- **📸 Screenshot & Lecture Ingestion**: Upload whiteboard photos, homework problem sets, or slides for instant OCR extraction.
- **✨ Intelligent Entity Extraction**: Automatically extracts tasks, estimated minutes, deadlines, and schedule blocks with interactive diff previews before applying.

---

### 3. 📚 Totoro's Academic Library & Subject Vault
- **Academic Degree Blueprint**: Tracks university major, current semester, and CGPA targets.
- **Subject Vaults**: Dedicated workspaces for core subjects (*DBMS, Data Structures, Operating Systems, Computer Networks*).
- **Multi-Format Storage**:
  - 📁 **Organized Course Folders**: Categorize materials by units and exam modules.
  - 📄 **Slide PDFs & Documents**: Attach lecture slides and reference papers.
  - 🖼️ **Diagrams & Whiteboards**: Full-size lightbox image previews.
  - 📝 **Formula Cheatsheets**: Markdown notes for quick active recall.
  - 🔗 **Portal & Repo Links**: Direct attachments to GitHub repos and university portals.
- **🧠 Totoro Avatar Brain Integration**: Click Totoro's brain avatar in his dream cloud to teleport directly to the Library.

---

### 4. 🌱 Creative Sprout Incubator & Blueprint Forge
- **Raw Thought Incubation**: Feed raw project sparks or hackathon ideas in English or Hinglish.
- **4 Incubation Modes**:
  - 🚀 **Full Technical Blueprint**: Architecture, modular breakdown, tech stack choices, and phased milestones.
  - 📋 **Action Roadmap**: Concrete execution steps with estimated timelines.
  - 💡 **Feature Expander**: Unconventional creative twists and differentiator features.
  - 📝 **Pitch Outline**: Problem-solution fit, target audience value, and key deliverables.
- **🌳 1-Click "Plant as Acorn Tasks"**: Converts generated milestones into live backlog tasks tagged with priority and project phases.
- **Sprout Vault**: Filterable gallery to track ideas from `🌱 Sprouts` &rarr; `🌿 Blueprints` &rarr; `🌳 Planted Projects`.

---

### 5. 🎯 Smart Priority Prompting
- **Intelligent Urgency Detection**: Understands priority keywords (*urgent, critical, aaj hi, zaroori, high priority, low*).
- **Proactive Priority Confirmation**: When a task is created without explicit urgency, Totoro prompts:
  - 🌰 **Urgent** — *Immediate focus today*
  - 🍃 **High** — *Key deliverable today*
  - 🌱 **Medium** — *Standard priority*
  - ⭐ **Low** — *Casual / backlog*
- **Tactile Quick Add Modal**: Interactive visual pill selectors with validation.

---

### 6. 📱 Mobile & Android PWA Experience
- **📲 Standalone PWA**: Web App Manifest configured for Android full-screen display (`portrait`, `#132A13` theme).
- **⚡ Service Worker Offline Caching**: Pre-caches app shell, fonts, and stylesheets with offline indicator banners.
- **📳 Android Haptic Feedback Engine**: Tactile vibrations via the Web Vibration API (`haptics.light()`, `haptics.medium()`, `haptics.success()`).
- **🎛️ Thumb-Friendly Quick-Capture Dock**: Ergonomic mobile FAB for 1-tap Voice Dump, Camera OCR, Priority Task creation, and Idea Sprouting.
- **🚀 Android App Shortcuts**: Long-press app icon on home screen to launch directly into Voice Dump, Incubator, Library, or Tasks.

---

## 🏛️ Project Architecture

The codebase is organized cleanly into modular frontend, backend, and shared domain layers:

```
personalproject/
├── public/
│   ├── assets/ghibli/         # Atmospheric nature & Totoro background art
│   ├── fonts/                 # Hangyaboly handwritten custom font
│   ├── icons/                 # PWA vector SVGs & maskable Android icons
│   ├── manifest.json          # Web App Manifest & Android Shortcuts
│   └── sw.js                  # Service Worker offline caching engine
├── src/
│   ├── app/                   # Next.js 16 App Router
│   │   ├── api/
│   │   │   ├── ai/chat/       # Live Totoro AI Conversational Brain
│   │   │   ├── ai/incubate/   # Creative Idea Blueprint & Roadmap Engine
│   │   │   ├── ai/organize/   # Multi-modal Brain Dump Parser
│   │   │   ├── vision/        # OCR & Image Recognition Endpoint
│   │   │   └── voice/         # Audio Speech-to-Text Transcription
│   │   ├── globals.css        # Ghibli theme tokens, animations & safe areas
│   │   ├── layout.tsx         # PWA Viewport, Metadata & Root Providers
│   │   └── page.tsx           # Command Center Screen Router & Modals
│   ├── backend/
│   │   ├── services/          # AI assistants, Mock data & Vision processors
│   │   └── supabase/          # Database client, auth & persistence schema
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── ambient/       # Glowing bioluminescent fireflies
│   │   │   ├── command/       # CommandBar, AIResponseCard, FocusTimer
│   │   │   ├── companion/     # Animated Totoro character & Emotes
│   │   │   ├── incubator/     # BlueprintViewModal & Sprout cards
│   │   │   ├── layout/        # Sidebar, AppHeader, BottomNav
│   │   │   ├── library/       # SubjectVaultModal, CourseModal
│   │   │   ├── mobile/        # MobileQuickCaptureDock (Thumb FAB)
│   │   │   ├── pwa/           # PwaProvider & Android Install Prompt
│   │   │   ├── tasks/         # TaskRow, TaskDetailModal, QuickAddTaskModal
│   │   │   └── ui/            # Buttons, Cards, Inputs, Modals, Badges
│   │   ├── context/           # AppContext (Central State & Persistence)
│   │   └── screens/           # Home, Incubator, Library, BrainDump, Plan, Tasks
│   └── shared/
│       ├── lib/               # Haptics engine, Sound effect synthesis
│       └── types/             # Domain TypeScript interfaces & models
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tech Stack & Integrations

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.1 (Turbopack) | Fast React 19 server/client runtime with App Router |
| **Styling** | Tailwind CSS 4.0 + Vanilla CSS | Custom Ghibli color tokens, glassmorphism, responsive utilities |
| **AI Intelligence** | Google Gemini 2.0 Flash | Structured JSON generation, Hinglish comprehension, multimodal vision |
| **PWA & Offline** | Service Workers + Web Manifest | Offline app shell caching, Android standalone display & install prompt |
| **Audio & Haptics** | Web Audio API + Web Vibration | Custom organic chime synthesis & tactile mobile vibration feedback |
| **Icons & Media** | Lucide React + Canvas Confetti | Crisp SVG iconography & celebratory quest animations |
| **Database** | Cloud Firestore / Supabase | Optional cloud synchronization with local storage fallback |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **pnpm**
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/manyalikescoolstuff/personalprojec.git
cd personalproject

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase / Firebase Sync
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
# Windows PowerShell
npm.cmd run dev

# macOS / Linux
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on desktop, or access via your local IP `http://192.168.x.x:3000` on Android Chrome!

### 5. Production Build
```bash
npm.cmd run build
npm.cmd start
```

---

## 📱 Testing on Android Mobile

1. Make sure your phone is connected to the same Wi-Fi network as your development machine.
2. Open Chrome on your Android phone and navigate to `http://<YOUR_LOCAL_IP>:3000`.
3. Tap the **"📲 Add GetDone to Home Screen"** banner (or use the Chrome menu &rarr; *Add to Home screen*).
4. Launch GetDone as a standalone native-feeling Android app with full offline support and tactile haptics!

---

## 🤝 Personal Use & Privacy

> [!NOTE]  
> **GetDone** is crafted as a personal AI command center for developer productivity and academic management. All voice dumps, blueprints, and vault notes remain strictly private and client-controlled.

---

<div align="center">
Made with 💚, coffee, and Ghibli magic by <b>Manya</b>
</div>
