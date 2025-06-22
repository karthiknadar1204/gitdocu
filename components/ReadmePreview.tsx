'use client';

import { useState, useMemo } from 'react';
import { marked } from 'marked';

interface ReadmePreviewProps {
  customizationData: any;
  repoData: any;
  aiGeneratedContent?: string;
}

export default function ReadmePreview({ customizationData, repoData, aiGeneratedContent }: ReadmePreviewProps) {
  const [viewMode, setViewMode] = useState<'custom' | 'ai'>('custom');
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  const generateMarkdown = () => {
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

    // Get section order (use custom order if available, otherwise default)
    const sectionOrder = customizationData.sectionOrder || [
      'installation', 'usage', 'features', 'development', 'contributing', 'license', 'support'
    ];

    // Table of Contents (only if enabled)
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

    // Generate sections in custom order
    sectionOrder.forEach(sectionId => {
      const sectionMarkdown = generateSectionMarkdown(sectionId);
      if (sectionMarkdown) {
        markdown += sectionMarkdown;
      }
    });

    // Author Information (always at the end)
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
        
        // Prerequisites
        if (sectionData.prerequisites) {
          sectionMarkdown += `### Prerequisites\n\n${sectionData.prerequisites}\n\n`;
        }
        
        // Installation Methods
        if (sectionData.installationMethods && sectionData.installationMethods.length > 0) {
          sectionMarkdown += `### Installation\n\n`;
          sectionData.installationMethods.forEach((method: any) => {
            sectionMarkdown += `**${method.manager}:**\n\`\`\`bash\n${method.command}\n\`\`\`\n`;
            if (method.description) {
              sectionMarkdown += `${method.description}\n\n`;
            }
          });
        } else if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `\`\`\`bash\nnpm install ${repoData?.name || 'package-name'}\n\`\`\`\n\n`;
        }
        
        // Environment Setup
        if (sectionData.environmentSetup) {
          sectionMarkdown += `### Environment Setup\n\n${sectionData.environmentSetup}\n\n`;
        }
        
        // Docker Setup
        if (sectionData.dockerSetup) {
          sectionMarkdown += `### Docker Setup\n\n${sectionData.dockerSetup}\n\n`;
        }
        
        // Development Setup
        if (sectionData.developmentSetup) {
          sectionMarkdown += `### Development Setup\n\n${sectionData.developmentSetup}\n\n`;
        }
        break;

      case 'usage':
        sectionMarkdown += `## 🚀 Usage\n\n`;
        
        // Basic Usage
        if (sectionData.basicUsage) {
          sectionMarkdown += `### Basic Usage\n\n${sectionData.basicUsage}\n\n`;
        }
        
        // Code Examples
        if (sectionData.examples && sectionData.examples.length > 0) {
          sectionMarkdown += `### Examples\n\n`;
          sectionData.examples.forEach((example: any) => {
            sectionMarkdown += `#### ${example.title}\n\n`;
            sectionMarkdown += `\`\`\`javascript\n${example.code}\n\`\`\`\n\n`;
            if (example.description) {
              sectionMarkdown += `${example.description}\n\n`;
            }
          });
        }
        
        // Configuration Options
        if (sectionData.configuration) {
          sectionMarkdown += `### Configuration\n\n${sectionData.configuration}\n\n`;
        }
        
        // API Documentation
        if (sectionData.apiDocs) {
          sectionMarkdown += `### API Reference\n\n${sectionData.apiDocs}\n\n`;
        }
        
        // Custom Content
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (!sectionData.basicUsage && !sectionData.examples && !sectionData.configuration && !sectionData.apiDocs) {
          sectionMarkdown += `\`\`\`javascript\nimport { something } from '${repoData?.name || 'package-name'}';\n\`\`\`\n\n`;
        }
        break;

      case 'features':
        sectionMarkdown += `## ✨ Features\n\n`;
        
        // Feature List
        if (sectionData.features && sectionData.features.length > 0) {
          sectionData.features.forEach((feature: any) => {
            sectionMarkdown += `- ${feature.text || feature}\n`;
          });
          sectionMarkdown += '\n';
        }
        
        // Screenshots
        if (sectionData.screenshots && sectionData.screenshots.length > 0) {
          sectionMarkdown += `### Screenshots\n\n`;
          sectionData.screenshots.forEach((screenshot: any) => {
            sectionMarkdown += `![${screenshot.alt || 'Screenshot'}](${screenshot.url})\n`;
            if (screenshot.description) {
              sectionMarkdown += `*${screenshot.description}*\n\n`;
            }
          });
        }
        
        // Demo Links
        if (sectionData.demoLinks) {
          sectionMarkdown += `### Demo\n\n${sectionData.demoLinks}\n\n`;
        }
        
        // Performance Metrics
        if (sectionData.performance) {
          sectionMarkdown += `### Performance\n\n${sectionData.performance}\n\n`;
        }
        
        // Custom Content
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (!sectionData.features && !sectionData.screenshots && !sectionData.demoLinks && !sectionData.performance) {
          sectionMarkdown += `- Feature 1\n- Feature 2\n- Feature 3\n\n`;
        }
        break;

      case 'development':
        sectionMarkdown += `## 🛠️ Development\n\n`;
        
        // Tech Stack
        if (sectionData.techStack && sectionData.techStack.length > 0) {
          sectionMarkdown += `### Tech Stack\n\n`;
          sectionData.techStack.forEach((tech: any) => {
            sectionMarkdown += `- ${tech.name}\n`;
          });
          sectionMarkdown += '\n';
        }
        
        // Architecture
        if (sectionData.architecture) {
          sectionMarkdown += `### Architecture\n\n${sectionData.architecture}\n\n`;
        }
        
        // Development Commands
        if (sectionData.commands) {
          sectionMarkdown += `### Development Commands\n\n\`\`\`bash\n${sectionData.commands}\n\`\`\`\n\n`;
        }
        
        // Testing
        if (sectionData.testing) {
          sectionMarkdown += `### Testing\n\n${sectionData.testing}\n\n`;
        }
        
        // Build Process
        if (sectionData.buildProcess) {
          sectionMarkdown += `### Build Process\n\n${sectionData.buildProcess}\n\n`;
        }
        
        // Custom Content
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (!sectionData.techStack && !sectionData.architecture && !sectionData.commands && !sectionData.testing && !sectionData.buildProcess) {
          sectionMarkdown += `\`\`\`bash\n# Clone the repository\ngit clone https://github.com/${repoData?.owner?.login || 'username'}/${repoData?.name || 'repo'}\n\n# Install dependencies\nnpm install\n\n# Run development server\nnpm run dev\n\`\`\`\n\n`;
        }
        break;

      case 'contributing':
        sectionMarkdown += `## 🤝 Contributing\n\n`;
        
        // Contributing Guidelines
        if (sectionData.guidelines) {
          sectionMarkdown += `### Guidelines\n\n${sectionData.guidelines}\n\n`;
        }
        
        // Development Setup
        if (sectionData.devSetup) {
          sectionMarkdown += `### Development Setup\n\n${sectionData.devSetup}\n\n`;
        }
        
        // Code Style
        if (sectionData.codeStyle) {
          sectionMarkdown += `### Code Style\n\n${sectionData.codeStyle}\n\n`;
        }
        
        // Pull Request Process
        if (sectionData.prProcess) {
          sectionMarkdown += `### Pull Request Process\n\n${sectionData.prProcess}\n\n`;
        }
        
        // Custom Content
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (!sectionData.guidelines && !sectionData.devSetup && !sectionData.codeStyle && !sectionData.prProcess) {
          sectionMarkdown += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
        }
        break;

      case 'license':
        sectionMarkdown += `## 📄 License\n\n`;
        
        // License Type
        if (sectionData.licenseType) {
          sectionMarkdown += `**License:** ${sectionData.licenseType}\n\n`;
        }
        
        // License Text
        if (sectionData.licenseText) {
          sectionMarkdown += `${sectionData.licenseText}\n\n`;
        }
        
        // Custom Content
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (!sectionData.licenseType && !sectionData.licenseText) {
          sectionMarkdown += `This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n`;
        }
        break;

      case 'support':
        sectionMarkdown += `## 💬 Support\n\n`;
        
        // Support Channels
        if (sectionData.channels) {
          sectionMarkdown += `### Support Channels\n\n${sectionData.channels}\n\n`;
        }
        
        // FAQ
        if (sectionData.faq) {
          sectionMarkdown += `### FAQ\n\n${sectionData.faq}\n\n`;
        }
        
        // Troubleshooting
        if (sectionData.troubleshooting) {
          sectionMarkdown += `### Troubleshooting\n\n${sectionData.troubleshooting}\n\n`;
        }
        
        // Custom Content
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (!sectionData.channels && !sectionData.faq && !sectionData.troubleshooting) {
          sectionMarkdown += `If you have any questions or need help, please open an issue on GitHub.\n\n`;
        }
        break;
    }

    return sectionMarkdown;
  };

  // Use useMemo to regenerate markdown when dependencies change
  const markdown = useMemo(() => {
    if (viewMode === 'ai' && aiGeneratedContent) {
      return aiGeneratedContent;
    }
    return generateMarkdown();
  }, [viewMode, aiGeneratedContent, customizationData, repoData]);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">📖 README Preview</h2>
          <div className="flex items-center space-x-2">
            {aiGeneratedContent && (
              <div className="flex items-center space-x-1 mr-4">
                <button
                  onClick={() => setViewMode('custom')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Custom
                </button>
                <button
                  onClick={() => setViewMode('ai')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'ai'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  AI Generated
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowRawMarkdown(!showRawMarkdown)}
              className={`px-3 py-1 text-sm border rounded transition-colors ${
                showRawMarkdown 
                  ? 'text-blue-600 bg-blue-50 border-blue-200' 
                  : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showRawMarkdown ? 'Preview' : 'Raw Markdown'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {viewMode === 'ai' && aiGeneratedContent ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <span className="mr-2">🤖</span>
                <span className="text-sm font-medium">AI Generated Content</span>
              </div>
            </div>
          ) : null}
          
          {showRawMarkdown ? (
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {markdown}
            </pre>
          ) : (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: marked(markdown) }}
            />
          )}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {viewMode === 'ai' ? 'AI Generated preview' : 'Custom preview'}
            {showRawMarkdown && ' (Raw Markdown)'}
          </span>
          <span>{markdown.length} characters</span>
        </div>
      </div>
    </div>
  );
} 