'use client';

import RichTextEditor from '../RichTextEditor';

interface LicenseSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function LicenseSection({ data, updateData, repoData }: LicenseSectionProps) {
  const licenses = [
    { name: 'MIT', description: 'Simple and permissive' },
    { name: 'Apache 2.0', description: 'Patent protection included' },
    { name: 'GPL v3', description: 'Copyleft license' },
    { name: 'BSD 3-Clause', description: 'Simple and permissive' },
    { name: 'ISC', description: 'Simplified BSD' },
    { name: 'Custom', description: 'Custom license text' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 License</h2>
        <p className="text-gray-600 mb-6">Choose the license for your project.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">License Section</h3>
          <p className="text-sm text-gray-600">Show license information in the README</p>
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
          {/* License Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Type
            </label>
            <input
              type="text"
              value={data.licenseType || ''}
              onChange={(e) => updateData({ licenseType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., MIT License, Apache 2.0, GPL-3.0"
            />
          </div>

          {/* License Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Text
            </label>
            <RichTextEditor
              value={data.licenseText || ''}
              onChange={(value) => updateData({ licenseText: value })}
              placeholder="Full license text or reference to license file"
              rows={8}
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom License Content
            </label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateData({ content: value })}
              placeholder="Add any additional license information..."
              rows={6}
            />
          </div>
        </>
      )}
    </div>
  );
} 