'use client';

import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import MarkdownToolbar from './MarkdownToolbar';

interface ReadmeEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  repoData: any;
}

interface Section {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'code';
  config?: any;
}

export default function ReadmeEditor({ initialContent, onContentChange, repoData }: ReadmeEditorProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isEditing, setIsEditing] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);

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

  const addSection = (type: 'markdown' | 'code' = 'markdown') => {
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
      case 'code':
        return <CodeSection section={section} updateSection={updateSection} />;
      default:
        return <MarkdownSection section={section} updateSection={updateSection} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              README Editor
            </h2>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'edit' 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'split' 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'preview' 
                  ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Section List */}
        <div className="w-56 bg-white border-r border-slate-200 flex flex-col shadow-lg">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">
                Sections
              </h3>
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                {sections.length}
              </span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => addSection('markdown')}
                className="w-full px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Add Section
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-4 mb-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  activeSection === section.id 
                    ? 'bg-blue-50 border-2 border-blue-200 shadow-md' 
                    : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${
                      section.type === 'markdown' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-800 truncate block">
                        {section.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {section.type === 'markdown' ? 'Markdown' : 'Code'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(section.id);
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Editor/Preview */}
        <div className="flex-1 flex bg-white/50 backdrop-blur-sm">
          {viewMode === 'edit' && (
            <div className="w-full p-6">
              {activeSection && (
                <div className="h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  {renderSection(sections.find(s => s.id === activeSection)!)}
                </div>
              )}
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="w-full p-6 overflow-y-auto h-full">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 min-h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Preview
                  </h3>
                  <button
                    onClick={() => setShowMarkdown(!showMarkdown)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      showMarkdown 
                        ? 'bg-black text-white shadow-lg' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {showMarkdown ? 'Show Preview' : 'Show Markdown'}
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
                  {showMarkdown ? (
                    <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 p-6 rounded-xl overflow-x-auto border border-slate-200 font-mono">
                      {sections.map(section => section.content).join('\n\n')}
                    </pre>
                  ) : (
                    <div 
                      className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600 prose-code:bg-slate-100 prose-code:text-slate-800"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(sections.map(s => s.content).join('\n\n')) }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'split' && (
            <>
              <div className="w-1/2 p-6">
                {activeSection && (
                  <div className="h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {renderSection(sections.find(s => s.id === activeSection)!)}
                  </div>
                )}
              </div>
              <div className="w-1/2 p-6 overflow-y-auto">
                <div className="h-full bg-white rounded-2xl shadow-xl border border-slate-200">
                  <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Preview
                    </h3>
                    <button
                      onClick={() => setShowMarkdown(!showMarkdown)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        showMarkdown 
                          ? 'bg-black text-white shadow-lg' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {showMarkdown ? 'Show Preview' : 'Show Markdown'}
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {showMarkdown ? (
                      <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 p-6 rounded-xl overflow-x-auto border border-slate-200 font-mono">
                        {sections.map(section => section.content).join('\n\n')}
                      </pre>
                    ) : (
                      <div 
                        className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600 prose-code:bg-slate-100 prose-code:text-slate-800"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(sections.map(s => s.content).join('\n\n')) }}
                      />
                    )}
                  </div>
                </div>
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
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">M</span>
          </div>
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
            className="text-xl font-bold bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 focus:ring-0"
            placeholder="Section Title"
          />
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            isEditing 
              ? 'bg-black text-white shadow-lg' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          {isEditing ? 'Preview' : 'Edit'}
        </button>
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <div className="border-b border-slate-200 bg-slate-50/50">
              <MarkdownToolbar onInsert={handleInsert} onFormat={handleFormat} />
            </div>
            <textarea
              ref={textareaRef}
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              className="flex-1 w-full p-6 border-none focus:ring-0 resize-none text-slate-700 placeholder-slate-400 font-mono text-sm leading-relaxed"
              placeholder="Write your markdown content here... Use the toolbar above for quick formatting!"
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div 
              className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600 prose-code:bg-slate-100 prose-code:text-slate-800 prose-pre:bg-slate-900 prose-pre:text-slate-100"
              dangerouslySetInnerHTML={{ __html: marked(section.content || '') }}
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
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">C</span>
          </div>
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(section.id, { title: e.target.value })}
            className="text-xl font-bold bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 focus:ring-0"
            placeholder="Code Section Title"
          />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Language
          </label>
          <select
            value={section.config?.language || 'javascript'}
            onChange={(e) => updateSection(section.id, { 
              config: { ...section.config, language: e.target.value }
            })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
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

        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Code
          </label>
          <textarea
            value={section.content}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Paste your code here... It will be formatted with syntax highlighting in the preview."
            rows={15}
            className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm bg-slate-50 resize-none"
          />
        </div>
      </div>
    </div>
  );
} 