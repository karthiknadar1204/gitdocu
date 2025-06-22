'use client';

import RichTextEditor from '../RichTextEditor';

interface SupportSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function SupportSection({ data, updateData, repoData }: SupportSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💬 Support</h2>
        <p className="text-gray-600 mb-6">How users can get help and support.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Support Section</h3>
          <p className="text-sm text-gray-600">Show support information in the README</p>
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
          {/* Support Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Channels
            </label>
            <RichTextEditor
              value={data.channels || ''}
              onChange={(value) => updateData({ channels: value })}
              placeholder="GitHub Issues, Discord, Email, etc."
              rows={4}
            />
          </div>

          {/* FAQ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FAQ
            </label>
            <RichTextEditor
              value={data.faq || ''}
              onChange={(value) => updateData({ faq: value })}
              placeholder="Frequently asked questions and answers"
              rows={6}
            />
          </div>

          {/* Troubleshooting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Troubleshooting
            </label>
            <RichTextEditor
              value={data.troubleshooting || ''}
              onChange={(value) => updateData({ troubleshooting: value })}
              placeholder="Common issues and their solutions"
              rows={6}
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Support Content
            </label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateData({ content: value })}
              placeholder="Add any additional support information..."
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
} 