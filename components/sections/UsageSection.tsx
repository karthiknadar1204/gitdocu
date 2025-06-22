'use client';

import { useState } from 'react';

interface UsageSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function UsageSection({ data, updateData, repoData }: UsageSectionProps) {
  const [newExample, setNewExample] = useState({ title: '', code: '', description: '' });

  const addExample = () => {
    if (newExample.title.trim() && newExample.code.trim()) {
      updateData({
        examples: [...(data.examples || []), { ...newExample, id: Date.now() }]
      });
      setNewExample({ title: '', code: '', description: '' });
    }
  };

  const removeExample = (id: number) => {
    updateData({
      examples: data.examples.filter((example: any) => example.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Usage & Examples</h2>
        <p className="text-gray-600 mb-6">Show users how to use your project with examples and code snippets.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Usage Section</h3>
          <p className="text-sm text-gray-600">Show usage instructions and examples in the README</p>
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
          {/* Basic Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Usage
            </label>
            <textarea
              value={data.basicUsage || ''}
              onChange={(e) => updateData({ basicUsage: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Simple example of how to use your project"
            />
          </div>

          {/* Code Examples */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Examples
            </label>
            
            {/* Add New Example */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={newExample.title}
                onChange={(e) => setNewExample({ ...newExample, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Example title (e.g., Basic Setup, Advanced Usage)"
              />
              <textarea
                value={newExample.code}
                onChange={(e) => setNewExample({ ...newExample, code: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Code snippet..."
              />
              <textarea
                value={newExample.description}
                onChange={(e) => setNewExample({ ...newExample, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description of what this example does"
              />
              <button
                onClick={addExample}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Example
              </button>
            </div>

            {/* Current Examples */}
            {data.examples && data.examples.length > 0 && (
              <div className="space-y-4">
                {data.examples.map((example: any) => (
                  <div key={example.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{example.title}</h4>
                      <button
                        onClick={() => removeExample(example.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-2">
                      <code>{example.code}</code>
                    </pre>
                    {example.description && (
                      <p className="text-sm text-gray-600">{example.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Options
            </label>
            <textarea
              value={data.configuration || ''}
              onChange={(e) => updateData({ configuration: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Available configuration options and their descriptions"
            />
          </div>

          {/* API Documentation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Documentation
            </label>
            <textarea
              value={data.apiDocs || ''}
              onChange={(e) => updateData({ apiDocs: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="API methods, parameters, and return values"
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Usage Content
            </label>
            <textarea
              value={data.content || ''}
              onChange={(e) => updateData({ content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional usage instructions or custom content..."
            />
          </div>
        </>
      )}
    </div>
  );
} 