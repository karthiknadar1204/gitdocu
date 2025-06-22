'use client';

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
        <p className="text-gray-600 mb-6">Information about getting help and support.</p>
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
            <textarea
              value={data.supportChannels || ''}
              onChange={(e) => updateData({ supportChannels: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="GitHub Issues, Discord, Stack Overflow, etc."
            />
          </div>

          {/* FAQ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequently Asked Questions
            </label>
            <textarea
              value={data.faq || ''}
              onChange={(e) => updateData({ faq: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Common questions and answers"
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Support Content
            </label>
            <textarea
              value={data.content || ''}
              onChange={(e) => updateData({ content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional support information..."
            />
          </div>
        </>
      )}
    </div>
  );
} 