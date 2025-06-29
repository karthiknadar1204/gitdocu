'use client';

import { useState } from 'react';

interface MarkdownToolbarProps {
  onInsert: (text: string) => void;
  onFormat: (type: string) => void;
}

export default function MarkdownToolbar({ onInsert, onFormat }: MarkdownToolbarProps) {
  const [showMore, setShowMore] = useState(false);

  const formatOptions = [
    { 
      label: 'Bold', 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      ), 
      action: 'bold', 
      shortcut: 'Ctrl+B' 
    },
    { 
      label: 'Italic', 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
        </svg>
      ), 
      action: 'italic', 
      shortcut: 'Ctrl+I' 
    },
    { 
      label: 'Code', 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      ), 
      action: 'code', 
      shortcut: 'Ctrl+`' 
    },
    { 
      label: 'Link', 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      ), 
      action: 'link', 
      shortcut: 'Ctrl+K' 
    },
    { 
      label: 'List', 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>
      ), 
      action: 'list', 
      shortcut: 'Ctrl+L' 
    },
    { 
      label: 'Quote', 
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
        </svg>
      ), 
      action: 'quote', 
      shortcut: 'Ctrl+Q' 
    },
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
    <div className="border-b border-slate-200 bg-white">
      {/* Basic Formatting */}
      <div className="flex items-center px-4 py-3 space-x-1">
        {formatOptions.slice(0, 4).map((option) => (
          <button
            key={option.action}
            onClick={() => handleFormat(option.action)}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title={`${option.label} (${option.shortcut})`}
          >
            {option.icon}
          </button>
        ))}
        
        <div className="w-px h-6 bg-slate-300 mx-2"></div>
        
        <button
          onClick={() => setShowMore(!showMore)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
            showMore 
              ? 'bg-black text-white shadow-sm' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          {showMore ? '−' : '+'}
        </button>
      </div>

      {/* Advanced Options */}
      {showMore && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 space-y-4">
          {/* Additional Formatting */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Formatting</h4>
            <div className="flex items-center space-x-1">
              {formatOptions.slice(4).map((option) => (
                <button
                  key={option.action}
                  onClick={() => handleFormat(option.action)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title={`${option.label} (${option.shortcut})`}
                >
                  {option.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Insert */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Quick Insert</h4>
            <div className="flex flex-wrap gap-2">
              {insertOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleInsert(option.text)}
                  className="px-3 py-2 text-xs font-medium bg-white text-slate-700 rounded-md hover:bg-slate-50 transition-all duration-150 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
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