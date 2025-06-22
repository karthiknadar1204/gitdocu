'use client';

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
          <p className="text-sm text-gray-600">Show contribution guidelines in the README</p>
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
          {/* How to Contribute */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How to Contribute
            </label>
            <textarea
              value={data.howToContribute || ''}
              onChange={(e) => updateData({ howToContribute: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Step-by-step guide for contributors"
            />
          </div>

          {/* Code Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Style Guidelines
            </label>
            <textarea
              value={data.codeStyle || ''}
              onChange={(e) => updateData({ codeStyle: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Coding standards, formatting rules, linting"
            />
          </div>

          {/* Pull Request Process */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pull Request Process
            </label>
            <textarea
              value={data.prProcess || ''}
              onChange={(e) => updateData({ prProcess: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PR guidelines, review process, merge criteria"
            />
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Contributing Content
            </label>
            <textarea
              value={data.content || ''}
              onChange={(e) => updateData({ content: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional contribution guidelines..."
            />
          </div>
        </>
      )}
    </div>
  );
} 