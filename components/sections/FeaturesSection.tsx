'use client';

import { useState } from 'react';
import RichTextEditor from '../RichTextEditor';

interface FeaturesSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function FeaturesSection({ data, updateData, repoData }: FeaturesSectionProps) {
  const [newFeature, setNewFeature] = useState('');
  const [newScreenshot, setNewScreenshot] = useState({ url: '', alt: '', description: '' });

  const addFeature = () => {
    if (newFeature.trim()) {
      updateData({
        features: [...(data.features || []), { id: Date.now(), text: newFeature.trim() }]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (id: number) => {
    updateData({
      features: data.features.filter((feature: any) => feature.id !== id)
    });
  };

  const addScreenshot = () => {
    if (newScreenshot.url.trim()) {
      updateData({
        screenshots: [...(data.screenshots || []), { ...newScreenshot, id: Date.now() }]
      });
      setNewScreenshot({ url: '', alt: '', description: '' });
    }
  };

  const removeScreenshot = (id: number) => {
    updateData({
      screenshots: data.screenshots.filter((screenshot: any) => screenshot.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">✨ Features</h2>
        <p className="text-gray-600 mb-6">Highlight the key features and capabilities of your project.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Features Section</h3>
          <p className="text-sm text-gray-600">Show project features and capabilities in the README</p>
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
          {/* Feature List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feature List
            </label>
            
            {/* Add New Feature */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a feature (e.g., Fast performance, Easy to use)"
              />
              <button
                onClick={addFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current Features */}
            {data.features && data.features.length > 0 && (
              <div className="space-y-2">
                {data.features.map((feature: any) => (
                  <div key={feature.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-green-600">✓</span>
                    <span className="flex-1">{feature.text}</span>
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshots & Demos
            </label>
            
            {/* Add New Screenshot */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <input
                type="url"
                value={newScreenshot.url}
                onChange={(e) => setNewScreenshot({ ...newScreenshot, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Screenshot URL"
              />
              <input
                type="text"
                value={newScreenshot.alt}
                onChange={(e) => setNewScreenshot({ ...newScreenshot, alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alt text"
              />
              <RichTextEditor
                value={newScreenshot.description}
                onChange={(value) => setNewScreenshot({ ...newScreenshot, description: value })}
                placeholder="Description"
                rows={2}
              />
              <button
                onClick={addScreenshot}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Screenshot
              </button>
            </div>

            {/* Current Screenshots */}
            {data.screenshots && data.screenshots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.screenshots.map((screenshot: any) => (
                  <div key={screenshot.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={screenshot.url} 
                      alt={screenshot.alt} 
                      className="w-full h-32 object-cover"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{screenshot.alt}</span>
                        <button
                          onClick={() => removeScreenshot(screenshot.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                      {screenshot.description && (
                        <div className="prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ 
                            __html: screenshot.description
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
                              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
                              .replace(/\n/g, '<br>')
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demo Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demo Links
            </label>
            <RichTextEditor
              value={data.demoLinks || ''}
              onChange={(value) => updateData({ demoLinks: value })}
              placeholder="Live demo URLs, CodeSandbox links, etc."
              rows={3}
            />
          </div>

          {/* Performance Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance & Benchmarks
            </label>
            <RichTextEditor
              value={data.performance || ''}
              onChange={(value) => updateData({ performance: value })}
              placeholder="Performance metrics, benchmarks, speed comparisons"
              rows={4}
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Features Content
            </label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateData({ content: value })}
              placeholder="Add any additional features or custom content..."
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
} 