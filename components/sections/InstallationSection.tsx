'use client';

import { useState } from 'react';
import RichTextEditor from '../RichTextEditor';

interface InstallationSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function InstallationSection({ data, updateData, repoData }: InstallationSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const packageManagers = [
    { name: 'npm', command: 'npm install', icon: '📦' },
    { name: 'yarn', command: 'yarn add', icon: '🧶' },
    { name: 'pnpm', command: 'pnpm add', icon: '📦' },
    { name: 'pip', command: 'pip install', icon: '🐍' },
    { name: 'cargo', command: 'cargo add', icon: '🦀' },
    { name: 'go', command: 'go get', icon: '🐹' },
    { name: 'composer', command: 'composer require', icon: '🐘' },
    { name: 'gem', command: 'gem install', icon: '💎' }
  ];

  const addInstallationMethod = (manager: any) => {
    const newMethod = {
      id: Date.now(),
      manager: manager.name,
      command: `${manager.command} ${repoData?.repoInfo?.name || 'package-name'}`,
      description: `Install using ${manager.name}`
    };
    
    updateData({
      installationMethods: [...(data.installationMethods || []), newMethod]
    });
  };

  const removeInstallationMethod = (id: number) => {
    updateData({
      installationMethods: data.installationMethods.filter((method: any) => method.id !== id)
    });
  };

  const updateInstallationMethod = (id: number, field: string, value: string) => {
    updateData({
      installationMethods: data.installationMethods.map((method: any) => 
        method.id === id ? { ...method, [field]: value } : method
      )
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Installation</h2>
        <p className="text-gray-600 mb-6">Configure how users can install and set up your project.</p>
      </div>

      {/* Enable/Disable Section */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Installation Section</h3>
          <p className="text-sm text-gray-600">Show installation instructions in the README</p>
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
          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <RichTextEditor
              value={data.prerequisites || ''}
              onChange={(value) => updateData({ prerequisites: value })}
              placeholder="List any prerequisites (e.g., Node.js 16+, Python 3.8+)"
              rows={3}
            />
          </div>

          {/* Installation Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Installation Methods
            </label>
            
            {/* Quick Add Package Managers */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {packageManagers.map((manager) => (
                  <button
                    key={manager.name}
                    onClick={() => addInstallationMethod(manager)}
                    className="flex items-center px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <span className="mr-1">{manager.icon}</span>
                    {manager.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Installation Methods */}
            {data.installationMethods && data.installationMethods.length > 0 && (
              <div className="space-y-3">
                {data.installationMethods.map((method: any) => (
                  <div key={method.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{method.manager}</span>
                      <button
                        onClick={() => removeInstallationMethod(method.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      value={method.command}
                      onChange={(e) => updateInstallationMethod(method.id, 'command', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Installation command"
                    />
                    <RichTextEditor
                      value={method.description}
                      onChange={(value) => updateInstallationMethod(method.id, 'description', value)}
                      placeholder="Description"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Environment Setup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment Setup
            </label>
            <RichTextEditor
              value={data.environmentSetup || ''}
              onChange={(value) => updateData({ environmentSetup: value })}
              placeholder="Environment variables, configuration files, etc."
              rows={4}
            />
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <span className="mr-2">{showAdvanced ? '▼' : '▶'}</span>
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Docker Setup */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Docker Setup
                  </label>
                  <RichTextEditor
                    value={data.dockerSetup || ''}
                    onChange={(value) => updateData({ dockerSetup: value })}
                    placeholder="Docker commands and setup instructions"
                    rows={3}
                  />
                </div>

                {/* Development Setup */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Development Setup
                  </label>
                  <RichTextEditor
                    value={data.developmentSetup || ''}
                    onChange={(value) => updateData({ developmentSetup: value })}
                    placeholder="Local development setup instructions"
                    rows={3}
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
                    placeholder="Common installation issues and solutions"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Installation Content
            </label>
            <RichTextEditor
              value={data.content || ''}
              onChange={(value) => updateData({ content: value })}
              placeholder="Add any additional installation instructions or custom content..."
              rows={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              This content will be displayed at the end of the installation section.
            </p>
          </div>
        </>
      )}
    </div>
  );
} 