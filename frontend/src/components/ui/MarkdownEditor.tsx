import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import type { MarkdownStorage } from 'tiptap-markdown';
import { cn } from '../../lib/utils';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Quote, Code, Undo, Redo, FileCode,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
}

function getMarkdown(editor: any): string {
  return (editor.storage as any).markdown.getMarkdown();
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your description...',
  className,
  label,
}) => {
  const [markdownMode, setMarkdownMode] = useState(false);
  const [markdownText, setMarkdownText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: false,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(getMarkdown(editor));
    },
    editorProps: {
      attributes: {
        class:
          'tiptap min-h-[120px] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none leading-relaxed',
      },
    },
  });

  useEffect(() => {
    if (editor && !markdownMode) {
      const currentMd = getMarkdown(editor);
      if (currentMd !== value) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor, markdownMode]);

  useEffect(() => {
    if (markdownMode) {
      setMarkdownText(value);
    }
  }, [markdownMode, value]);

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMarkdownText(e.target.value);
      onChange(e.target.value);
    },
    [onChange]
  );

  const toggleMarkdownMode = useCallback(() => {
    if (!editor) return;
    if (!markdownMode) {
      setMarkdownText(getMarkdown(editor));
      setMarkdownMode(true);
    } else {
      setMarkdownMode(false);
      editor.commands.setContent(markdownText || '');
    }
  }, [editor, markdownMode, markdownText]);

  if (!editor) return null;

  const tools = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      icon: Heading1,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
    },
    {
      icon: List,
      title: 'Bullet list',
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: 'Numbered list',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive('blockquote'),
    },
    {
      icon: Code,
      title: 'Inline code',
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive('code'),
    },
  ];

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden focus-within:border-cyan-500 dark:focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-500 dark:focus-within:ring-cyan-400 transition-colors">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-wrap">
          {tools.map((tool) => (
            <button
              key={tool.title}
              type="button"
              title={tool.title}
              onClick={tool.action}
              className={cn(
                'p-1.5 rounded transition-colors cursor-pointer',
                tool.active
                  ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              )}
            >
              <tool.icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          <button
            type="button"
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          <button
            type="button"
            title={markdownMode ? 'Rich text mode' : 'View markdown'}
            onClick={toggleMarkdownMode}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
              markdownMode
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            Markdown
          </button>
        </div>

        {/* Editor */}
        {markdownMode ? (
          <textarea
            ref={textareaRef}
            value={markdownText}
            onChange={handleMarkdownChange}
            placeholder="Write markdown here..."
            className="w-full px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-transparent placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-y min-h-[120px] font-mono leading-relaxed"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
};
