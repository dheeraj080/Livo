'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  Undo,
  Redo,
  Sparkles,
  UploadCloud,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import type { Attachment } from '@/src/types';

export interface TiptapEditorProps {
  noteId?: string;
  contentJson?: Record<string, any> | null;
  initialHtml?: string;
  onChange?: (json: Record<string, any>, plainText: string, html: string) => void;
  onOpenAI?: () => void;
  onSaveManual?: () => void;
  onAttachmentAdded?: (attachment: Attachment) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TiptapEditor({
  noteId,
  contentJson,
  initialHtml,
  onChange,
  onOpenAI,
  onSaveManual,
  onAttachmentAdded,
  disabled = false,
  placeholder = 'Write your thoughts or press "/" for commands...',
}: TiptapEditorProps) {
  // Modal states for inserting links and images
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const uploadAndInsertImageRef = React.useRef<
    (file: File, targetPos?: number) => Promise<void>
  >(() => Promise.resolve());

  // Normalize starting content prioritizing canonical Tiptap JSON
  const initialDocument = contentJson && Object.keys(contentJson).length > 0
    ? contentJson
    : initialHtml || '';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-indigo-600 underline font-medium hover:text-indigo-800 cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4 border border-stone-200 shadow-xs',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-stone-300 my-4 w-full table-auto',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const files = Array.from(event.dataTransfer.files);
          const imageFiles = files.filter((f) => f.type.startsWith('image/'));
          if (imageFiles.length > 0) {
            event.preventDefault();
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            for (const img of imageFiles) {
              uploadAndInsertImageRef.current(img, coordinates?.pos);
            }
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData?.files?.length) {
          const files = Array.from(event.clipboardData.files);
          const imageFiles = files.filter((f) => f.type.startsWith('image/'));
          if (imageFiles.length > 0) {
            event.preventDefault();
            for (const img of imageFiles) {
              uploadAndInsertImageRef.current(img);
            }
            return true;
          }
        }
        return false;
      },
    },
    content: initialDocument,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      const html = editor.getHTML();
      onChange?.(json, text, html);
    },
  });

  // Keep editor content synchronized when active note changes
  useEffect(() => {
    if (!editor) return;

    if (contentJson && Object.keys(contentJson).length > 0) {
      editor.commands.setContent(contentJson, { emitUpdate: false });
    } else if (initialHtml !== undefined) {
      editor.commands.setContent(initialHtml, { emitUpdate: false });
    } else {
      editor.commands.clearContent(false);
    }
  }, [noteId, editor, contentJson, initialHtml]);

  // Keyboard shortcut listener for manual save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSaveManual?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSaveManual]);

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      let formatted = linkUrl.trim();
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `https://${formatted}`;
      }
      editor.chain().focus().setLink({ href: formatted }).run();
    }
    setLinkModalOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const uploadAndInsertImage = useCallback(
    async (file: File, targetPos?: number) => {
      if (!noteId) {
        setUploadError('Please select or create a note before attaching images.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files (JPEG, PNG, GIF, WebP, SVG) are supported.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isImageOnly', 'true');

        const res = await fetch(`/api/notes/${noteId}/attachments`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${res.status}`);
        }

        const attachment: Attachment = await res.json();
        const displayUrl =
          attachment.url ||
          attachment.publicUrl ||
          attachment.presignedUrl ||
          `/api/attachments/${attachment.id}/download`;

        if (editor) {
          if (targetPos !== undefined) {
            editor
              .chain()
              .focus()
              .insertContentAt(targetPos, {
                type: 'image',
                attrs: {
                  src: displayUrl,
                  alt: attachment.filename,
                  title: attachment.filename,
                },
              })
              .run();
          } else {
            editor
              .chain()
              .focus()
              .setImage({
                src: displayUrl,
                alt: attachment.filename,
                title: attachment.filename,
              })
              .run();
          }
        }

        onAttachmentAdded?.(attachment);

        // Reset modal states
        setImageModalOpen(false);
        setSelectedFile(null);
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
          setFilePreviewUrl(null);
        }
      } catch (error: any) {
        console.error('[TiptapEditor] Image upload error:', error);
        setUploadError(error.message || 'Image upload failed.');
      } finally {
        setIsUploading(false);
      }
    },
    [noteId, editor, filePreviewUrl, onAttachmentAdded]
  );

  useEffect(() => {
    uploadAndInsertImageRef.current = uploadAndInsertImage;
  }, [uploadAndInsertImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`File exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setFilePreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadSelectedFile = async () => {
    if (!selectedFile) return;
    await uploadAndInsertImage(selectedFile);
  };

  const handleSetImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageModalOpen(false);
    setImageUrl('');
  }, [editor, imageUrl]);

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-400">
        Initializing Tiptap Editor...
      </div>
    );
  }

  const isTableActive = editor.isActive('table');
  const textLength = editor.getText().length;
  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white">
      {/* Editor Formatting Ribbon */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2 bg-stone-50/75 shrink-0 flex-wrap gap-1">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Bold */}
          <button
            id="editor-btn-bold"
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('bold') ? 'bg-stone-200 text-stone-900 font-bold' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            id="editor-btn-italic"
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('italic') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            id="editor-btn-underline"
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('underline') ? 'bg-stone-200 text-stone-900 font-bold' : ''
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          {/* Strike */}
          <button
            id="editor-btn-strike"
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('strike') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Inline Code */}
          <button
            id="editor-btn-code"
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('code') ? 'bg-stone-200 text-stone-900 font-mono' : ''
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-1" />

          {/* Headings */}
          <button
            id="editor-btn-h1"
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-stone-200 text-stone-900 font-bold' : ''
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            id="editor-btn-h2"
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-stone-200 text-stone-900 font-bold' : ''
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            id="editor-btn-h3"
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-stone-200 text-stone-900 font-bold' : ''
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-1" />

          {/* Bullet List */}
          <button
            id="editor-btn-bullet"
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('bulletList') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Ordered List */}
          <button
            id="editor-btn-ordered"
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('orderedList') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Task List / Checklist */}
          <button
            id="editor-btn-tasklist"
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('taskList') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Task List / Checkbox"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-1" />

          {/* Blockquote */}
          <button
            id="editor-btn-quote"
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('blockquote') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Code Block */}
          <button
            id="editor-btn-codeblock"
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title="Code Block"
          >
            <FileCode className="w-4 h-4" />
          </button>

          {/* Horizontal Rule */}
          <button
            id="editor-btn-hr"
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors"
            title="Divider Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-1" />

          {/* Link */}
          <button
            id="editor-btn-link"
            type="button"
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                setLinkUrl(editor.getAttributes('link').href || '');
                setLinkModalOpen(true);
              }
            }}
            className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
              editor.isActive('link') ? 'bg-stone-200 text-stone-900' : ''
            }`}
            title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          >
            {editor.isActive('link') ? <Unlink className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
          </button>

          {/* Image */}
          <button
            id="editor-btn-image"
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors"
            title="Insert Image by URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Table */}
          <div className="relative">
            <button
              id="editor-btn-table"
              type="button"
              onClick={() => {
                if (!isTableActive) {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                } else {
                  setTableMenuOpen((prev) => !prev);
                }
              }}
              className={`p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors ${
                isTableActive ? 'bg-indigo-100 text-indigo-900' : ''
              }`}
              title={isTableActive ? 'Table Options' : 'Insert Table (3x3)'}
            >
              <TableIcon className="w-4 h-4" />
            </button>

            {/* Table Dropdown Menu when active inside table */}
            {isTableActive && tableMenuOpen && (
              <div
                id="editor-table-menu"
                className="absolute left-0 top-full mt-1 z-30 w-48 bg-white border border-stone-200 rounded-lg shadow-lg py-1 text-xs text-stone-700"
              >
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run();
                    setTableMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-500" />
                  <span>Add Row Below</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run();
                    setTableMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-500" />
                  <span>Add Column Right</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteRow().run();
                    setTableMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Current Row</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run();
                    setTableMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Current Column</span>
                </button>
                <div className="border-t border-stone-200 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setTableMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entire Table</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-stone-300 mx-1" />

          {/* Undo / Redo */}
          <button
            id="editor-btn-undo"
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors disabled:opacity-40"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            id="editor-btn-redo"
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded text-stone-700 hover:bg-stone-200/80 transition-colors disabled:opacity-40"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {onOpenAI && (
          <button
            id="editor-btn-ai-assist"
            type="button"
            onClick={onOpenAI}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Actions</span>
          </button>
        )}
      </div>

      {/* Editor Content Canvas */}
      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl w-full mx-auto">
        <EditorContent
          editor={editor}
          className="prose prose-stone max-w-none focus:outline-hidden min-h-[420px] leading-relaxed text-stone-800"
        />
      </div>

      {/* Footer Metrics */}
      <div className="border-t border-stone-200 px-6 py-2 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500 shrink-0">
        <div className="flex items-center gap-3">
          <span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span>•</span>
          <span>{textLength} characters</span>
          {isTableActive && (
            <>
              <span>•</span>
              <span className="text-indigo-600 font-medium">Table Active</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-400">
          <span>Canonical: Tiptap JSON</span>
          <span>•</span>
          <span>Ctrl+S to save</span>
        </div>
      </div>

      {/* Link Dialog Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md p-5 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-semibold text-stone-900 mb-2">Insert or Edit Link</h4>
            <p className="text-xs text-stone-500 mb-4">
              Enter the target destination URL for the selected text:
            </p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSetLink();
                if (e.key === 'Escape') setLinkModalOpen(false);
              }}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50/75">
              <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Insert Image</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setImageModalOpen(false);
                  setSelectedFile(null);
                  setUploadError(null);
                  if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                  setFilePreviewUrl(null);
                }}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-stone-200 px-5 pt-2 bg-stone-50/40 gap-4">
              <button
                type="button"
                onClick={() => {
                  setImageTab('upload');
                  setUploadError(null);
                }}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  imageTab === 'upload'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload to S3 Storage</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageTab('url');
                  setUploadError(null);
                }}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  imageTab === 'url'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>From Web URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {uploadError && (
                <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {imageTab === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (!file.type.startsWith('image/')) {
                            setUploadError('Only image files (JPEG, PNG, GIF, WebP, SVG) are supported.');
                            return;
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            setUploadError('Image exceeds 10MB limit.');
                            return;
                          }
                          setSelectedFile(file);
                          setFilePreviewUrl(URL.createObjectURL(file));
                          setUploadError(null);
                        }
                      }}
                      className="border-2 border-dashed border-stone-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-indigo-100 flex items-center justify-center text-stone-500 group-hover:text-indigo-600 mb-3 transition-colors">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-stone-800 mb-1">
                        Click to browse or drag & drop an image
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Supports JPEG, PNG, GIF, WebP, SVG (Max 10MB)
                      </span>
                      <span className="text-[10px] text-indigo-600 font-medium mt-2">
                        Stored in S3-compatible storage (MinIO)
                      </span>
                    </div>
                  ) : (
                    <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 flex flex-col items-center">
                      {filePreviewUrl && (
                        <div className="w-full max-h-48 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center mb-3 border border-stone-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={filePreviewUrl}
                            alt="Selected attachment preview"
                            className="max-h-44 w-auto object-contain rounded"
                          />
                        </div>
                      )}
                      <div className="w-full flex items-center justify-between text-xs text-stone-700 px-1">
                        <span className="truncate max-w-[240px] font-medium" title={selectedFile.name}>
                          {selectedFile.name}
                        </span>
                        <span className="text-stone-400 text-[11px] shrink-0">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="w-full mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                            setFilePreviewUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-[11px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
                        >
                          Choose a different image
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 mt-5">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setImageModalOpen(false);
                        setSelectedFile(null);
                        setUploadError(null);
                        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
                        setFilePreviewUrl(null);
                      }}
                      className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!selectedFile || isUploading}
                      onClick={handleUploadSelectedFile}
                      className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to S3...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload & Embed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-stone-500 mb-3">
                    Enter an external image URL to embed directly in your note:
                  </p>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 mb-4"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSetImage();
                      if (e.key === 'Escape') setImageModalOpen(false);
                    }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImageModalOpen(false);
                        setImageUrl('');
                      }}
                      className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!imageUrl.trim()}
                      onClick={handleSetImage}
                      className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Embed Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background Upload Notification Toast */}
      {isUploading && !imageModalOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900/90 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 backdrop-blur-xs border border-stone-800 animate-in fade-in slide-in-from-bottom-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <div className="flex flex-col">
            <span className="font-medium">Uploading attachment</span>
            <span className="text-[10px] text-stone-400">Saving to S3 object storage...</span>
          </div>
        </div>
      )}
    </div>
  );
}
