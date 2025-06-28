'use client';

import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import MarkdownToolbar from './MarkdownToolbar';
import DemoPreview from './DemoPreview';

interface ReadmeEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  repoData: any;
}

interface Section {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'demo' | 'code';
  config?: any;
}

export default function ReadmeEditor({ initialContent, onContentChange, repoData }: ReadmeEditorProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isEditing, setIsEditing] = useState(false);

  // Parse initial content into sections
  useEffect(() => {
    if (initialContent) {
      const parsedSections = parseContentToSections(initialContent);
      setSections(parsedSections);
      if (parsedSections.length > 0) {
        setActiveSection(parsedSections[0].id);
      }
    }
  }, [initialContent]);

  // Update parent when content changes
  useEffect(() => {
    const fullContent = sections.map(section => section.content).join('\n\n');
    onContentChange(fullContent);
  }, [sections, onContentChange]);

  const parseContentToSections = (content: string): Section[] => {
    const lines = content.split('\n');
    const sections: Section[] = [];
    let currentSection: Section | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }
        
        // Start new section
        const title = line.replace('## ', '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        currentSection = {
          id,
          title,
          content: '',
          type: 'markdown'
        };
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Add last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }

    return sections;
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const addSection = (type: 'markdown' | 'demo' | 'code' = 'markdown') => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      content: '',
      type
    };
    setSections(prev => [...prev, newSection]);
    setActiveSection(newSection.id);
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    if (activeSection === sectionId) {
      setActiveSection(sections[0]?.id || null);
    }
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    setSections(prev => {
      const newSections = [...prev];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      return newSections;
    });
  };

  const renderMarkdown = (content: string) => {
    try {
      return marked(content, { breaks: true, gfm: true });
    } catch (error) {
      return content;
    }
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'demo':
        return <DemoSection section={section} updateSection={updateSection} />;
      case 'code':
        return <CodeSection section={section} updateSection={updateSection} />;
      default:
        return <MarkdownSection section={section} updateSection={updateSection} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">README Editor</h2>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'edit' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'preview' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showAdvanced ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Section List */}
        <div className={`${showAdvanced ? 'w-64' : 'w-48'} bg-gray-50 border-r border-gray-200 flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Sections</h3>
            {showAdvanced && (
              <div className="space-y-1">
                <button
                  onClick={() => addSection('markdown')}
                  className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Section
                </button>
                <button
                  onClick={() => addSection('demo')}
                  className="w-full px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add Demo
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                  activeSection === section.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {section.title}
                    </span>
                    {section.type !== 'markdown' && (
                      <span className={`px-1 py-0.5 text-xs rounded ${
                        section.type === 'demo' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {section.type}
                      </span>
                    )}
                  </div>
                  {showAdvanced && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Editor/Preview */}
        <div className="flex-1 flex">
          {viewMode === 'edit' && (
            <div className="w-full p-4">
              {activeSection && (
                <div className="h-full">
                  {renderSection(sections.find(s => s.id === activeSection)!)}
                </div>
              )}
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="w-full p-4 overflow-y-auto">
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(sections.map(s => s.content).join('\n\n')) }}
              />
            </div>
          )}

          {viewMode === 'split' && (
            <>
              <div className="w-1/2 p-4 border-r border-gray-200">
                {activeSection && (
                  <div className="h-full">
                    {renderSection(sections.find(s => s.id === activeSection)!)}
                  </div>
                )}
              </div>
              <div className="w-1/2 p-4 overflow-y-auto">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(sections.map(s => s.content).join('\n\n')) }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Markdown Section Component
function MarkdownSection({ section, updateSection }: { section: Section; updateSection: (id: string, updates: Partial<Section>) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormat = (type: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let formattedText = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        newCursorPos = start + 1;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        newCursorPos = start + selectedText.length + 3;
        break;
      case 'image':
        formattedText = `![${selectedText}](image-url)`;
        newCursorPos = start + selectedText.length + 10;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        newCursorPos = start + 2;
        break;
      case 'quote':
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        newCursorPos = start + 2;
        break;
    }

    const newValue = beforeText + formattedText + afterText;
    updateSection(section.id, { content: newValue });

    // Set cursor position after update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos + (selectedText ? selectedText.length : 0));
      }
    }, 0);
  };

  const handleInsert = (text: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(start);

    const newValue = beforeText + text + afterText;
    updateSection(section.id, { content: newValue });

    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + text.length, start + text.length);
      }
    }, 0);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
          className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <MarkdownToolbar onInsert={handleInsert} onFormat={handleFormat} />
            <textarea
              ref={textareaRef}
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              className="flex-1 w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write your markdown content here..."
            />
          </div>
        ) : (
          <div 
            className="prose prose-gray max-w-none h-full overflow-y-auto p-4 border border-gray-200 rounded-md"
            dangerouslySetInnerHTML={{ __html: marked(section.content || '') }}
          />
        )}
      </div>
    </div>
  );
}

// Demo Section Component
function DemoSection({ section, updateSection }: { section: Section; updateSection: (id: string, updates: Partial<Section>) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
          className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Demo Type</label>
          <select
            value={section.config?.type || 'codesandbox'}
            onChange={(e) => updateSection(section.id, { 
              config: { ...section.config, type: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="codesandbox">CodeSandbox</option>
            <option value="stackblitz">StackBlitz</option>
            <option value="live-demo">Live Demo</option>
            <option value="video">Video Demo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Demo URL</label>
          <input
            type="url"
            value={section.config?.url || ''}
            onChange={(e) => updateSection(section.id, { 
              config: { ...section.config, url: e.target.value }
            })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={section.content}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Describe what this demo shows..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {section.config?.url && (
          <div className="border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <DemoPreview 
              type={section.config.type || 'codesandbox'}
              url={section.config.url}
              title={section.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Code Section Component
function CodeSection({ section, updateSection }: { section: Section; updateSection: (id: string, updates: Partial<Section>) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
          className="text-xl font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
        />
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={section.config?.language || 'javascript'}
            onChange={(e) => updateSection(section.id, { 
              config: { ...section.config, language: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
          <textarea
            value={section.content}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Paste your code here..."
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
} 