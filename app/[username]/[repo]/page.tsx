'use client';

import { useState, useEffect, use } from 'react';
import { getRepoData } from '@/lib/github';
import ReadmeCustomizer from '@/components/ReadmeCustomizer';
import ReadmePreview from '@/components/ReadmePreview';

interface Props {
  params: { username: string; repo: string };
}

export default function RepoPage({ params }: Props) {
  const { username, repo } = use(params);
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customizationData, setCustomizationData] = useState({
    basicInfo: {
      title: '',
      description: '',
      badges: [],
      logo: '',
      tags: [],
      author: {
        name: '',
        email: '',
        website: '',
        github: '',
        twitter: ''
      }
    },
    sections: {
      installation: { enabled: true, content: '' },
      usage: { enabled: true, content: '' },
      features: { enabled: true, content: '' },
      development: { enabled: true, content: '' },
      contributing: { enabled: true, content: '' },
      license: { enabled: true, content: '' },
      support: { enabled: true, content: '' },
      acknowledgments: { enabled: false, content: '' },
      changelog: { enabled: false, content: '' },
      roadmap: { enabled: false, content: '' }
    },
    styling: {
      theme: 'default',
      showFileTree: true,
      showStatistics: true,
      showContributors: true,
      customCSS: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Fetching data for:', username, repo);
        const data = await getRepoData(username, repo);
        setRepoData(data);
        
        // Auto-populate basic info from repo data
        setCustomizationData(prev => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            title: data.repoInfo.name,
            description: data.repoInfo.description || '',
            author: {
              ...prev.basicInfo.author,
              name: username,
              github: `https://github.com/${username}`
            }
          }
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repo data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, repo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Fetching repository data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Repository</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Repository: {username}/{repo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {username}/{repo}
            </h1>
            <p className="text-gray-600">README Generator</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Export Markdown
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Generate README
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Customization */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <ReadmeCustomizer 
            customizationData={customizationData}
            setCustomizationData={setCustomizationData}
            repoData={repoData}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <ReadmePreview 
            customizationData={customizationData}
            repoData={repoData}
          />
        </div>
      </div>
    </div>
  );
} 