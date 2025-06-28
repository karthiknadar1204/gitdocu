'use client';

import { useState, useEffect, use } from 'react';
import { analyzeRepository, generateREADME } from '@/lib/ai';
import { githubAPI } from '@/lib/github';
import ReadmeEditor from '@/components/ReadmeEditor';

interface Props {
  params: { username: string; repo: string };
}

export default function RepoPage({ params }: Props) {
  const { username, repo } = use(params);
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>('');
  const [fetchProgress, setFetchProgress] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');

  useEffect(() => {
    const fetchDataAndGenerate = async () => {
      try {
        console.log('🔍 Starting progressive data fetch for:', username, repo);
        setFetchProgress('Fetching repository information...');
        
        // Step 1: Fetch basic repo info
        const basicRepoInfo = await githubAPI.getRepository(username, repo);

        setFetchProgress('Analyzing repository structure...');
        
        // Step 2: Fetch file tree
        const treeData = await githubAPI.getRepositoryTree(username, repo);

        if (!treeData.tree) {
          throw new Error('No files found in repository');
        }

        const fileTree = treeData.tree;
        console.log(`📁 Found ${fileTree.length} files in repo`);

        // Step 3: Identify important files
        const importantFiles = [
          'README.md', 'readme.md', 'package.json', 'requirements.txt', 'Cargo.toml',
          'go.mod', 'pom.xml', 'build.gradle', 'Gemfile', 'composer.json',
          'Dockerfile', 'docker-compose.yml', 'Makefile', 'CMakeLists.txt',
          'index.js', 'index.ts', 'main.js', 'main.ts', 'main.py', 'main.go',
          'app.py', 'app.js', 'app.ts', 'src/main.ts', 'src/main.js',
          'src/index.ts', 'src/index.js', 'lib/main.dart', 'pubspec.yaml',
          'pyproject.toml', 'setup.py', 'build.sh', 'run.sh', 'start.sh'
        ];

        // Enhanced file filtering for large codebases
        const importantFilePaths = fileTree
          .filter((item: any) => item.type === 'blob' && 
            (importantFiles.includes(item.path.split('/').pop()?.toLowerCase() || '') ||
             item.path.startsWith('src/') || item.path.startsWith('lib/') ||
             item.path.startsWith('app/') || item.path.startsWith('components/') ||
             item.path.includes('.md') || item.path.includes('.json') ||
             item.path.includes('.py') || item.path.includes('.js') ||
             item.path.includes('.ts') || item.path.includes('.go') ||
             item.path.includes('.rs') || item.path.includes('.java')))
          .sort((a: any, b: any) => {
            const aImportance = importantFiles.indexOf(a.path.split('/').pop()?.toLowerCase() || '');
            const bImportance = importantFiles.indexOf(b.path.split('/').pop()?.toLowerCase() || '');
            return (bImportance === -1 ? 999 : bImportance) - (aImportance === -1 ? 999 : aImportance);
          })
          .slice(0, 30) // Increased limit for large codebases
          .map((item: any) => item.path);

        console.log(`⭐ Identified ${importantFilePaths.length} important files:`, importantFilePaths);

        // Step 4: Fetch files using the new utility
        setFetchProgress('Fetching important files...');
        const importantFilesContent = await githubAPI.getMultipleFiles(username, repo, importantFilePaths);

        // Step 5: Generate README with AI
        setFetchProgress('Generating README with AI...');
        setAiProcessing(true);

        try {
          const aiAnalysis = await analyzeRepository(
            basicRepoInfo,
            importantFilesContent,
            fileTree
          );

          const generatedREADME = await generateREADME(
            aiAnalysis,
            {},
            basicRepoInfo
          );

          setAiGeneratedContent(generatedREADME);
          setEditedContent(generatedREADME); // Initialize edited content with AI generated content
          setFetchProgress('README generated successfully!');
        } catch (error) {
          console.error('AI generation failed:', error);
          setFetchProgress('AI generation failed, but basic data is available');
        } finally {
          setAiProcessing(false);
        }

        // Set final repo data
        setRepoData({
          fileTree,
          importantFiles: importantFilesContent,
          repoInfo: {
            name: basicRepoInfo.name,
            description: basicRepoInfo.description || '',
            language: basicRepoInfo.language || 'Unknown'
          }
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repo data');
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndGenerate();
  }, [username, repo]);

  const handleExportMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(editedContent || aiGeneratedContent);
      alert('Markdown copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy markdown:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = editedContent || aiGeneratedContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Markdown copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{fetchProgress || 'Loading repository...'}</p>
          {aiProcessing && (
            <p className="mt-2 text-sm text-green-600">🤖 AI is generating your README...</p>
          )}
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
            <p className="text-gray-600">AI-Generated README</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportMarkdown}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Copy Markdown
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Editor */}
      <div className="h-[calc(100vh-80px)]">
        <ReadmeEditor 
          initialContent={aiGeneratedContent}
          onContentChange={setEditedContent}
          repoData={repoData}
        />
      </div>
    </div>
  );
} 