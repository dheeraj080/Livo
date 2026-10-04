'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

export interface SlashCommandMenuProps {
  editor: Editor | null;
  onOpenAI?: () => void;
  onOpenImage?: () => void;
  onOpenFile?: () => void;
  registerKeyDownHandler?: (handler: ((event: KeyboardEvent) => boolean) | null) => void;
}

export interface SlashCommandItem {
  id: string;
  title: string;
  subtitle: string;
  badge: React.ReactNode;
  keywords: string[];
  action: (editor: Editor) => void;
}

export function SlashCommandMenu({
  editor,
  onOpenAI,
  onOpenImage,
  onOpenFile,
  registerKeyDownHandler,
}: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slashRange, setSlashRange] = useState<{ from: number; to: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [dismissedSlashPos, setDismissedSlashPos] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Define the exact 13 slash commands matching livo guidelines and user specification
  const commands: SlashCommandItem[] = useMemo(
    () => [
      {
        id: 'heading-1',
        title: 'Heading',
        subtitle: 'H1 section title',
        badge: <span className="font-bold text-xs tracking-tight">H1</span>,
        keywords: ['h1', 'heading', 'title', 'header', 'large', 'h'],
        action: (ed) => {
          ed.chain().focus().toggleHeading({ level: 1 }).run();
        },
      },
      {
        id: 'heading-2',
        title: 'Subheading',
        subtitle: 'H2 subsection title',
        badge: <span className="font-bold text-xs tracking-tight">H2</span>,
        keywords: ['h2', 'subheading', 'subtitle', 'header', 'medium', 'sub'],
        action: (ed) => {
          ed.chain().focus().toggleHeading({ level: 2 }).run();
        },
      },
      {
        id: 'bullet-list',
        title: 'Bullet list',
        subtitle: 'Unordered point list',
        badge: <span className="text-base font-black leading-none select-none">•</span>,
        keywords: ['bullet', 'list', 'unordered', 'ul', 'bullets', 'points'],
        action: (ed) => {
          ed.chain().focus().toggleBulletList().run();
        },
      },
      {
        id: 'numbered-list',
        title: 'Numbered list',
        subtitle: 'Sequential ordered list',
        badge: <span className="text-xs font-bold leading-none select-none">1.</span>,
        keywords: ['numbered', 'list', 'ordered', 'ol', 'numbers', '1'],
        action: (ed) => {
          ed.chain().focus().toggleOrderedList().run();
        },
      },
      {
        id: 'todo',
        title: 'To-do',
        subtitle: 'Interactive task checklist',
        badge: <span className="text-xs font-semibold leading-none select-none">☑</span>,
        keywords: ['todo', 'to-do', 'task', 'checklist', 'checkbox', 'check', 'tasks'],
        action: (ed) => {
          ed.chain().focus().toggleTaskList().run();
        },
      },
      {
        id: 'quote',
        title: 'Quote',
        subtitle: 'Blockquote callout',
        badge: <span className="font-serif text-sm font-bold leading-none select-none">&ldquo;</span>,
        keywords: ['quote', 'blockquote', 'citation', 'cite'],
        action: (ed) => {
          ed.chain().focus().toggleBlockquote().run();
        },
      },
      {
        id: 'code',
        title: 'Code',
        subtitle: 'Code block syntax snippet',
        badge: <span className="font-mono text-[11px] font-bold select-none">&lt;/&gt;</span>,
        keywords: ['code', 'codeblock', 'snippet', 'pre', 'programming', 'javascript'],
        action: (ed) => {
          ed.chain().focus().toggleCodeBlock().run();
        },
      },
      {
        id: 'divider',
        title: 'Divider',
        subtitle: 'Horizontal divider line',
        badge: <span className="font-bold text-sm leading-none select-none">─</span>,
        keywords: ['divider', 'hr', 'horizontal rule', 'line', 'separator', 'break'],
        action: (ed) => {
          ed.chain().focus().setHorizontalRule().run();
        },
      },
      {
        id: 'table',
        title: 'Table',
        subtitle: 'Insert 3×3 table grid',
        badge: <span className="text-xs font-medium leading-none select-none">▣</span>,
        keywords: ['table', 'grid', 'cells', 'spreadsheet', 'matrix', 'rows', 'columns'],
        action: (ed) => {
          ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
      },
      {
        id: 'callout',
        title: 'Callout',
        subtitle: 'Highlighted tip or note',
        badge: <span className="text-sm select-none">💡</span>,
        keywords: ['callout', 'highlight', 'tip', 'note', 'alert', 'info', 'warning', 'idea', 'box'],
        action: (ed) => {
          ed.chain()
            .focus()
            .insertContent({
              type: 'callout',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Note or key takeaway...',
                    },
                  ],
                },
              ],
            })
            .run();
        },
      },
      {
        id: 'image',
        title: 'Image',
        subtitle: 'Embed or upload an image',
        badge: <span className="text-sm select-none">🖼</span>,
        keywords: ['image', 'img', 'picture', 'photo', 'upload', 'media'],
        action: () => {
          onOpenImage?.();
        },
      },
      {
        id: 'file',
        title: 'File',
        subtitle: 'Attach a file or document',
        badge: <span className="text-sm select-none">📎</span>,
        keywords: ['file', 'attachment', 'attach', 'document', 'pdf', 'upload'],
        action: () => {
          onOpenFile?.();
        },
      },
      {
        id: 'ai',
        title: 'AI',
        subtitle: 'livo contextual AI actions',
        badge: <span className="text-indigo-600 font-bold text-sm select-none">✦</span>,
        keywords: ['ai', 'livo', 'gemini', 'assistant', 'ask', 'sparkles', 'generate', 'write', 'prompt'],
        action: () => {
          onOpenAI?.();
        },
      },
    ],
    [onOpenAI, onOpenImage, onOpenFile]
  );

  // Filter commands matching current query
  const filteredCommands = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return commands;
    return commands.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(trimmed) ||
        cmd.id.toLowerCase().includes(trimmed) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(trimmed))
      );
    });
  }, [commands, query]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, isOpen]);

  // Execute selected command
  const executeCommand = useCallback(
    (item: SlashCommandItem) => {
      if (!editor || !slashRange) return;

      // First delete the slash and any query text typed
      editor
        .chain()
        .focus()
        .deleteRange({ from: slashRange.from, to: slashRange.to })
        .run();

      // Close menu immediately
      setIsOpen(false);
      setQuery('');
      setSlashRange(null);
      setDismissedSlashPos(null);

      // Execute action
      item.action(editor);
    },
    [editor, slashRange]
  );

  // Calculate coordinates near cursor
  const updatePosition = useCallback(() => {
    if (!editor || !slashRange) return;
    try {
      const coords = editor.view.coordsAtPos(slashRange.from);
      if (!coords) return;

      const menuWidth = 280;
      const menuHeight = 340;
      const offset = 8;
      const screenPadding = 16;

      let left = coords.left;
      let top = coords.bottom + offset;

      // Horizontal clamping
      if (left + menuWidth > window.innerWidth - screenPadding) {
        left = window.innerWidth - menuWidth - screenPadding;
      }
      if (left < screenPadding) {
        left = screenPadding;
      }

      // Vertical positioning (flip above cursor if near bottom of viewport)
      if (top + menuHeight > window.innerHeight - screenPadding) {
        top = Math.max(screenPadding, coords.top - menuHeight - offset);
      }

      setMenuPosition({
        top: Math.round(top),
        left: Math.round(left),
      });
    } catch {
      // Ignore coordinate calculation errors during document transitions
    }
  }, [editor, slashRange]);

  // Check document state for slash command triggers
  const checkSlashCommand = useCallback(() => {
    if (!editor || editor.isDestroyed) {
      setIsOpen(false);
      return;
    }

    const { state } = editor;
    const { selection } = state;
    const { from, to, empty } = selection;

    // Only active on collapsed cursor
    if (!empty || from !== to) {
      setIsOpen(false);
      return;
    }

    const $from = selection.$from;
    const parent = $from.parent;

    // Do NOT trigger inside codeBlock or table headers/cells where / may be syntax
    if (parent.type.name === 'codeBlock') {
      setIsOpen(false);
      return;
    }

    // Get text in current block prior to cursor
    const textBeforeCursor = parent.textBetween(0, $from.parentOffset, undefined, '\ufffc');
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');

    if (lastSlashIndex === -1) {
      setIsOpen(false);
      setDismissedSlashPos(null);
      return;
    }

    // Must be either at start of line OR preceded by whitespace
    const isAtStart = lastSlashIndex === 0;
    const isPrecededByWhitespace = !isAtStart && /\s/.test(textBeforeCursor[lastSlashIndex - 1]);

    if (!isAtStart && !isPrecededByWhitespace) {
      setIsOpen(false);
      return;
    }

    const currentQuery = textBeforeCursor.slice(lastSlashIndex + 1);

    // Query must not contain whitespace (typing a space closes the slash command)
    if (/\s/.test(currentQuery)) {
      setIsOpen(false);
      return;
    }

    const currentSlashPos = $from.start() + lastSlashIndex;
    const currentCursorPos = $from.pos;

    // If dismissed explicitly by Escape, don't reopen until cursor leaves this position
    if (dismissedSlashPos === currentSlashPos) {
      setIsOpen(false);
      return;
    }

    setSlashRange({ from: currentSlashPos, to: currentCursorPos });
    setQuery(currentQuery);
    setIsOpen(true);
  }, [editor, dismissedSlashPos]);

  // Position update on range changes and window events
  useEffect(() => {
    if (isOpen && slashRange) {
      updatePosition();
    }
  }, [isOpen, slashRange, updatePosition]);

  // Subscribe to editor transactions and selection updates
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      checkSlashCommand();
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        updatePosition();
      }
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [editor, isOpen, checkSlashCommand, updatePosition]);

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

  // Keyboard navigation handler connected to Tiptap editorProps
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): boolean => {
      if (!isOpen) return false;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
        return true;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0
        );
        return true;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (filteredCommands.length > 0 && filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
          return true;
        }
        return false;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        if (slashRange) {
          setDismissedSlashPos(slashRange.from);
        }
        return true;
      }

      return false;
    },
    [isOpen, filteredCommands, selectedIndex, executeCommand, slashRange]
  );

  // Register keyboard handler with parent Tiptap editor
  useEffect(() => {
    if (registerKeyDownHandler) {
      registerKeyDownHandler(handleKeyDown);
    }
  }, [registerKeyDownHandler, handleKeyDown]);

  if (!isOpen || !editor) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      id="tiptap-slash-command-menu"
      role="menu"
      aria-label="Slash commands menu"
      className="fixed z-50 w-72 bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-xl shadow-stone-900/10 overflow-hidden flex flex-col text-stone-800 animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
      }}
      onMouseDown={(e) => {
        // Prevent editor blur on menu container clicks
        e.stopPropagation();
      }}
    >
      {/* Header matching example: 'Add to your note' */}
      <div className="px-3.5 pt-3 pb-1.5 border-b border-stone-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 select-none">
          Add to your note
        </span>
        {query && (
          <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
            /{query}
          </span>
        )}
      </div>

      {/* Commands List */}
      <div className="py-1 max-h-72 overflow-y-auto overscroll-contain">
        {filteredCommands.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-stone-400">
            <p>No matching commands for &ldquo;{query}&rdquo;</p>
            <p className="text-[10px] text-stone-300 mt-1">Press Esc to dismiss</p>
          </div>
        ) : (
          filteredCommands.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                id={`slash-cmd-${item.id}`}
                type="button"
                role="menuitem"
                tabIndex={isSelected ? 0 : -1}
                data-selected={isSelected}
                onMouseDown={(e) => {
                  // Prevent editor from losing focus before executing
                  e.preventDefault();
                }}
                onClick={() => executeCommand(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-[calc(100%-8px)] mx-1 flex items-center justify-between px-2.5 py-1.5 my-0.5 rounded-lg text-left transition-colors cursor-pointer group ${
                  isSelected
                    ? 'bg-indigo-50/80 text-stone-900 font-medium'
                    : 'text-stone-700 hover:bg-stone-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge Column: H1, H2, •, 1., ☑, ", </>, ─, ▣, 💡, 🖼, 📎, ✦ */}
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-white text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'bg-stone-100 text-stone-600 border border-stone-200/60 group-hover:bg-white group-hover:text-stone-800'
                    }`}
                  >
                    {item.badge}
                  </div>

                  {/* Text Column: Title and Subtitle */}
                  <div className="min-w-0">
                    <div
                      className={`text-xs truncate ${
                        isSelected ? 'text-indigo-950 font-semibold' : 'text-stone-800'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate leading-tight">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Subtle trigger hint */}
                <div className="text-[10px] text-stone-300 font-mono pl-2 shrink-0 select-none">
                  /{item.id.replace('heading-', 'h')}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Navigation Hints */}
      <div className="px-3 py-1.5 bg-stone-50/90 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 select-none">
        <span className="flex items-center gap-1">
          <kbd className="font-mono bg-stone-200/70 text-stone-600 px-1 py-0.2 rounded text-[9px]">↑↓</kbd>
          <span>navigate</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="font-mono bg-stone-200/70 text-stone-600 px-1 py-0.2 rounded text-[9px]">↵</kbd>
          <span>select</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="font-mono bg-stone-200/70 text-stone-600 px-1 py-0.2 rounded text-[9px]">esc</kbd>
          <span>close</span>
        </span>
      </div>
    </div>
  );
}
