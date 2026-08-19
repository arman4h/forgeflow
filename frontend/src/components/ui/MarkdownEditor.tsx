import React, { useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Quote, Code, Link, Image, Table, Undo, Redo,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
}

function insertText(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = '',
  placeholderText: string = ''
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = selected || placeholderText;
  const newText =
    textarea.value.substring(0, start) +
    before +
    replacement +
    after +
    textarea.value.substring(end);
  return { newText, cursorPos: start + before.length + replacement.length };
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your description in Markdown...',
  rows = 6,
  className,
  label,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAction = useCallback(
    (action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();

      let result;
      switch (action) {
        case 'bold':
          result = insertText(ta, '**', '**', 'bold text');
          break;
        case 'italic':
          result = insertText(ta, '_', '_', 'italic text');
          break;
        case 'h1':
          result = insertText(ta, '# ', '', 'Heading 1');
          break;
        case 'h2':
          result = insertText(ta, '## ', '', 'Heading 2');
          break;
        case 'ul':
          result = insertText(ta, '- ', '', 'List item');
          break;
        case 'ol':
          result = insertText(ta, '1. ', '', 'List item');
          break;
        case 'quote':
          result = insertText(ta, '> ', '', 'Quote');
          break;
        case 'code':
          if (ta.value.substring(ta.selectionStart, ta.selectionEnd).includes('\n')) {
            result = insertText(ta, '```\n', '\n```', 'code');
          } else {
            result = insertText(ta, '`', '`', 'code');
          }
          break;
        case 'link':
          result = insertText(ta, '[', '](url)', 'link text');
          break;
        case 'image':
          result = insertText(ta, '![', '](url)', 'alt text');
          break;
        case 'table':
          result = insertText(
            ta,
            '\n| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |\n',
            '',
            ''
          );
          break;
        case 'undo':
          document.execCommand('undo');
          return;
        case 'redo':
          document.execCommand('redo');
          return;
        default:
          return;
      }

      if (result) {
        onChange(result.newText);
        requestAnimationFrame(() => {
          ta.selectionStart = result.cursorPos;
          ta.selectionEnd = result.cursorPos;
        });
      }
    },
    [onChange]
  );

  const tools = [
    { icon: Bold, action: 'bold', title: 'Bold' },
    { icon: Italic, action: 'italic', title: 'Italic' },
    { icon: Heading1, action: 'h1', title: 'Heading 1' },
    { icon: Heading2, action: 'h2', title: 'Heading 2' },
    { icon: List, action: 'ul', title: 'Bullet list' },
    { icon: ListOrdered, action: 'ol', title: 'Numbered list' },
    { icon: Quote, action: 'quote', title: 'Blockquote' },
    { icon: Code, action: 'code', title: 'Code' },
    { icon: Link, action: 'link', title: 'Link' },
    { icon: Image, action: 'image', title: 'Image' },
    { icon: Table, action: 'table', title: 'Table' },
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
          {tools.map(tool => (
            <button
              key={tool.action}
              type="button"
              title={tool.title}
              onClick={() => handleAction(tool.action)}
              className="p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <tool.icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
          <button
            type="button"
            title="Undo"
            onClick={() => handleAction('undo')}
            className="p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Redo"
            onClick={() => handleAction('redo')}
            className="p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 bg-transparent placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-y min-h-[80px] font-mono leading-relaxed"
        />
      </div>
    </div>
  );
};
