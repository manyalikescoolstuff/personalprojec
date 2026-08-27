'use client';

import React, { useState, useRef } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  ArrowLeft,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  FileCode,
  FileSpreadsheet,
  File,
  X,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { CourseInfo, CourseResource, CourseFolder, CourseResourceType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { soundManager } from '@/lib/soundEffects';

interface SubjectVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseInfo;
  onUpdateCourse: (id: string, updates: Partial<CourseInfo>) => void;
}

export const SubjectVaultModal: React.FC<SubjectVaultModalProps> = ({
  isOpen,
  onClose,
  course,
  onUpdateCourse,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<CourseResourceType | 'all'>('all');

  // Creation Sub-Modals / Drawer States
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('emerald');

  const [isWritingNote, setIsWritingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const [previewResource, setPreviewResource] = useState<CourseResource | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const folders = course.folders || [];
  const resources = course.resources || [];

  const currentFolder = folders.find((f) => f.id === currentFolderId) || null;

  // Filter items in current view
  const visibleFolders = currentFolderId
    ? [] // No nested sub-folders for simplicity
    : folders.filter(() => filterType === 'all' || filterType === 'folder');

  const visibleResources = resources
    .filter((r) => (currentFolderId ? r.folderId === currentFolderId : !r.folderId))
    .filter((r) => (filterType === 'all' ? true : r.type === filterType));

  // Handlers for Creating Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    soundManager.playClick();
    const newFolder: CourseFolder = {
      id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newFolderName.trim(),
      color: newFolderColor,
      createdAt: 'Just now',
    };

    const updatedFolders = [...folders, newFolder];
    onUpdateCourse(course.id, { folders: updatedFolders });

    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  // Handlers for File & Doc Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundManager.playSparkle();
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newResource: CourseResource = {
          id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: 'file',
          folderId: currentFolderId,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileUrl: reader.result as string,
          createdAt: 'Just now',
          tags: [file.name.split('.').pop()?.toUpperCase() || 'FILE'],
        };
        const updated = [...(course.resources || []), newResource];
        onUpdateCourse(course.id, { resources: updated });
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Handlers for Image / Diagram Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundManager.playSparkle();
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newResource: CourseResource = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: 'image',
          folderId: currentFolderId,
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileUrl: reader.result as string,
          createdAt: 'Just now',
          tags: ['Diagram', 'Image'],
        };
        const updated = [...(course.resources || []), newResource];
        onUpdateCourse(course.id, { resources: updated });
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Handlers for Text Note / Cheat Sheet
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    soundManager.playSparkle();
    const newResource: CourseResource = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: noteTitle.trim(),
      type: 'text',
      folderId: currentFolderId,
      textContent: noteContent.trim(),
      createdAt: 'Just now',
      tags: ['Notes', 'Cheat Sheet'],
    };

    const updated = [...(course.resources || []), newResource];
    onUpdateCourse(course.id, { resources: updated });

    setNoteTitle('');
    setNoteContent('');
    setIsWritingNote(false);
  };

  // Handlers for Resource Link
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    soundManager.playClick();
    const newResource: CourseResource = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: linkTitle.trim(),
      type: 'link',
      folderId: currentFolderId,
      fileUrl: linkUrl.trim(),
      createdAt: 'Just now',
      tags: ['Reference', 'Link'],
    };

    const updated = [...(course.resources || []), newResource];
    onUpdateCourse(course.id, { resources: updated });

    setLinkTitle('');
    setLinkUrl('');
    setIsAddingLink(false);
  };

  // Delete Resource Handler
  const handleDeleteResource = (id: string, name: string) => {
    if (confirm(`Delete "${name}" from this subject?`)) {
      const updated = resources.filter((r) => r.id !== id);
      onUpdateCourse(course.id, { resources: updated });
    }
  };

  // Delete Folder Handler
  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (confirm(`Delete folder "${folderName}" and all materials inside it?`)) {
      const updatedFolders = folders.filter((f) => f.id !== folderId);
      const updatedResources = resources.filter((r) => r.folderId !== folderId);
      onUpdateCourse(course.id, { folders: updatedFolders, resources: updatedResources });
      if (currentFolderId === folderId) {
        setCurrentFolderId(null);
      }
    }
  };

  // Helper for file type icons
  const renderResourceIcon = (resource: CourseResource) => {
    if (resource.type === 'image') {
      return <ImageIcon className="w-5 h-5 text-amber-400" />;
    }
    if (resource.type === 'text') {
      return <FileText className="w-5 h-5 text-emerald-400" />;
    }
    if (resource.type === 'link') {
      return <LinkIcon className="w-5 h-5 text-sky-400" />;
    }
    const ext = resource.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <File className="w-5 h-5 text-red-400" />;
    if (ext === 'py' || ext === 'ts' || ext === 'js' || ext === 'java' || ext === 'cpp')
      return <FileCode className="w-5 h-5 text-indigo-400" />;
    if (ext === 'xlsx' || ext === 'csv') return <FileSpreadsheet className="w-5 h-5 text-teal-400" />;
    return <File className="w-5 h-5 text-[var(--accent-primary)]" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${course.code} — ${course.name}`}
      subtitle={`${course.professor ? `Faculty: ${course.professor} · ` : ''}${course.semester || 'Sem 5'} · Subject Materials Vault`}
      maxWidth="xl"
    >
      <div className="space-y-5 font-kalam">
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* 1. Breadcrumbs & Top Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setCurrentFolderId(null)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all ${
                !currentFolderId
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🏠</span>
              <span>All Materials</span>
            </button>

            {currentFolder && (
              <>
                <span className="text-[var(--text-muted)]">/</span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                  <Folder className="w-3.5 h-3.5" />
                  <span>{currentFolder.name}</span>
                </span>
              </>
            )}
          </div>

          {/* Quick Add Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {!currentFolderId && (
              <button
                type="button"
                onClick={() => setIsCreatingFolder(true)}
                className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 ghibli-btn shadow-sm"
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Folder</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 ghibli-btn shadow-sm"
            >
              <File className="w-3.5 h-3.5 text-red-400" />
              <span>+ Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 ghibli-btn shadow-sm"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Image</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWritingNote(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 ghibli-btn shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>+ Note</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingLink(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-bold flex items-center gap-1.5 ghibli-btn shadow-sm"
            >
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Link</span>
            </button>
          </div>
        </div>

        {/* 2. Inline Creation Panels */}
        {/* A. Create Folder Inline */}
        {isCreatingFolder && (
          <form
            onSubmit={handleCreateFolder}
            className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border-2 border-amber-500/40 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Folder className="w-4 h-4" />
                <span>Create New Subject Folder</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Unit 2 — Normalization & Transactions"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-bold"
            />
            <div className="flex justify-end gap-2">
              <Button variant="subtle" size="sm" type="button" onClick={() => setIsCreatingFolder(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Folder
              </Button>
            </div>
          </form>
        )}

        {/* B. Write Note / Cheat Sheet Inline */}
        {isWritingNote && (
          <form
            onSubmit={handleSaveNote}
            className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border-2 border-teal-500/40 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Write Subject Cheat Sheet / Note</span>
              </span>
              <button
                type="button"
                onClick={() => setIsWritingNote(false)}
                className="text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note Title (e.g. B+ Tree Height Formula & Fanout Cheat Sheet)"
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-teal-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-bold"
            />
            <textarea
              rows={4}
              required
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write formulas, key definitions, algorithm steps..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-teal-400 rounded-xl p-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none resize-none font-mono"
            />
            <div className="flex justify-end gap-2">
              <Button variant="subtle" size="sm" type="button" onClick={() => setIsWritingNote(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Note
              </Button>
            </div>
          </form>
        )}

        {/* C. Add Link Inline */}
        {isAddingLink && (
          <form
            onSubmit={handleSaveLink}
            className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border-2 border-sky-500/40 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                <span>Bookmark Reference Link</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingLink(false)}
                className="text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Title (e.g. Stanford DBMS Lecture Notes)"
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-sky-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-bold"
              />
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-sky-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="subtle" size="sm" type="button" onClick={() => setIsAddingLink(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Add Bookmark
              </Button>
            </div>
          </form>
        )}

        {/* 3. Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold border-b border-[var(--border-subtle)] pb-2">
          {(['all', 'folder', 'file', 'image', 'text', 'link'] as const).map((t) => {
            const labelMap: Record<string, string> = {
              all: '✨ All Items',
              folder: `📁 Folders (${folders.length})`,
              file: '📄 Docs & Slides',
              image: '🖼️ Images',
              text: '✍️ Cheat Sheets',
              link: '🔗 Links',
            };
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 ${
                  filterType === t
                    ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {labelMap[t] || t}
              </button>
            );
          })}
        </div>

        {/* 4. Materials Grid & List View */}
        <div className="space-y-4">
          {/* Folders Section (if in root view) */}
          {visibleFolders.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Folders ({visibleFolders.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {visibleFolders.map((f) => {
                  const itemCount = resources.filter((r) => r.folderId === f.id).length;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setCurrentFolderId(f.id)}
                      className="group p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-amber-400/60 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <Folder className="w-5 h-5 fill-amber-400/20" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-amber-400 transition-colors">
                            {f.name}
                          </h5>
                          <span className="text-[11px] text-[var(--text-secondary)]">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(f.id, f.name);
                        }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resources List */}
          <div className="space-y-2">
            {visibleResources.length > 0 && (
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Materials & Documents ({visibleResources.length})
              </span>
            )}

            {visibleFolders.length === 0 && visibleResources.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl space-y-2">
                <span className="text-3xl">📂</span>
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {currentFolder ? `No items in ${currentFolder.name}` : 'Vault is empty for this subject'}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Upload lecture slides, attach diagrams, bookmark portal links, or write quick cheat sheet notes above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleResources.map((res) => (
                  <div
                    key={res.id}
                    className="group relative p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/60 transition-all shadow-sm flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                          {renderResourceIcon(res)}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <h5 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-tight truncate">
                            {res.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                            {res.fileSize && <span>{res.fileSize}</span>}
                            <span>·</span>
                            <span>{res.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res.id, res.name)}
                        className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                        title="Delete material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content Snippet Preview (For Text Notes) */}
                    {res.type === 'text' && res.textContent && (
                      <div
                        onClick={() => setPreviewResource(res)}
                        className="p-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] line-clamp-2 font-mono cursor-pointer hover:border-[var(--accent-primary)]/40 transition-colors"
                      >
                        {res.textContent}
                      </div>
                    )}

                    {/* Image Preview Thumbnail */}
                    {res.type === 'image' && res.fileUrl && (
                      <div
                        onClick={() => setPreviewResource(res)}
                        className="relative w-full h-28 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] cursor-pointer group-hover:ring-1 group-hover:ring-[var(--accent-primary)]/40 transition-all"
                      >
                        <img src={res.fileUrl} alt={res.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity gap-1">
                          <Eye className="w-4 h-4" />
                          <span>View Image</span>
                        </div>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-xs">
                      <div className="flex items-center gap-1">
                        {res.tags?.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-subtle)] text-[10px] text-[var(--text-secondary)] font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {res.type === 'link' && res.fileUrl && (
                        <a
                          href={res.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline font-bold text-xs"
                        >
                          <span>Open Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {res.type === 'file' && res.fileUrl && (
                        <a
                          href={res.fileUrl}
                          download={res.name}
                          className="inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline font-bold text-xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      )}

                      {res.type === 'text' && (
                        <button
                          type="button"
                          onClick={() => setPreviewResource(res)}
                          className="inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline font-bold text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Read Full Note</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Resource Viewer Modal (For Notes and Full Images) */}
        {previewResource && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col font-kalam">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  {renderResourceIcon(previewResource)}
                  <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                    {previewResource.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewResource(null)}
                  className="p-1 rounded-xl text-[var(--text-secondary)] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {previewResource.type === 'image' && previewResource.fileUrl && (
                  <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] max-h-[60vh] flex items-center justify-center bg-black/40">
                    <img
                      src={previewResource.fileUrl}
                      alt={previewResource.name}
                      className="max-h-[60vh] w-auto object-contain"
                    />
                  </div>
                )}

                {previewResource.type === 'text' && (
                  <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] font-mono text-xs sm:text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                    {previewResource.textContent}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setPreviewResource(null)}>
                  Close Viewer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
