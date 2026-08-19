import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  if (!content) return null;

  return (
    <div
      className={cn(
        'prose prose-xs dark:prose-invert max-w-none',
        'prose-headings:font-bold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100',
        'prose-h1:text-sm prose-h1:mt-4 prose-h1:mb-2',
        'prose-h2:text-xs prose-h2:mt-3 prose-h2:mb-1.5',
        'prose-h3:text-[11px] prose-h3:mt-2 prose-h3:mb-1',
        'prose-p:text-xs prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed',
        'prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:text-xs',
        'prose-em:text-zinc-700 dark:prose-em:text-zinc-300',
        'prose-code:text-cyan-600 dark:prose-code:text-cyan-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:rounded-md prose-pre:text-[11px]',
        'prose-blockquote:border-l-cyan-500 dark:prose-blockquote:border-l-cyan-400 prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-950 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-md',
        'prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400 prose-blockquote:not-italic',
        'prose-ul:text-xs prose-ol:text-xs prose-li:text-zinc-700 dark:prose-li:text-zinc-300',
        'prose-li:marker:text-cyan-500 dark:prose-li:marker:text-cyan-400',
        'prose-table:text-xs',
        'prose-th:text-[11px] prose-th:font-semibold prose-th:text-zinc-700 dark:prose-th:text-zinc-300 prose-th:bg-zinc-50 dark:prose-th:bg-zinc-900 prose-th:px-2.5 prose-th:py-1.5 prose-th:border prose-th:border-zinc-200 dark:prose-th:border-zinc-800',
        'prose-td:text-xs prose-td:text-zinc-600 dark:prose-td:text-zinc-400 prose-td:px-2.5 prose-td:py-1.5 prose-td:border prose-td:border-zinc-200 dark:prose-td:border-zinc-800',
        'prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800',
        'prose-img:rounded-md prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800',
        'prose-td:first:text-zinc-900 dark:prose-td:first:text-zinc-100 prose-td:first:font-medium',
        className
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};
