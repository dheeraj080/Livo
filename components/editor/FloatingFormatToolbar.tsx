'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon,
  Unlink,
  Sparkles,
  MoreHorizontal,
  Highlighter,
  Code,
  Quote,
  Eraser,
  Copy,
  Check,
  Loader2,
  X,
  Wand2,
  RefreshCw,
  Maximize2,
  Minimize2,
  FileText,
  CheckSquare,
  HelpCircle,
  Sliders,
  ChevronRight,
  ArrowLeft,
  CornerDownLeft,
} from 'lucide-react';

interface FloatingFormatToolbarProps {
  editor: Editor | null;
  noteTitle?: string;
}

type AIState = 'idle' | 'menu' | 'tone-select' | 'loading' | 'result';

interface AISubAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const PRIMARY_AI_ACTIONS: AISubAction[] = [
  { id: 'improve_writing', label: 'Improve writing', icon: Wand2, description: 'Enhance clarity, grammar & vocabulary' },
  { id: 'rewrite', label: 'Rewrite', icon: RefreshCw, description: 'Rephrase in a fresh, fluent style' },
  { id: 'expand', label: 'Expand', icon: Maximize2, description: 'Add detail, depth & context' },
  { id: 'shorten', label: 'Shorten', icon: Minimize2, description: 'Make concise and punchy' },
  { id: 'simplify', label: 'Simplify', icon: Sparkles, description: 'Clear, plain and easy to read' },
  { id: 'summarize', label: 'Summarize', icon: FileText, description: 'Key takeaways and brief summary' },
  { id: 'change_tone', label: 'Change tone', icon: Sliders, description: 'Professional, casual, confident...' },
  { id: 'explain', label: 'Explain', icon: HelpCircle, description: 'Explain this concept simply' },
  { id: 'extract_tasks', label: 'Extract tasks', icon: CheckSquare, description: 'Convert into actionable to-dos' },
];

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', desc: 'Polished, business-ready' },
  { id: 'casual', label: 'Casual & Conversational', desc: 'Warm and approachable' },
  { id: 'confident', label: 'Confident & Direct', desc: 'Assertive, authoritative' },
  { id: 'academic', label: 'Academic & Formal', desc: 'Analytical and rigorous' },
  { id: 'friendly', label: 'Friendly & Empathetic', desc: 'Supportive and kind' },
];

