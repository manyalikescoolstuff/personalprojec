'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  Calendar,
  X,
  ExternalLink,
  Tag,
  Rocket,
  ShieldAlert,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { CreativeIdea, IdeaMilestone } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { soundManager } from '@/lib/soundEffects';

interface BlueprintViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: CreativeIdea;
  onPlantAsTasks: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
}

export const BlueprintViewModal: React.FC<BlueprintViewModalProps> = ({
  isOpen,
  onClose,
  idea,
  onPlantAsTasks,
  onDeleteIdea,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'architecture' | 'features' | 'risks'>('roadmap');

  const bp = idea.blueprint;

  const handleCopyMarkdown = () => {
    if (!bp) return;
    soundManager.playClick();

    const md = `# ${idea.title}
*Category: ${idea.category} | Created: ${idea.createdAt}*

## 💡 Concept Summary
${bp.conceptSummary}

### Target Audience & Value
${bp.targetAudienceOrValue}

## 🚀 Recommended Tech Stack & Tools
${bp.techStackOrTools.map((t) => `- ${t}`).join('\n')}

## ✨ Key Differentiator Features
${bp.keyFeatures.map((f) => `- ${f}`).join('\n')}

## 🗺️ Phased Action Roadmap & Milestones
${bp.milestones
  .map(
    (m) => `### ${m.phase}: ${m.title} (${m.duration || 'Flexible'})
${m.tasks.map((t) => `- [ ] ${t}`).join('\n')}`
  )
  .join('\n\n')}

## ⚠️ Potential Bottlenecks & Mitigations
${bp.potentialBottlenecks.map((b) => `- ${b}`).join('\n')}

---
**🍃 Totoro's Forest AI Pro-Tip:**
"${bp.totoroProTip}"
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlant = () => {
    soundManager.playQuestComplete();
    onPlantAsTasks(idea.id);
  };

  const handleDelete = () => {
    if (confirm(`Delete idea "${idea.title}"?`)) {
      onDeleteIdea(idea.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={idea.title}
      subtitle={`🌱 ${idea.category} · Created ${idea.createdAt} · ${idea.stage.toUpperCase()}`}
      maxWidth="xl"
    >
      <div className="space-y-5 font-kalam">
        {/* Top Badges & Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-bold border border-[var(--accent-primary)]/30">
              {idea.category}
            </span>
            {idea.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] font-medium"
              >
                #{tag}
              </span>
            ))}
            {idea.isPlantedAsTasks && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Planted as Tasks</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 ghibli-btn shadow-sm"
              title="Copy markdown blueprint"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied MD!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-xl hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
              title="Delete Idea"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Concept Summary & Value Proposition */}
        {bp && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[var(--bg-surface-subtle)] to-teal-950/20 border border-[var(--border-subtle)] space-y-2">
            <h4 className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider flex items-center gap-1.5">
              <span>💡</span>
              <span>Concept & Target Value</span>
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              {bp.conceptSummary}
            </p>
            {bp.targetAudienceOrValue && (
              <p className="text-xs text-[var(--text-secondary)] font-medium pt-1 border-t border-[var(--border-subtle)]">
                <strong className="text-[var(--text-primary)]">Target Impact:</strong> {bp.targetAudienceOrValue}
              </p>
            )}
          </div>
        )}

        {/* View Mode Tabs */}
        {bp && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold border-b border-[var(--border-subtle)] pb-2">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1 rounded-xl transition-all shrink-0 ${
                activeTab === 'roadmap'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🗺️ Action Roadmap ({bp.milestones?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 rounded-xl transition-all shrink-0 ${
                activeTab === 'architecture'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🚀 Tech Stack & Tools ({bp.techStackOrTools?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1 rounded-xl transition-all shrink-0 ${
                activeTab === 'features'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              ✨ Key Features ({bp.keyFeatures?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('risks')}
              className={`px-3 py-1 rounded-xl transition-all shrink-0 ${
                activeTab === 'risks'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              ⚠️ Risks & Mitigations ({bp.potentialBottlenecks?.length || 0})
            </button>
          </div>
        )}

        {/* Tab Content Display */}
        {bp && (
          <div className="space-y-4 min-h-[220px]">
            {/* TAB 1: Phased Action Roadmap */}
            {activeTab === 'roadmap' && (
              <div className="space-y-3 animate-fadeIn">
                {bp.milestones?.map((milestone: IdeaMilestone, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs text-[var(--accent-primary)] font-bold">
                            {milestone.phase}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                            {milestone.title}
                          </h5>
                        </div>
                      </div>
                      {milestone.duration && (
                        <span className="px-2 py-0.5 rounded-lg bg-[var(--bg-surface-subtle)] text-[11px] text-[var(--text-secondary)] font-medium">
                          ⏱️ {milestone.duration}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 pl-8 border-l-2 border-[var(--border-subtle)] ml-3">
                      {milestone.tasks?.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-start gap-2 text-xs text-[var(--text-primary)] font-medium leading-relaxed"
                        >
                          <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Tech Stack & Architecture */}
            {activeTab === 'architecture' && (
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 animate-fadeIn">
                <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Recommended Architecture & Technologies
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {bp.techStackOrTools?.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-bold"
                    >
                      <Rocket className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Standout Creative Features */}
            {activeTab === 'features' && (
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 animate-fadeIn">
                <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Standout Features & Differentiators
                </h5>
                <div className="space-y-2">
                  {bp.keyFeatures?.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-primary)] font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Risks & Mitigations */}
            {activeTab === 'risks' && (
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 animate-fadeIn">
                <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Potential Bottlenecks & Solutions
                </h5>
                <div className="space-y-2">
                  {bp.potentialBottlenecks?.map((risk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs text-[var(--text-primary)] font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Totoro's Forest AI Pro-Tip */}
        {bp?.totoroProTip && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
            <span className="text-lg shrink-0">🍃</span>
            <div>
              <strong className="text-emerald-300 font-bold block mb-0.5">
                Totoro&apos;s Incubation Wisdom
              </strong>
              <p className="leading-relaxed font-medium">{bp.totoroProTip}</p>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <Button variant="subtle" size="sm" onClick={onClose}>
            Close
          </Button>

          {bp && (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePlant}
              className="gap-1.5 shadow-md font-bold"
            >
              <span>🌱</span>
              <span>{idea.isPlantedAsTasks ? 'Re-Plant into Acorn Tasks' : 'Plant into Acorn Tasks (1-Click)'}</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
