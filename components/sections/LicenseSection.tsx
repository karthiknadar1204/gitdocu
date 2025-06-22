'use client';

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
            <div className="grid grid-cols-2 gap-2">
              {licenses.map((license) => (
                <button
                  key={license.name}
                  onClick={() => updateData({ licenseType: license.name })}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    data.licenseType === license.name
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{license.name}</div>
                  <div className="text-sm text-gray-600">{license.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom License Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License Content
            </label>
            <textarea
              value={data.content || ''}
              onChange={(e) => updateData({ content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="License text or reference to LICENSE file"
            />
          </div>
        </>
      )}
    </div>
  );
} 