export function FloatingFormatToolbar({ editor, noteTitle = 'Untitled' }: FloatingFormatToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });

  // Sub-menus state
  const [aiState, setAiState] = useState<AIState>('idle');
  const [activeActionLabel, setActiveActionLabel] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Link popover state
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  // Overflow menu state
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  // Saved range for AI operations (to accurately replace or insert)
  const savedRangeRef = useRef<{ from: number; to: number; text: string } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Update floating toolbar position based on DOM selection
  const updatePosition = useCallback(() => {
    if (!editor || editor.isDestroyed) {
      setIsVisible(false);
      return;
    }

    const { from, to, empty } = editor.state.selection;
    if (empty || from === to) {
      // If we are currently showing an AI result or loading, keep the card visible
      if (aiState === 'loading' || aiState === 'result') {
        return;
      }
      setIsVisible(false);
      setIsLinkOpen(false);
      setIsOverflowOpen(false);
      if (aiState === 'menu' || aiState === 'tone-select') {
        setAiState('idle');
      }
      return;
    }

    // Get current text in selection
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText || !selectedText.trim()) {
      if (aiState === 'loading' || aiState === 'result') return;
      setIsVisible(false);
      return;
    }

    // Save range reference
    savedRangeRef.current = { from, to, text: selectedText };

    // Calculate DOM bounding rect
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      return;
    }

    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    const toolbarHeight = 44;
    const offset = 8;
    const minTopBound = 72; // Below top navigation/ribbon

    let top: number;
    let placement: 'top' | 'bottom';

    if (rect.top - toolbarHeight - offset < minTopBound) {
      // Position below selection to avoid being obscured by top navigation
      top = rect.bottom + offset;
      placement = 'bottom';
    } else {
      // Position above selection
      top = rect.top - toolbarHeight - offset;
      placement = 'top';
    }

    // Center horizontally on the selection
    const toolbarWidth = 320;
    const screenPadding = 16;
    const centerLeft = rect.left + rect.width / 2;
    const minLeft = screenPadding + toolbarWidth / 2;
    const maxLeft = window.innerWidth - screenPadding - toolbarWidth / 2;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, centerLeft));

    setPosition({
      top: Math.round(top),
      left: Math.round(clampedLeft),
      placement,
    });
    setIsVisible(true);
  }, [editor, aiState]);

  // Subscribe to editor selection changes and window events
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      // Defer slightly to allow DOM selection to settle
      requestAnimationFrame(updatePosition);
    };

    const handleScrollOrResize = () => {
      if (isVisible || aiState !== 'idle') {
        updatePosition();
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [editor, isVisible, aiState, updatePosition]);

  // Handle global Escape key and click-outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (aiState === 'result' || aiState === 'loading') {
          setAiState('idle');
          setAiResult(null);
          setAiError(null);
        } else if (aiState === 'tone-select') {
          setAiState('menu');
        } else if (aiState === 'menu') {
          setAiState('idle');
        } else if (isLinkOpen) {
          setIsLinkOpen(false);
        } else if (isOverflowOpen) {
          setIsOverflowOpen(false);
        } else if (isVisible) {
          setIsVisible(false);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // If clicking outside and not inside an editor interaction that keeps selection
        if (aiState === 'menu' || aiState === 'tone-select') {
          setAiState('idle');
        }
        if (isLinkOpen) {
          setIsLinkOpen(false);
        }
        if (isOverflowOpen) {
          setIsOverflowOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, aiState, isLinkOpen, isOverflowOpen]);

  // Execute AI action on selected text (reusing existing backend routes)
  const handleRunAI = async (actionId: string, customInstruction?: string, label?: string) => {
    if (!editor) return;

    // Use current selection or saved range
    const range = savedRangeRef.current || {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
      text: editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' '),
    };

    if (!range.text.trim()) return;

    setActiveActionLabel(label || 'Processing');
    setAiState('loading');
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      let endpoint = '/api/ai/rewrite';
      let payload: any = {};

      switch (actionId) {
        case 'improve_writing':
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: 'Improve writing clarity, grammar, flow, and vocabulary while strictly preserving the original meaning.',
          };
          break;

        case 'rewrite':
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: 'Rewrite this text clearly and fluently in a fresh, compelling style while maintaining all factual details.',
          };
          break;

        case 'expand':
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: 'Elaborate and expand upon this text with richer detail, illustrative depth, and helpful context.',
          };
          break;

        case 'shorten':
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: 'Make this text concise, direct, and punchy without losing any essential points.',
          };
          break;

        case 'simplify':
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: 'Simplify this text using plain, accessible, easy-to-understand language.',
          };
          break;

        case 'summarize':
          endpoint = '/api/ai/action';
          payload = {
            action: 'summarize',
            content: range.text,
            noteTitle,
          };
          break;

        case 'change_tone':
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: customInstruction || 'Rewrite this text in a professional, polished tone.',
          };
          break;

        case 'explain':
          endpoint = '/api/ai/explain';
          payload = {
            text: range.text,
          };
          break;

        case 'extract_tasks':
          endpoint = '/api/ai/action';
          payload = {
            action: 'action_items',
            content: range.text,
            noteTitle,
          };
          break;

        default:
          endpoint = '/api/ai/rewrite';
          payload = {
            text: range.text,
            instruction: customInstruction || 'Improve this text.',
          };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI operation failed');
      }

      setAiResult(data.result || '');
      setAiState('result');
    } catch (err: any) {
      console.error('[FloatingFormatToolbar] AI Error:', err);
      setAiError(err.message || 'Failed to process selected text');
      setAiState('result');
    } finally {
      setAiLoading(false);
    }
  };

  // Replace selected text with AI result
  const handleReplaceSelection = () => {
    if (!editor || !aiResult) return;
    const range = savedRangeRef.current;
    if (range) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: range.from, to: range.to })
        .insertContent(aiResult)
        .run();
    } else {
      editor.chain().focus().insertContent(aiResult).run();
    }
    setAiState('idle');
    setAiResult(null);
    setIsVisible(false);
  };

  // Insert AI result below selection
  const handleInsertBelow = () => {
    if (!editor || !aiResult) return;
    const range = savedRangeRef.current;
    const targetPos = range ? range.to : editor.state.selection.to;

    editor
      .chain()
      .focus()
      .setTextSelection(targetPos)
      .insertContent(`\n${aiResult}\n`)
      .run();

    setAiState('idle');
    setAiResult(null);
    setIsVisible(false);
  };

  // Copy result to clipboard
  const handleCopyResult = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Link submission
  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkInput.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = linkInput.startsWith('http://') || linkInput.startsWith('https://')
        ? linkInput
        : `https://${linkInput}`;
      editor.chain().focus().setLink({ href: url }).run();
    }
    setIsLinkOpen(false);
    setLinkInput('');
  };

  if (!editor || (!isVisible && aiState === 'idle')) {
    return null;
  }

  return (
    <div
      ref={toolbarRef}
      id="tiptap-floating-toolbar"
      role="toolbar"
      aria-label="Text selection formatting toolbar"
      className="fixed z-50 flex flex-col items-center pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* PRIMARY COMPACT TOOLBAR PILL */}
      <div
        className="flex items-center gap-0.5 px-1.5 py-1 bg-white/95 backdrop-blur-md rounded-xl border border-stone-200/90 shadow-xl text-stone-700 select-none animate-in fade-in zoom-in-95 duration-150"
        onMouseDown={(e) => {
          // Prevent toolbar clicks from causing the editor to lose selection
          e.stopPropagation();
        }}
      >
        {/* Bold */}
        <button
          id="floating-btn-bold"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 ${
            editor.isActive('bold') ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-700'
          }`}
          title="Bold (⌘B / Ctrl+B)"
          aria-label="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          id="floating-btn-italic"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 ${
            editor.isActive('italic') ? 'bg-stone-200 text-stone-900' : 'text-stone-700'
          }`}
          title="Italic (⌘I / Ctrl+I)"
          aria-label="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Underline */}
        <button
          id="floating-btn-underline"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 ${
            editor.isActive('underline') ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-700'
          }`}
          title="Underline (⌘U / Ctrl+U)"
          aria-label="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        {/* Strikethrough */}
        <button
          id="floating-btn-strike"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 ${
            editor.isActive('strike') ? 'bg-stone-200 text-stone-900' : 'text-stone-700'
          }`}
          title="Strikethrough"
          aria-label="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" aria-hidden="true" />

        {/* Link */}
        <button
          id="floating-btn-link"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
              setIsLinkOpen(false);
            } else {
              setLinkInput(editor.getAttributes('link').href || '');
              setIsLinkOpen((prev) => !prev);
              setAiState('idle');
              setIsOverflowOpen(false);
              setTimeout(() => linkInputRef.current?.focus(), 50);
            }
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 ${
            editor.isActive('link') || isLinkOpen ? 'bg-stone-200 text-stone-900' : 'text-stone-700'
          }`}
          title={editor.isActive('link') ? 'Remove link' : 'Add link (⌘K)'}
          aria-label="Link"
        >
          {editor.isActive('link') ? <Unlink className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
        </button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" aria-hidden="true" />

        {/* ✦ AI Action Trigger */}
        <button
          id="floating-btn-ai"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setAiState((prev) => (prev === 'idle' ? 'menu' : 'idle'));
            setIsLinkOpen(false);
            setIsOverflowOpen(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            aiState !== 'idle'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-700'
          }`}
          title="✦ livo AI Actions on selected text"
          aria-label="✦ AI Actions"
          aria-expanded={aiState !== 'idle'}
          aria-haspopup="menu"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✦ AI</span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-stone-200 mx-0.5" aria-hidden="true" />

        {/* Overflow Menu (···) */}
        <button
          id="floating-btn-more"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setIsOverflowOpen((prev) => !prev);
            setIsLinkOpen(false);
            if (aiState === 'menu' || aiState === 'tone-select') setAiState('idle');
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-stone-100 ${
            isOverflowOpen ? 'bg-stone-200 text-stone-900' : 'text-stone-600'
          }`}
          title="More options"
          aria-label="More options"
          aria-expanded={isOverflowOpen}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* INLINE LINK INPUT POPOVER */}
      {isLinkOpen && (
        <div
          id="floating-link-popover"
          className="mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-stone-200 p-2 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            ref={linkInputRef}
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyLink();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setIsLinkOpen(false);
              }
            }}
            placeholder="Paste link (https://...)"
            className="flex-1 px-2.5 py-1 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-stone-800 placeholder-stone-400"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            title="Apply Link"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsLinkOpen(false)}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* OVERFLOW MENU (···) */}
      {isOverflowOpen && (
        <div
          id="floating-overflow-menu"
          role="menu"
          className="mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Highlight */}
          <button
            id="floating-overflow-highlight"
            type="button"
            role="menuitem"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleHighlight().run();
              setIsOverflowOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-stone-100 transition-colors text-left cursor-pointer ${
              editor.isActive('highlight') ? 'bg-amber-50 text-amber-900 font-medium' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
              <span>Highlight</span>
            </span>
            {editor.isActive('highlight') && <Check className="w-3 h-3 text-amber-600" />}
          </button>

          {/* Inline Code */}
          <button
            id="floating-overflow-code"
            type="button"
            role="menuitem"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleCode().run();
              setIsOverflowOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-stone-100 transition-colors text-left cursor-pointer ${
              editor.isActive('code') ? 'bg-stone-100 text-stone-900 font-medium' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-stone-500" />
              <span>Inline code</span>
            </span>
            {editor.isActive('code') && <Check className="w-3 h-3 text-indigo-600" />}
          </button>

          {/* Blockquote */}
          <button
            id="floating-overflow-quote"
            type="button"
            role="menuitem"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleBlockquote().run();
              setIsOverflowOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-stone-100 transition-colors text-left cursor-pointer ${
              editor.isActive('blockquote') ? 'bg-stone-100 text-stone-900 font-medium' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <Quote className="w-3.5 h-3.5 text-stone-500" />
              <span>Quote</span>
            </span>
            {editor.isActive('blockquote') && <Check className="w-3 h-3 text-indigo-600" />}
          </button>

          <div className="h-[1px] bg-stone-100 my-1" />

          {/* Clear formatting */}
          <button
            id="floating-overflow-clear"
            type="button"
            role="menuitem"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().unsetAllMarks().clearNodes().run();
              setIsOverflowOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors text-left cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5 text-stone-500" />
            <span>Clear formatting</span>
          </button>

          {/* Copy selected text */}
          <button
            id="floating-overflow-copy"
            type="button"
            role="menuitem"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const text = editor.state.doc.textBetween(
                editor.state.selection.from,
                editor.state.selection.to,
                ' '
              );
              navigator.clipboard.writeText(text);
              setIsOverflowOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors text-left cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-stone-500" />
            <span>Copy text</span>
          </button>
        </div>
      )}

      {/* ✦ AI ACTION SELECTION MENU */}
      {aiState === 'menu' && (
        <div
          id="floating-ai-menu"
          role="menu"
          className="mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 text-xs text-stone-800 animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>AI Selection Actions</span>
            </span>
            <span className="text-[10px] text-stone-400">Esc to close</span>
          </div>

          <div className="py-1 max-h-72 overflow-y-auto">
            {PRIMARY_AI_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  id={`ai-action-${action.id}`}
                  type="button"
                  role="menuitem"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (action.id === 'change_tone') {
                      setAiState('tone-select');
                    } else {
                      handleRunAI(action.id, undefined, action.label);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-indigo-50/60 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-md bg-stone-100 text-stone-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-medium text-stone-800 group-hover:text-indigo-950">
                        {action.label}
                      </div>
                      {action.description && (
                        <div className="text-[10px] text-stone-400 leading-tight">
                          {action.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {action.id === 'change_tone' ? (
                    <ChevronRight className="w-3 h-3 text-stone-400" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ✦ CHANGE TONE SUBMENU */}
      {aiState === 'tone-select' && (
        <div
          id="floating-ai-tone-menu"
          role="menu"
          className="mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 text-xs text-stone-800 animate-in fade-in zoom-in-95 duration-100"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAiState('menu')}
              className="text-[10px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Actions</span>
            </button>
            <span className="text-[10px] text-stone-400 font-medium">Select Tone</span>
          </div>

          <div className="py-1">
            {TONE_OPTIONS.map((tone) => (
              <button
                key={tone.id}
                type="button"
                role="menuitem"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleRunAI(
                    'change_tone',
                    `Rewrite this text with a ${tone.label} tone. Keep all key facts and meaning intact.`,
                    `Tone: ${tone.label}`
                  );
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-indigo-50/60 transition-colors text-left cursor-pointer group"
              >
                <div>
                  <div className="font-medium text-stone-800 group-hover:text-indigo-950">
                    {tone.label}
                  </div>
                  <div className="text-[10px] text-stone-400">{tone.desc}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-indigo-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ✦ AI LOADING CARD */}
      {aiState === 'loading' && (
        <div
          id="floating-ai-loading"
          className="mt-2 w-72 bg-white rounded-xl shadow-2xl border border-stone-200 p-4 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-150 text-center"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-800">
              ✦ livo AI: {activeActionLabel || 'Thinking...'}
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              Analyzing and transforming selected text...
            </div>
          </div>
        </div>
      )}

      {/* ✦ AI RESULT PREVIEW CARD */}
      {aiState === 'result' && (
        <div
          id="floating-ai-result-card"
          className="mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-stone-200 p-3.5 text-xs text-stone-800 animate-in fade-in zoom-in-95 duration-150"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
            <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeActionLabel || 'AI Result'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAiState('idle');
                setAiResult(null);
                setAiError(null);
              }}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {aiError ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs my-2">
              <div className="font-semibold mb-0.5">Operation failed</div>
              <div>{aiError}</div>
              <button
                type="button"
                onClick={() => setAiState('menu')}
                className="mt-2 px-2.5 py-1 bg-white border border-red-300 rounded text-red-700 hover:bg-red-50 text-[11px] font-medium"
              >
                Try different action
              </button>
            </div>
          ) : (
            <>
              {/* Result Preview Box */}
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 max-h-48 overflow-y-auto text-stone-700 leading-relaxed font-sans text-xs whitespace-pre-wrap selection:bg-indigo-100">
                {aiResult}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-1 gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    id="floating-ai-copy-btn"
                    type="button"
                    onClick={handleCopyResult}
                    className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 flex items-center gap-1 text-[11px] font-medium transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiState('menu')}
                    className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 text-[11px] font-medium transition-colors"
                    title="Try another action"
                  >
                    Try another
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id="floating-ai-insert-below"
                    type="button"
                    onClick={handleInsertBelow}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Insert result below current selection"
                  >
                    Insert below
                  </button>
                  <button
                    id="floating-ai-replace-btn"
                    type="button"
                    onClick={handleReplaceSelection}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Replace selected text with AI result"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Replace</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
