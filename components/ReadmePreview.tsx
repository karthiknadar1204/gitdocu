'use client';

import { marked } from 'marked';

interface ReadmePreviewProps {
  customizationData: any;
  repoData: any;
}

export default function ReadmePreview({ customizationData, repoData }: ReadmePreviewProps) {
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
    if (customizationData.basicInfo.badges.length > 0) {
      markdown += customizationData.basicInfo.badges
        .map((badge: any) => `![${badge.alt || 'Badge'}](${badge.url})`)
        .join(' ') + '\n\n';
    }

    // Description
    if (customizationData.basicInfo.description) {
      markdown += `${customizationData.basicInfo.description}\n\n`;
    }

    // Tags
    if (customizationData.basicInfo.tags.length > 0) {
      markdown += `**Tags:** ${customizationData.basicInfo.tags.map((tag: string) => `\`${tag}\``).join(', ')}\n\n`;
    }

    // Get section order (use custom order if available, otherwise default)
    const sectionOrder = customizationData.sectionOrder || [
      'basic', 'installation', 'usage', 'features', 'development', 'contributing', 'license', 'support'
    ];

    // Table of Contents (only if enabled)
    if (customizationData.styling?.showTableOfContents !== false) {
      markdown += `## 📋 Table of Contents\n\n`;
      sectionOrder.forEach(sectionId => {
        if (sectionId === 'basic') return; // Skip basic info in TOC
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
      if (sectionId === 'basic') return; // Basic info is already handled above
      const sectionMarkdown = generateSectionMarkdown(sectionId);
      if (sectionMarkdown) {
        markdown += sectionMarkdown;
      }
    });

    // Author Information (always at the end)
    if (customizationData.basicInfo.author.name) {
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
        } else if (sectionData.installationMethods && sectionData.installationMethods.length > 0) {
          sectionData.installationMethods.forEach((method: any) => {
            sectionMarkdown += `**${method.manager}:**\n\`\`\`bash\n${method.command}\n\`\`\`\n\n`;
          });
        } else {
          sectionMarkdown += `\`\`\`bash\nnpm install ${repoData?.repoInfo?.name || 'package-name'}\n\`\`\`\n\n`;
        }
        break;

      case 'usage':
        sectionMarkdown += `## 🚀 Usage\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (sectionData.examples && sectionData.examples.length > 0) {
          sectionData.examples.forEach((example: any) => {
            sectionMarkdown += `### ${example.title}\n\n`;
            sectionMarkdown += `\`\`\`javascript\n${example.code}\n\`\`\`\n\n`;
            if (example.description) {
              sectionMarkdown += `${example.description}\n\n`;
            }
          });
        } else {
          sectionMarkdown += `\`\`\`javascript\nimport { something } from '${repoData?.repoInfo?.name || 'package-name'}';\n\`\`\`\n\n`;
        }
        break;

      case 'features':
        sectionMarkdown += `## ✨ Features\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else if (sectionData.features && sectionData.features.length > 0) {
          sectionData.features.forEach((feature: any) => {
            sectionMarkdown += `- ${feature.text}\n`;
          });
          sectionMarkdown += '\n';
        } else {
          sectionMarkdown += `- Feature 1\n- Feature 2\n- Feature 3\n\n`;
        }
        break;

      case 'development':
        sectionMarkdown += `## 🛠️ Development\n\n`;
        if (sectionData.content) {
          sectionMarkdown += `${sectionData.content}\n\n`;
        } else {
          sectionMarkdown += `\`\`\`bash\n# Clone the repository\ngit clone https://github.com/${repoData?.repoInfo?.name || 'username'}/${repoData?.repoInfo?.name || 'repo'}\n\n# Install dependencies\nnpm install\n\n# Run development server\nnpm run dev\n\`\`\`\n\n`;
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

  const markdown = generateMarkdown();

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">📖 README Preview</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
              Raw Markdown
            </button>
            <button className="px-3 py-1 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: marked(markdown) }}
          />
        </div>
      </div>

      {/* Preview Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Generated preview</span>
          <span>{markdown.length} characters</span>
        </div>
      </div>
    </div>
  );
} 