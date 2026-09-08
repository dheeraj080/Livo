'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table as TableIcon,
  Sparkles,
  Image as ImageIcon,
  Paperclip,
} from 'lucide-react';

export interface SlashCommandItem {
  id: string;
  label: string;
  badgeSymbol: string;
  badgeNode?: React.ReactNode;
  description: string;
  keywords: string[];
  execute: (editor: Editor, range: { from: number; to: number }) => void;
}

interface SlashCommandMenuProps {
  editor: Editor | null;
  onOpenImageModal: () => void;
  onOpenFilePicker: () => void;
  onOpenAI: () => void;
  onKeyDownRef?: React.MutableRefObject<((view: any, event: KeyboardEvent) => boolean) | null>;
}

export function SlashCommandMenu({
  editor,
  onOpenImageModal,
  onOpenFilePicker,
  onOpenAI,
  onKeyDownRef,
}: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [range, setRange] = useState<{ from: number; to: number } | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; cursorTop: number }>({
    top: 0,
    left: 0,
    cursorTop: 0,
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dismissedPosRef = useRef<number | null>(null);

  // Command definitions matching the livo specification
  const commands: SlashCommandItem[] = useMemo(
    () => [
      {
        id: 'heading',
        label: 'Heading',
        badgeSymbol: 'H1',
        badgeNode: <span className="font-semibold text-xs text-stone-800">H1</span>,
        description: 'Large section heading',
        keywords: ['h1', 'heading', 'title', 'header', 'large', 'h'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).setNode('heading', { level: 1 }).run();
        },
      },
      {
        id: 'subheading',
        label: 'Subheading',
        badgeSymbol: 'H2',
        badgeNode: <span className="font-semibold text-xs text-stone-800">H2</span>,
        description: 'Medium subsection heading',
        keywords: ['h2', 'subheading', 'subtitle', 'header', 'medium', 'section'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).setNode('heading', { level: 2 }).run();
        },
      },
      {
        id: 'bullet_list',
        label: 'Bullet list',
        badgeSymbol: '•',
        badgeNode: <span className="text-base font-bold leading-none select-none text-stone-800">•</span>,
        description: 'Create a bulleted list',
        keywords: ['bullet', 'list', 'unordered', 'ul', 'points', 'items'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).toggleBulletList().run();
        },
      },
      {
        id: 'numbered_list',
        label: 'Numbered list',
        badgeSymbol: '1.',
        badgeNode: <span className="font-semibold text-xs font-mono text-stone-800">1.</span>,
        description: 'Create a numbered list',
        keywords: ['numbered', 'list', 'ordered', 'ol', 'numbers', 'sequence', '1.'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).toggleOrderedList().run();
        },
      },
      {
        id: 'todo',
        label: 'To-do',
        badgeSymbol: '☑',
        badgeNode: <CheckSquare className="w-3.5 h-3.5 text-stone-700" />,
        description: 'Track tasks with a checklist',
        keywords: ['todo', 'task', 'checklist', 'check', 'done', 'box'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).toggleTaskList().run();
        },
      },
      {
        id: 'quote',
        label: 'Quote',
        badgeSymbol: '"',
        badgeNode: <span className="font-serif text-sm font-bold leading-none text-stone-800">&ldquo;</span>,
        description: 'Capture a quotation or citation',
        keywords: ['quote', 'blockquote', 'quotation', 'cite', 'citation', 'saying'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).toggleBlockquote().run();
        },
      },
      {
        id: 'code',
        label: 'Code',
        badgeSymbol: '</>',
        badgeNode: <span className="font-mono text-[11px] font-bold text-stone-800">&lt;/&gt;</span>,
        description: 'Code snippet with syntax block',
        keywords: ['code', 'codeblock', 'pre', 'script', 'snippet', 'programming', 'developer'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).toggleCodeBlock().run();
        },
      },
      {
        id: 'divider',
        label: 'Divider',
        badgeSymbol: '─',
        badgeNode: <Minus className="w-3.5 h-3.5 text-stone-700" />,
        description: 'Visually separate note sections',
        keywords: ['divider', 'line', 'horizontal rule', 'hr', 'separator', 'break', '─'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).setHorizontalRule().run();
        },
      },
      {
        id: 'table',
        label: 'Table',
        badgeSymbol: '▣',
        badgeNode: <TableIcon className="w-3.5 h-3.5 text-stone-700" />,
        description: 'Insert a 3×3 structured table',
        keywords: ['table', 'grid', 'rows', 'columns', 'spreadsheet', 'matrix', '▣'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
      {
        id: 'callout',
        label: 'Callout',
        badgeSymbol: '💡',
        badgeNode: <span className="text-xs">💡</span>,
        description: 'Highlight important note or tip',
        keywords: ['callout', 'note', 'tip', 'alert', 'info', 'highlight', 'idea', 'bulb', 'important'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).setBlockquote().insertContent('💡 ').run();
        },
      },
      {
        id: 'image',
        label: 'Image',
        badgeSymbol: '🖼',
        badgeNode: <ImageIcon className="w-3.5 h-3.5 text-stone-700" />,
        description: 'Upload or embed an image',
        keywords: ['image', 'photo', 'picture', 'upload', 'img', 'media', 'pic'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).run();
          onOpenImageModal();
        },
      },
      {
        id: 'file',
        label: 'File',
        badgeSymbol: '📎',
        badgeNode: <Paperclip className="w-3.5 h-3.5 text-stone-700" />,
        description: 'Attach a document or file',
        keywords: ['file', 'attachment', 'attach', 'upload', 'document', 'pdf'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).run();
          onOpenFilePicker();
        },
      },
      {
        id: 'ai',
        label: 'AI',
        badgeSymbol: '✦',
        badgeNode: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
        description: 'Open livo AI assistant',
        keywords: ['ai', 'gemini', 'livo', 'assistant', 'ask', 'generate', 'sparkles', 'prompt', 'rewrite'],
        execute: (ed, rng) => {
          ed.chain().focus().deleteRange(rng).run();
          onOpenAI();
        },
      },
    ],
    [onOpenImageModal, onOpenFilePicker, onOpenAI]
  );

  // Filter commands as the user types (e.g. /code)
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;

    return commands.filter((cmd) => {
      if (cmd.label.toLowerCase().includes(q)) return true;
      if (cmd.badgeSymbol.toLowerCase().includes(q)) return true;
      if (cmd.id.toLowerCase().includes(q)) return true;
      if (cmd.description.toLowerCase().includes(q)) return true;
      return cmd.keywords.some((k) => k.toLowerCase().includes(q));
    });
  }, [commands, query]);

  // Reset selectedIndex whenever query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Ensure selected item stays in view when navigating via arrow keys
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Execute selected command cleanly
  const executeCommand = useCallback(
    (cmd: SlashCommandItem) => {
      if (!editor || !range) return;
      setIsOpen(false);
      dismissedPosRef.current = null;
      cmd.execute(editor, range);
    },
    [editor, range]
  );

  // Check cursor text and position to determine if slash command menu should show
  const checkSlashCommand = useCallback(() => {
    if (!editor || !editor.isEditable) {
      setIsOpen(false);
      return;
    }

    const { selection } = editor.state;
    // Do not show menu when multiple characters are selected
    if (!selection.empty) {
      setIsOpen(false);
      return;
    }

    const { from } = selection;
    const $from = selection.$from;

    // Do not show slash menu inside code blocks
    if ($from.parent.type.name === 'codeBlock') {
      setIsOpen(false);
      return;
    }

    // Get text in current block up to cursor position
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');

    // Slash command trigger: beginning of block OR preceded by whitespace, followed by / and query characters
    const match = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_\-]*)$/);

    if (!match) {
      setIsOpen(false);
      return;
    }

    const matchedQuery = match[1];
    const commandTextLength = 1 + matchedQuery.length; // length of '/' + query
    const rangeFrom = from - commandTextLength;
    const rangeTo = from;

    // Check if user dismissed this slash command via Escape
    if (dismissedPosRef.current !== null) {
      if (Math.abs(from - dismissedPosRef.current) <= commandTextLength + 1) {
        return;
      }
      dismissedPosRef.current = null;
    }

    try {
      const coords = editor.view.coordsAtPos(from);
      setPosition({
        top: coords.bottom + 6,
        left: coords.left,
        cursorTop: coords.top,
      });
      setQuery(matchedQuery);
      setRange({ from: rangeFrom, to: rangeTo });
      setIsOpen(true);
    } catch {
      setIsOpen(false);
    }
  }, [editor]);

  // Wire up editor transaction & selection listeners
  useEffect(() => {
    if (!editor) return;

    editor.on('transaction', checkSlashCommand);
    editor.on('selectionUpdate', checkSlashCommand);

    return () => {
      editor.off('transaction', checkSlashCommand);
      editor.off('selectionUpdate', checkSlashCommand);
    };
  }, [editor, checkSlashCommand]);

  // Keep menu position synced when scrolling or resizing
  useEffect(() => {
    if (!isOpen || !editor) return;

    const handleScrollOrResize = () => {
      try {
        const { from } = editor.state.selection;
        const coords = editor.view.coordsAtPos(from);
        setPosition({
          top: coords.bottom + 6,
          left: coords.left,
          cursorTop: coords.top,
        });
      } catch {}
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, editor]);

  // Handle keyboard events (ArrowUp, ArrowDown, Enter, Escape, Tab)
  const handleKeyDown = useCallback(
    (_view: any, event: KeyboardEvent): boolean => {
      if (!isOpen) return false;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (filteredCommands.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        }
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (filteredCommands.length > 0) {
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        }
        return true;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (filteredCommands.length > 0) {
          const item = filteredCommands[selectedIndex];
          if (item) {
            executeCommand(item);
          }
        }
        return true;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        if (editor) {
          dismissedPosRef.current = editor.state.selection.from;
        }
        setIsOpen(false);
        return true;
      }

      return false;
    },
    [isOpen, filteredCommands, selectedIndex, executeCommand, editor]
  );

  // Sync keyboard handler ref to Tiptap editorProps
  useEffect(() => {
    if (!onKeyDownRef) return;

    if (isOpen) {
      onKeyDownRef.current = handleKeyDown;
    } else {
      onKeyDownRef.current = null;
    }

    return () => {
      if (onKeyDownRef) {
        onKeyDownRef.current = null;
      }
    };
  }, [isOpen, handleKeyDown, onKeyDownRef]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Viewport boundary clamping
  const menuWidth = 280;
  const menuHeight = Math.min(filteredCommands.length * 44 + 42, 360);
  const padding = 12;

  let left = position.left;
  if (typeof window !== 'undefined') {
    if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }
  }

  let top = position.top;
  if (typeof window !== 'undefined') {
    if (top + menuHeight > window.innerHeight - padding) {
      // Flip above the cursor
      top = position.cursorTop - menuHeight - 6;
      if (top < padding) {
        top = padding;
      }
    }
  }

  return (
    <div
      ref={menuRef}
      id="slash-command-menu"
      role="listbox"
      aria-label="Slash Commands"
      className="fixed z-50 w-72 bg-white rounded-xl shadow-2xl border border-stone-200 py-1 text-stone-700 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
    >
      {/* Header matching livo specification */}
      <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Add to your note
        </span>
        <span className="text-[9px] text-stone-400 font-mono">
          esc to close
        </span>
      </div>

      {/* Commands List */}
      <div ref={listRef} className="max-h-72 overflow-y-auto p-1 space-y-0.5">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-6 text-center text-stone-400 text-xs">
            No commands matching &ldquo;/{query}&rdquo;
          </div>
        ) : (
          filteredCommands.map((cmd, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={cmd.id}
                id={`slash-cmd-${cmd.id}`}
                data-index={index}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  executeCommand(cmd);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  executeCommand(cmd);
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono shrink-0 transition-colors ${
                      cmd.id === 'ai'
                        ? 'bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100'
                        : isSelected
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold border border-stone-200/80'
                        : 'bg-stone-100 text-stone-600 border border-stone-200/50'
                    }`}
                  >
                    {cmd.badgeNode || cmd.badgeSymbol}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-stone-900 truncate flex items-center gap-1.5">
                      <span>{cmd.label}</span>
                      {cmd.id === 'ai' && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-indigo-100 text-indigo-700">
                          ✦ AI
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {cmd.description}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1.5">
                    ↵
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
