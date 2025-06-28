'use client';

import { useState } from 'react';

interface MarkdownToolbarProps {
  onInsert: (text: string) => void;
  onFormat: (type: string) => void;
}

export default function MarkdownToolbar({ onInsert, onFormat }: MarkdownToolbarProps) {
  const [showMore, setShowMore] = useState(false);

  const formatOptions = [
    { label: 'Bold', icon: 'B', action: 'bold', shortcut: 'Ctrl+B' },
    { label: 'Italic', icon: 'I', action: 'italic', shortcut: 'Ctrl+I' },
    { label: 'Code', icon: '{}', action: 'code', shortcut: 'Ctrl+`' },
    { label: 'Link', icon: '🔗', action: 'link', shortcut: 'Ctrl+K' },
    { label: 'Image', icon: '🖼️', action: 'image', shortcut: 'Ctrl+Shift+I' },
    { label: 'List', icon: '•', action: 'list', shortcut: 'Ctrl+L' },
    { label: 'Quote', icon: '💬', action: 'quote', shortcut: 'Ctrl+Q' },
  ];

  const insertOptions = [
    { label: 'Badge', text: '![Badge](https://img.shields.io/badge/status-active-green)' },
    { label: 'Table', text: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |' },
    { label: 'Code Block', text: '```\n// Your code here\n```' },
    { label: 'Horizontal Rule', text: '---' },
    { label: 'Checkbox', text: '- [ ] Task item' },
  ];

  const handleFormat = (action: string) => {
    onFormat(action);
  };

  const handleInsert = (text: string) => {
    onInsert(text);
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-2">
      {/* Basic Formatting */}
      <div className="flex items-center space-x-1 mb-2">
        {formatOptions.slice(0, 4).map((option) => (
          <button
            key={option.action}
            onClick={() => handleFormat(option.action)}
            className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            title={`${option.label} (${option.shortcut})`}
          >
            {option.icon}
          </button>
        ))}
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <button
          onClick={() => setShowMore(!showMore)}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          {showMore ? '−' : '+'}
        </button>
      </div>

      {/* Advanced Options */}
      {showMore && (
        <div className="space-y-2">
          {/* Additional Formatting */}
          <div className="flex items-center space-x-1">
            {formatOptions.slice(4).map((option) => (
              <button
                key={option.action}
                onClick={() => handleFormat(option.action)}
                className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title={`${option.label} (${option.shortcut})`}
              >
                {option.icon}
              </button>
            ))}
          </div>

          {/* Quick Insert */}
          <div>
            <span className="text-xs text-gray-600 mr-2">Quick Insert:</span>
            <div className="flex flex-wrap gap-1">
              {insertOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleInsert(option.text)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 