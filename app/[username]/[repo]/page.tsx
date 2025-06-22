'use client';

import { useState, useEffect, use } from 'react';
import { getRepoData } from '@/lib/github';
import { analyzeRepository, generateREADME } from '@/lib/ai';
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
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>('');
  const [fetchProgress, setFetchProgress] = useState<string>('');
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
    const fetchDataAndGenerate = async () => {
      try {
        console.log('🔍 Starting progressive data fetch for:', username, repo);
        setFetchProgress('Fetching repository information...');
        
        // Step 1: Fetch basic repo info first
        const basicRepoInfo = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitDoc-App'
          }
        }).then(res => res.json());

        // Update customization data with basic info immediately
        setCustomizationData(prev => ({
          ...prev,
          basicInfo: {
            ...prev.basicInfo,
            title: basicRepoInfo.name,
            description: basicRepoInfo.description || '',
            author: {
              ...prev.basicInfo.author,
              name: username,
              github: `https://github.com/${username}`
            }
          }
        }));

        setFetchProgress('Analyzing repository structure...');
        
        // Step 2: Fetch file tree
        const treeResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/trees/main?recursive=1`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitDoc-App'
          }
        });
        const treeData = await treeResponse.json();

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
          'src/index.ts', 'src/index.js', 'lib/main.dart', 'pubspec.yaml'
        ];

        const importantFilePaths = fileTree
          .filter((item: any) => item.type === 'blob' && 
            (importantFiles.includes(item.path.split('/').pop()?.toLowerCase() || '') ||
             item.path.startsWith('src/') || item.path.startsWith('lib/') ||
             item.path.includes('.md') || item.path.includes('.json')))
          .sort((a: any, b: any) => {
            const aImportance = importantFiles.indexOf(a.path.split('/').pop()?.toLowerCase() || '');
            const bImportance = importantFiles.indexOf(b.path.split('/').pop()?.toLowerCase() || '');
            return (bImportance === -1 ? 999 : bImportance) - (aImportance === -1 ? 999 : aImportance);
          })
          .slice(0, 8) // Limit to 8 most important files
          .map((item: any) => item.path);

        console.log(`⭐ Identified ${importantFilePaths.length} important files:`, importantFilePaths);

        // Step 4: Fetch files progressively and generate README
        const importantFilesContent: { [key: string]: string } = {};
        let filesProcessed = 0;

        for (const filePath of importantFilePaths) {
          setFetchProgress(`Analyzing ${filePath}... (${filesProcessed + 1}/${importantFilePaths.length})`);
          
          try {
            const fileResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filePath}`, {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitDoc-App'
              }
            });
            
            if (fileResponse.ok) {
              const fileData = await fileResponse.json();
              if (fileData.content && fileData.encoding === 'base64') {
                const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
                importantFilesContent[filePath] = content;
                console.log(`✅ Fetched: ${filePath} (${content.length} chars)`);
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch ${filePath}:`, error);
          }

          filesProcessed++;
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Step 5: Generate README with AI as soon as we have enough data
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
            customizationData,
            basicRepoInfo
          );

          setAiGeneratedContent(generatedREADME);

          // Auto-populate customization data with AI insights
          setCustomizationData(prev => ({
            ...prev,
            basicInfo: {
              ...prev.basicInfo,
              description: aiAnalysis.projectDescription || prev.basicInfo.description,
              tags: aiAnalysis.techStack.length > 0 ? aiAnalysis.techStack : prev.basicInfo.tags
            },
            sections: {
              ...prev.sections,
              installation: {
                ...prev.sections.installation,
                content: aiAnalysis.installationCommands.length > 0 
                  ? aiAnalysis.installationCommands.join('\n') 
                  : prev.sections.installation.content
              },
              usage: {
                ...prev.sections.usage,
                content: aiAnalysis.usageExamples.length > 0 
                  ? aiAnalysis.usageExamples.join('\n\n') 
                  : prev.sections.usage.content
              },
              features: {
                ...prev.sections.features,
                content: aiAnalysis.features.length > 0 
                  ? aiAnalysis.features.map((f: string) => `- ${f}`).join('\n') 
                  : prev.sections.features.content
              },
              development: {
                ...prev.sections.development,
                content: aiAnalysis.developmentSetup || prev.sections.development.content
              }
            }
          }));

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

  const handleAIGenerate = async () => {
    if (!repoData) return;

    setAiProcessing(true);
    try {
      console.log('🤖 Starting AI analysis...');
      
      const aiAnalysis = await analyzeRepository(
        repoData.repoInfo,
        repoData.importantFiles,
        repoData.fileTree
      );
      
      console.log('✅ AI analysis completed:', aiAnalysis);

      const generatedREADME = await generateREADME(
        aiAnalysis,
        customizationData,
        repoData.repoInfo
      );

      console.log('✅ AI README generation completed');
      setAiGeneratedContent(generatedREADME);

      setCustomizationData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          title: aiAnalysis.projectDescription ? prev.basicInfo.title : repoData.repoInfo.name,
          description: aiAnalysis.projectDescription || prev.basicInfo.description,
          tags: aiAnalysis.techStack.length > 0 ? aiAnalysis.techStack : prev.basicInfo.tags
        },
        sections: {
          ...prev.sections,
          installation: {
            ...prev.sections.installation,
            content: aiAnalysis.installationCommands.length > 0 
              ? aiAnalysis.installationCommands.join('\n') 
              : prev.sections.installation.content
          },
          usage: {
            ...prev.sections.usage,
            content: aiAnalysis.usageExamples.length > 0 
              ? aiAnalysis.usageExamples.join('\n\n') 
              : prev.sections.usage.content
          },
          features: {
            ...prev.sections.features,
            content: aiAnalysis.features.length > 0 
              ? aiAnalysis.features.map((f: string) => `- ${f}`).join('\n') 
              : prev.sections.features.content
          },
          development: {
            ...prev.sections.development,
            content: aiAnalysis.developmentSetup || prev.sections.development.content
          }
        }
      }));

    } catch (err) {
      console.error('❌ AI processing error:', err);
      setError('Failed to generate README with AI');
    } finally {
      setAiProcessing(false);
    }
  };

  const generateMarkdownContent = () => {
    // Use AI generated content if available, otherwise generate from customization data
    if (aiGeneratedContent) {
      return aiGeneratedContent;
    }

    let markdown = '';

    // Title and Logo
    if (customizationData.basicInfo.logo) {
      markdown += `![${customizationData.basicInfo.title || 'Logo'}](${customizationData.basicInfo.logo})\n\n`;
    }

    // Main Title
    if (customizationData.basicInfo.title) {
      markdown += `# ${customizationData.basicInfo.title}\n\n`;
    }

    // Badges
    if (customizationData.basicInfo.badges && customizationData.basicInfo.badges.length > 0) {
      markdown += customizationData.basicInfo.badges
        .map((badge: any) => `![${badge.alt || 'Badge'}](${badge.url})`)
        .join(' ') + '\n\n';
    }

    // Description
    if (customizationData.basicInfo.description) {
      markdown += `${customizationData.basicInfo.description}\n\n`;
    }

    // Tags
    if (customizationData.basicInfo.tags && customizationData.basicInfo.tags.length > 0) {
      markdown += `**Tags:** ${customizationData.basicInfo.tags.map((tag: string) => `\`${tag}\``).join(', ')}\n\n`;
    }

    // Get section order
    const sectionOrder = customizationData.sectionOrder || [
      'installation', 'usage', 'features', 'development', 'contributing', 'license', 'support'
    ];

    // Table of Contents
    if (customizationData.styling?.showTableOfContents !== false) {
      markdown += `## 📋 Table of Contents\n\n`;
      sectionOrder.forEach(sectionId => {
        const sectionData = getSectionData(sectionId);
        if (sectionData && sectionData.enabled) {
          const sectionName = getSectionName(sectionId);
          markdown += `- [${sectionName}](#${sectionId.toLowerCase().replace(/\s+/g, '-')})\n`;
        }
      });
      markdown += '\n';
    }

    // Generate sections
    sectionOrder.forEach(sectionId => {
      const sectionMarkdown = generateSectionMarkdown(sectionId);
      if (sectionMarkdown) {
        markdown += sectionMarkdown;
      }
    });

    // Author Information
    if (customizationData.basicInfo.author && customizationData.basicInfo.author.name) {
      markdown += `## 👨‍💻 Author\n\n`;
      markdown += `**${customizationData.basicInfo.author.name}**\n\n`;
      
      const authorLinks = [];
      if (customizationData.basicInfo.author.github) authorLinks.push(`[GitHub](${customizationData.basicInfo.author.github})`);
      if (customizationData.basicInfo.author.twitter) authorLinks.push(`[Twitter](${customizationData.basicInfo.author.twitter})`);
      if (customizationData.basicInfo.author.website) authorLinks.push(`[Website](${customizationData.basicInfo.author.website})`);
      if (customizationData.basicInfo.author.email) authorLinks.push(`[Email](mailto:${customizationData.basicInfo.author.email})`);
      
      if (authorLinks.length > 0) {
        markdown += authorLinks.join(' • ') + '\n\n';
      }
    }

    return markdown;
  };

  const getSectionData = (sectionId: string) => {
    if (!customizationData.sections) return null;
    
    switch (sectionId) {
      case 'installation':
        return customizationData.sections.installation;
      case 'usage':
        return customizationData.sections.usage;
      case 'features':
        return customizationData.sections.features;
      case 'development':
        return customizationData.sections.development;
      case 'contributing':
        return customizationData.sections.contributing;
      case 'license':
        return customizationData.sections.license;
      case 'support':
        return customizationData.sections.support;
      default:
        return null;
    }
  };

  const getSectionName = (sectionId: string) => {
    const names: Record<string, string> = {
      installation: 'Installation',
      usage: 'Usage',
      features: 'Features',
      development: 'Development',
      contributing: 'Contributing',
      license: 'License',
      support: 'Support'
    };
    return names[sectionId] || sectionId;
  };

  const generateSectionMarkdown = (sectionId: string) => {
    const sectionData = getSectionData(sectionId);
    if (!sectionData || !sectionData.enabled) return '';

    let sectionMarkdown = '';

    switch (sectionId) {
      case 'installation':
        sectionMarkdown += `## ⚙️ Installation\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `\`\`\`bash\nnpm install ${repoData?.name || 'package-name'}\n\`\`\`\n\n`;
        }
        break;

      case 'usage':
        sectionMarkdown += `## 🚀 Usage\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `\`\`\`javascript\nimport { something } from '${repoData?.name || 'package-name'}';\n\`\`\`\n\n`;
        }
        break;

      case 'features':
        sectionMarkdown += `## ✨ Features\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `- Feature 1\n- Feature 2\n- Feature 3\n\n`;
        }
        break;

      case 'development':
        sectionMarkdown += `## 🛠️ Development\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `\`\`\`bash\n# Clone the repository\ngit clone https://github.com/${repoData?.owner?.login || 'username'}/${repoData?.name || 'repo'}\n\n# Install dependencies\nnpm install\n\n# Run development server\nnpm run dev\n\`\`\`\n\n`;
        }
        break;

      case 'contributing':
        sectionMarkdown += `## 🤝 Contributing\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
        }
        break;

      case 'license':
        sectionMarkdown += `## 📄 License\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n`;
        }
        break;

      case 'support':
        sectionMarkdown += `## 💬 Support\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `If you have any questions or need help, please open an issue on GitHub.\n\n`;
        }
        break;
    }

    return sectionMarkdown;
  };

  const handleExportMarkdown = async () => {
    const markdownContent = generateMarkdownContent();
    
    try {
      await navigator.clipboard.writeText(markdownContent);
      // You could add a toast notification here
      alert('Markdown copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy markdown:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = markdownContent;
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
            <p className="text-gray-600">README Generator</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportMarkdown}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
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
            aiGeneratedContent={aiGeneratedContent}
          />
        </div>
      </div>
    </div>
  );
} 