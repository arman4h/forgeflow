import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const UploadFileModal: React.FC = () => {
  const {
    isUploadFileOpen,
    setIsUploadFileOpen,
    currentSpace,
    addFile,
  } = useApp();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<FileType>('pdf');
  const [size, setSize] = useState('1.5 MB');

  if (!isUploadFileOpen || !currentSpace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFile(
      currentSpace.id,
      name.trim(),
      url.trim() || 'https://example.com/file',
      type,
      type === 'link' ? undefined : size
    );

    setIsUploadFileOpen(false);
    setName('');
    setUrl('');
  };

  return (
    <Modal
      isOpen={isUploadFileOpen}
      onClose={() => setIsUploadFileOpen(false)}
      title="Add File or Link"
      description="Attach documents, slide decks, prototypes, or repository links to this space."
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Resource Type
          </label>
          <select
            value={type}
            onChange={e => setType(e.target.value as FileType)}
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none cursor-pointer"
          >
            <option value="pdf">PDF Document (.pdf)</option>
            <option value="document">Office Document (.docx / .pptx)</option>
            <option value="link">Online Link / Figma / GitHub</option>
            <option value="code">Source Code / SQL Script</option>
            <option value="image">Image Asset</option>
          </select>
        </div>

        <Input
          placeholder="Resource Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
        />

        <Input
          placeholder="URL / Link"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsUploadFileOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim()}
            size="sm"
            variant="default"
          >
            Add Resource
          </Button>
        </div>
      </form>
    </Modal>
  );
};
