'use client';

import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

interface CommandOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter text...", 
  rows = 4,
  className = ""
}: RichTextEditorProps) {
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slashCommandsRef = useRef<HTMLDivElement>(null);

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'codeblock':
        insertText('```\n', '\n```');
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          insertText('[', `](${url})`);
        }
        break;
      case 'image':
        const imageUrl = prompt('Enter image URL:');
        const altText = prompt('Enter alt text:');
        if (imageUrl) {
          insertText(`![${altText || 'Image'}](${imageUrl})`);
        }
        break;
      case 'list':
        insertText('- ');
        break;
      case 'numbered-list':
        insertText('1. ');
        break;
      case 'quote':
        insertText('> ');
        break;
      case 'heading1':
        insertText('# ');
        break;
      case 'heading2':
        insertText('## ');
        break;
      case 'heading3':
        insertText('### ');
        break;
      case 'hr':
        insertText('\n---\n');
        break;
      case 'table':
        insertText('\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n');
        break;
    }
  };

  const commandOptions: CommandOption[] = [
    {
      id: 'bold',
      title: 'Bold',
      description: 'Make text bold',
      icon: '🔤',
      color: 'bg-blue-500',
      action: () => formatText('bold')
    },
    {
      id: 'italic',
      title: 'Italic',
      description: 'Make text italic',
      icon: '📝',
      color: 'bg-purple-500',
      action: () => formatText('italic')
    },
    {
      id: 'code',
      title: 'Inline Code',
      description: 'Add inline code',
      icon: '💻',
      color: 'bg-gray-600',
      action: () => formatText('code')
    },
    {
      id: 'codeblock',
      title: 'Code Block',
      description: 'Add a code block',
      icon: '📦',
      color: 'bg-indigo-500',
      action: () => formatText('codeblock')
    },
    {
      id: 'link',
      title: 'Link',
      description: 'Add a link',
      icon: '🔗',
      color: 'bg-green-500',
      action: () => formatText('link')
    },
    {
      id: 'image',
      title: 'Image',
      description: 'Add an image',
      icon: '🖼️',
      color: 'bg-pink-500',
      action: () => formatText('image')
    },
    {
      id: 'list',
      title: 'Bullet List',
      description: 'Create a bullet list',
      icon: '•',
      color: 'bg-orange-500',
      action: () => formatText('list')
    },
    {
      id: 'numbered-list',
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: '1.',
      color: 'bg-teal-500',
      action: () => formatText('numbered-list')
    },
    {
      id: 'quote',
      title: 'Quote',
      description: 'Add a quote block',
      icon: '💬',
      color: 'bg-yellow-500',
      action: () => formatText('quote')
    },
    {
      id: 'heading1',
      title: 'Heading 1',
      description: 'Add a large heading',
      icon: 'H1',
      color: 'bg-red-500',
      action: () => formatText('heading1')
    },
    {
      id: 'heading2',
      title: 'Heading 2',
      description: 'Add a medium heading',
      icon: 'H2',
      color: 'bg-red-400',
      action: () => formatText('heading2')
    },
    {
      id: 'heading3',
      title: 'Heading 3',
      description: 'Add a small heading',
      icon: 'H3',
      color: 'bg-red-300',
      action: () => formatText('heading3')
    },
    {
      id: 'hr',
      title: 'Divider',
      description: 'Add a horizontal line',
      icon: '—',
      color: 'bg-gray-500',
      action: () => formatText('hr')
    },
    {
      id: 'table',
      title: 'Table',
      description: 'Create a table',
      icon: '📊',
      color: 'bg-cyan-500',
      action: () => formatText('table')
    }
  ];

  const filteredCommands = commandOptions.filter(cmd =>
    cmd.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Check for slash command
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastLine = textBeforeCursor.split('\n').pop() || '';
    
    if (lastLine.startsWith('/')) {
      const query = lastLine.substring(1);
      setSlashQuery(query);
      setShowSlashCommands(true);
      setSelectedCommandIndex(0);
      // Calculate the start position of the slash command
      const slashStart = cursorPos - query.length - 1;
      setCursorPosition({ start: slashStart, end: cursorPos });
    } else {
      setShowSlashCommands(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          executeCommand(filteredCommands[selectedCommandIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSlashCommands(false);
      }
    }
  };

  const executeCommand = (command: CommandOption) => {
    // Get the current value and cursor position
    const currentValue = value;
    const currentCursorPos = textareaRef.current?.selectionStart || 0;
    
    // Find the slash command by looking backwards from cursor
    let slashStart = -1;
    let slashEnd = currentCursorPos;
    
    // Look backwards from cursor to find the start of the slash command
    for (let i = currentCursorPos - 1; i >= 0; i--) {
      if (currentValue[i] === '\n') {
        break;
      }
      if (currentValue[i] === '/') {
        slashStart = i;
        break;
      }
    }
    
    if (slashStart !== -1) {
      // Remove the slash command text completely
      const beforeSlash = currentValue.substring(0, slashStart);
      const afterSlash = currentValue.substring(slashEnd);
      const newValue = beforeSlash + afterSlash;
      
      // Update the value first
      onChange(newValue);
      
      // Execute the command after a small delay to ensure the text is updated
      setTimeout(() => {
        command.action();
        
        // Hide slash commands
        setShowSlashCommands(false);
        setSlashQuery('');
        
        // Focus back to textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 10);
    } else {
      // If we can't find the slash, just execute the command
      command.action();
      setShowSlashCommands(false);
      setSlashQuery('');
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Close slash commands when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (slashCommandsRef.current && !slashCommandsRef.current.contains(event.target as Node)) {
        setShowSlashCommands(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none transition-all duration-200"
        />
        
        {/* Slash Commands Dropdown */}
        {showSlashCommands && (
          <div
            ref={slashCommandsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-1 mb-2">Commands</div>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                    index === selectedCommandIndex
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${command.color}`}>
                    {command.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{command.title}</div>
                    <div className="text-xs text-gray-500">{command.description}</div>
                  </div>
                  {index === selectedCommandIndex && (
                    <div className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              {filteredCommands.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No commands found for "{slashQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 