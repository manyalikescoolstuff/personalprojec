'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Rocket,
  Layers,
  FileText,
  Mic,
  MicOff,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Plus,
  Compass,
  Zap,
  Tag,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CreativeIdea, IdeaCategory, EnhancementMode, IdeaStage } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BlueprintViewModal } from '@/frontend/components/incubator/BlueprintViewModal';
import { soundManager } from '@/lib/soundEffects';

const CATEGORIES: IdeaCategory[] = [
  'Tech & Code',
  'College & Academic',
  'Creative & Design',
  'Startup & Business',
  'Writing & Content',
  'Personal Experiment',
];

const MODES: { id: EnhancementMode; label: string; icon: string; desc: string }[] = [
  { id: 'blueprint', label: 'Full Blueprint', icon: '🚀', desc: 'Architecture, stack & milestones' },
  { id: 'action_plan', label: 'Action Roadmap', icon: '📋', desc: 'Phased execution steps' },
  { id: 'brainstorm', label: 'Feature Expander', icon: '💡', desc: 'Standout creative twists' },
  { id: 'pitch_outline', label: 'Pitch Outline', icon: '📝', desc: 'Problem, solution & impact' },
];

const INSPIRATION_PROMPTS = [
  'An AI agent that creates flashcards from lecture PDFs with spaced repetition quizzes',
  'A smart desk plant IoT companion that glows Ghibli colors based on soil moisture',
  'A peer-to-peer textbook & notes rental marketplace for my college campus',
  'A voice-activated daily journaling app that turns spoken memories into illustrated storybooks',
];

