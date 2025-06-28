'use client';

import { useState } from 'react';
import { marked } from 'marked';

interface ReadmePreviewProps {
  customizationData: any;
  repoData: any;
  aiGeneratedContent?: string;
}

export default function ReadmePreview({ aiGeneratedContent }: ReadmePreviewProps) {
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  const renderMarkdown = (markdown: string) => {
    try {
      return marked(markdown, {
        breaks: true,
        gfm: true,
      });
    } catch (error) {
      console.error('Markdown parsing error:', error);
    return markdown;
    }
  };

  if (!aiGeneratedContent) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No README Generated Yet</h3>
        <p className="text-gray-600">The AI is analyzing your repository and will generate a README shortly...</p>
      </div>
    );
    }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI-Generated README</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowRawMarkdown(!showRawMarkdown)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                showRawMarkdown 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showRawMarkdown ? 'Preview' : 'Raw Markdown'}
            </button>
          </div>
        </div>

      {/* Content */}
      <div className="p-6">
          {showRawMarkdown ? (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded-md overflow-x-auto">
            {aiGeneratedContent}
            </pre>
          ) : (
            <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(aiGeneratedContent) }}
          />
        )}
      </div>
    </div>
  );
} 