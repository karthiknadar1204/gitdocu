'use client';

import RichTextEditor from '../RichTextEditor';

interface ContributingSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function ContributingSection({ data, updateData, repoData }: ContributingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🤝 Contributing</h2>
        <p className="text-gray-600 mb-6">Guidelines for contributors to your project.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Contributing Section</h3>
          <p className="text-sm text-gray-600">Show contributing guidelines in the README</p>
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
          {/* Contributing Guidelines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contributing Guidelines
            </label>
            <RichTextEditor
              value={data.guidelines || ''}
              onChange={(value) => updateData({ guidelines: value })}
              placeholder="General guidelines for contributors"
              rows={4}
            />
          </div>

          {/* Development Setup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Development Setup
            </label>
            <RichTextEditor
              value={data.devSetup || ''}
              onChange={(value) => updateData({ devSetup: value })}
              placeholder="How to set up the development environment"
              rows={4}
            />
          </div>

          {/* Code Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Style
            </label>
            <RichTextEditor
              value={data.codeStyle || ''}
              onChange={(value) => updateData({ codeStyle: value })}
              placeholder="Coding standards, formatting rules, etc."
              rows={4}
            />
          </div>

          {/* Pull Request Process */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pull Request Process
            </label>
            <RichTextEditor
              value={data.prProcess || ''}
              onChange={(value) => updateData({ prProcess: value })}
              placeholder="How to submit pull requests, review process, etc."
              rows={4}
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Contributing Content
            </label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateData({ content: value })}
              placeholder="Add any additional contributing information..."
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
} 