export const IncubatorScreen: React.FC = () => {
  const { ideas, addIdea, updateIdea, deleteIdea, plantIdeaAsTasks, incubateIdeaWithAI } = useApp();

  const [rawIdeaText, setRawIdeaText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory>('Tech & Code');
  const [selectedMode, setSelectedMode] = useState<EnhancementMode>('blueprint');

  const [isIncubating, setIsIncubating] = useState(false);
  const [activeBlueprintIdea, setActiveBlueprintIdea] = useState<CreativeIdea | null>(null);
  const [selectedModalIdea, setSelectedModalIdea] = useState<CreativeIdea | null>(null);

  const [stageFilter, setStageFilter] = useState<IdeaStage | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IdeaCategory | 'all'>('all');
  const [plantedToast, setPlantedToast] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setRawIdeaText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      soundManager.playClick();
    } else {
      soundManager.playSparkle();
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleIncubate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawIdeaText.trim() || isIncubating) return;

    soundManager.playSparkle();
    setIsIncubating(true);

    try {
      const newIdea = await incubateIdeaWithAI(rawIdeaText, selectedCategory, selectedMode);
      setActiveBlueprintIdea(newIdea);
      setRawIdeaText('');
      soundManager.playSuccess();
    } catch (err) {
      console.error('Incubation error:', err);
      alert('Could not incubate idea. Please ensure your Gemini API key is configured.');
    } finally {
      setIsIncubating(false);
    }
  };

  const handlePlant = (ideaId: string) => {
    const count = plantIdeaAsTasks(ideaId);
    soundManager.playQuestComplete();
    setPlantedToast(`🌱 Planted ${count} actionable milestone tasks into Acorn Tasks!`);
    setTimeout(() => setPlantedToast(null), 4000);

    // Refresh active blueprint state if it was the one planted
    if (activeBlueprintIdea && activeBlueprintIdea.id === ideaId) {
      setActiveBlueprintIdea((prev) => (prev ? { ...prev, isPlantedAsTasks: true, stage: 'planted' } : null));
    }
    if (selectedModalIdea && selectedModalIdea.id === ideaId) {
      setSelectedModalIdea((prev) => (prev ? { ...prev, isPlantedAsTasks: true, stage: 'planted' } : null));
    }
  };

  const filteredIdeas = ideas
    .filter((i) => (stageFilter === 'all' ? true : i.stage === stageFilter))
    .filter((i) => (categoryFilter === 'all' ? true : i.category === categoryFilter));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn select-none font-kalam">
      {/* Toast Notification */}
      {plantedToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{plantedToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-2xl shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Sprout Forge & Creative Lab</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] leading-tight">
            Creative Idea Incubator 🌱
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
            Turn spontaneous thoughts, hackathon concepts, and side-hustle sparks into complete technical blueprints, phased roadmaps, and 1-click actionable tasks.
          </p>
        </div>
      </section>

      {/* 1. Idea Generator & Incubation Canvas */}
      <Card className="p-5 sm:p-7 space-y-5 border-2 border-[var(--border-subtle)] shadow-xl relative">
        <form onSubmit={handleIncubate} className="space-y-5">
          {/* Top Label & Inspiration Carousel */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>💭</span>
              <span>Describe Your Raw Idea or Creative Concept</span>
            </label>

            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_#ef4444]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-400" />}
              <span>{isRecording ? 'Listening (Tap to Stop)...' : 'Voice Dump'}</span>
            </button>
          </div>

          {/* Large Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              required
              value={rawIdeaText}
              onChange={(e) => setRawIdeaText(e.target.value)}
              placeholder="Dump whatever is in your head... (e.g. 'An app that analyzes my DBMS queries and generates visual execution trees', or in Hinglish 'Ek aisa app jo daily study streaks ko gamify karde with Ghibli badges')"
              className="w-full bg-[var(--bg-surface-subtle)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-2xl p-4 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none transition-colors resize-none leading-relaxed font-medium placeholder-[var(--text-muted)]"
            />
          </div>

          {/* Quick Inspiration Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Need inspiration? Try clicking one:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawIdeaText(prompt)}
                  className="px-2.5 py-1 rounded-xl bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors text-left"
                >
                  💡 {prompt.length > 45 ? `${prompt.substring(0, 45)}...` : prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Enhancement Mode Selectors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-subtle)]">
            {/* Category Pills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Selectors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Incubation Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMode === mode.id
                        ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)] shadow-sm'
                        : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                      {mode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Incubation CTA */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isIncubating || !rawIdeaText.trim()}
              className="gap-2 shadow-xl font-bold text-sm px-6"
            >
              {isIncubating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Totoro is Incubating Your Idea...</span>
                </>
              ) : (
                <>
                  <span>🌱</span>
                  <span>Incubate with Totoro AI</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Active Incubated Blueprint Spotlight (Hero Card) */}
      {activeBlueprintIdea && activeBlueprintIdea.blueprint && (
        <section className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 via-[var(--bg-card)] to-emerald-950/30 border-2 border-purple-500/40 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                  ✨ Newly Incubated Blueprint
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {activeBlueprintIdea.category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {activeBlueprintIdea.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePlant(activeBlueprintIdea.id)}
                className="gap-1.5 shadow-md font-bold"
              >
                <span>🌱</span>
                <span>
                  {activeBlueprintIdea.isPlantedAsTasks
                    ? 'Re-Plant into Tasks'
                    : 'Plant into Acorn Tasks (1-Click)'}
                </span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedModalIdea(activeBlueprintIdea)}
              >
                Full Inspection
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed">
            {activeBlueprintIdea.blueprint.conceptSummary}
          </p>

          {/* Quick Milestones Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {activeBlueprintIdea.blueprint.milestones?.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                  <span>{m.phase}</span>
                  {m.duration && <span className="text-[10px] opacity-75">{m.duration}</span>}
                </div>
                <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">{m.title}</h5>
                <span className="text-[11px] text-[var(--text-secondary)] block">
                  {m.tasks?.length || 0} Actionable tasks ready
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Sprout Vault (Idea Repository) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Sprout Vault</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                All captured sparks, blueprints, and planted projects ({ideas.length})
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stage Filter */}
            <div className="flex items-center gap-1 bg-[var(--bg-surface-subtle)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-bold">
              {(['all', 'sprout', 'blueprint', 'planted'] as const).map((stage) => {
                const labelMap: Record<string, string> = {
                  all: `All (${ideas.length})`,
                  sprout: '🌱 Sprouts',
                  blueprint: '🌿 Blueprints',
                  planted: '🌳 Planted',
                };
                return (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      stageFilter === stage
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {labelMap[stage]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-2">
            <span className="text-3xl">🌱</span>
            <p className="text-base font-bold text-[var(--text-primary)]">No ideas in this filter</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Use the Incubator box above to plant your next creative project idea!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIdeas.map((idea) => {
              const hasBlueprint = Boolean(idea.blueprint);
              const milestoneCount = idea.blueprint?.milestones?.length || 0;

              return (
                <div
                  key={idea.id}
                  onClick={() => setSelectedModalIdea(idea)}
                  className="group relative p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/70 backdrop-blur-2xl shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-bold border border-[var(--accent-primary)]/30">
                          {idea.category}
                        </span>

                        {idea.isPlantedAsTasks && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Planted</span>
                          </span>
                        )}

                        <span className="text-[11px] text-[var(--text-muted)] font-medium">
                          {idea.createdAt}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${idea.title}"?`)) {
                            deleteIdea(idea.id);
                          }
                        }}
                        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                        title="Delete Idea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
                      {idea.title}
                    </h4>

                    <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed line-clamp-2">
                      {idea.blueprint ? idea.blueprint.conceptSummary : idea.rawThought}
                    </p>
                  </div>

                  {/* Tech stack pills or tags preview */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex flex-wrap gap-1">
                      {idea.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-subtle)] text-[10px] text-[var(--text-secondary)] font-bold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--accent-primary)] font-bold">
                      <span>
                        {hasBlueprint
                          ? `🗺️ ${milestoneCount} Phase Milestone Blueprint`
                          : '🌱 Raw Sprout Spark'}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Open Blueprint</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Full Blueprint View Modal */}
      {selectedModalIdea && (
        <BlueprintViewModal
          isOpen={Boolean(selectedModalIdea)}
          onClose={() => setSelectedModalIdea(null)}
          idea={selectedModalIdea}
          onPlantAsTasks={handlePlant}
          onDeleteIdea={deleteIdea}
        />
      )}
    </div>
  );
};
