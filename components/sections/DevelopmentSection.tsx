'use client';

import { useState } from 'react';
import RichTextEditor from '../RichTextEditor';

interface DevelopmentSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function DevelopmentSection({ data, updateData, repoData }: DevelopmentSectionProps) {
  const [newTech, setNewTech] = useState('');

  const addTech = () => {
    if (newTech.trim()) {
      updateData({
        techStack: [...(data.techStack || []), { id: Date.now(), name: newTech.trim() }]
      });
      setNewTech('');
    }
  };

  const removeTech = (id: number) => {
    updateData({
      techStack: data.techStack.filter((tech: any) => tech.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🛠️ Development</h2>
        <p className="text-gray-600 mb-6">Information for developers working on the project.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Development Section</h3>
          <p className="text-sm text-gray-600">Show development information in the README</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.enabled}
            onChange={(e) => updateData({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {data.enabled && (
        <>
          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            
            {/* Add New Tech */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTech()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add technology (e.g., React, Node.js, TypeScript)"
              />
              <button
                onClick={addTech}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current Tech Stack */}
            {data.techStack && data.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.techStack.map((tech: any) => (
                  <span
                    key={tech.id}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech.name}
                    <button
                      onClick={() => removeTech(tech.id)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Architecture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Architecture Overview
            </label>
            <RichTextEditor
              value={data.architecture || ''}
              onChange={(value) => updateData({ architecture: value })}
              placeholder="Describe the project architecture, design patterns, etc."
              rows={4}
            />
          </div>

          {/* Development Commands */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Development Commands
            </label>
            <RichTextEditor
              value={data.commands || ''}
              onChange={(value) => updateData({ commands: value })}
              placeholder={`# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test`}
              rows={6}
            />
          </div>

          {/* Testing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testing
            </label>
            <RichTextEditor
              value={data.testing || ''}
              onChange={(value) => updateData({ testing: value })}
              placeholder="Testing framework, coverage, how to run tests"
              rows={4}
            />
          </div>

          {/* Build Process */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Build Process
            </label>
            <RichTextEditor
              value={data.buildProcess || ''}
              onChange={(value) => updateData({ buildProcess: value })}
              placeholder="CI/CD pipeline, deployment process, build steps"
              rows={4}
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Development Content
            </label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateData({ content: value })}
              placeholder="Add any additional development information..."
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
} 