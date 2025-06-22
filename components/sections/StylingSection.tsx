'use client';

interface StylingSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function StylingSection({ data, updateData, repoData }: StylingSectionProps) {
  const themes = [
    { name: 'default', description: 'Standard GitHub style' },
    { name: 'minimal', description: 'Clean and simple' },
    { name: 'professional', description: 'Corporate style' },
    { name: 'colorful', description: 'Bright and vibrant' },
    { name: 'dark', description: 'Dark theme' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🎨 Styling & Layout</h2>
        <p className="text-gray-600 mb-6">Customize the appearance and layout of your README.</p>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => updateData({ theme: theme.name })}
              className={`p-3 text-left border rounded-lg transition-colors ${
                data.theme === theme.name
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium capitalize">{theme.name}</div>
              <div className="text-sm text-gray-600">{theme.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Layout Options
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showFileTree}
              onChange={(e) => updateData({ showFileTree: e.target.checked })}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Show file tree structure</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showStatistics}
              onChange={(e) => updateData({ showStatistics: e.target.checked })}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Show repository statistics</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showContributors}
              onChange={(e) => updateData({ showContributors: e.target.checked })}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Show contributors section</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showTableOfContents}
              onChange={(e) => updateData({ showTableOfContents: e.target.checked })}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Show table of contents</span>
          </label>
        </div>
      </div>

      {/* Custom CSS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom CSS
        </label>
        <textarea
          value={data.customCSS || ''}
          onChange={(e) => updateData({ customCSS: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Add custom CSS styles..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Note: Custom CSS will only work when the README is viewed in environments that support it.
        </p>
      </div>

      {/* Section Ordering */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Order
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Drag and drop to reorder sections (coming soon)
        </p>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">
            Default order: Basic Info → Installation → Usage → Features → Development → Contributing → License → Support
          </div>
        </div>
      </div>
    </div>
  );
} 