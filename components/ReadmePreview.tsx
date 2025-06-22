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

    // Table of Contents
    markdown += `## 📋 Table of Contents\n\n`;
    if (customizationData.sections.installation.enabled) markdown += `- [Installation](#installation)\n`;
    if (customizationData.sections.usage.enabled) markdown += `- [Usage](#usage)\n`;
    if (customizationData.sections.features.enabled) markdown += `- [Features](#features)\n`;
    if (customizationData.sections.development.enabled) markdown += `- [Development](#development)\n`;
    if (customizationData.sections.contributing.enabled) markdown += `- [Contributing](#contributing)\n`;
    if (customizationData.sections.license.enabled) markdown += `- [License](#license)\n`;
    if (customizationData.sections.support.enabled) markdown += `- [Support](#support)\n`;
    markdown += '\n';

    // Installation Section
    if (customizationData.sections.installation.enabled) {
      markdown += `## ⚙️ Installation\n\n`;
      if (customizationData.sections.installation.content) {
        markdown += `${customizationData.sections.installation.content}\n\n`;
      } else {
        markdown += `\`\`\`bash\nnpm install ${repoData?.repoInfo?.name || 'package-name'}\n\`\`\`\n\n`;
      }
    }

    // Usage Section
    if (customizationData.sections.usage.enabled) {
      markdown += `## 🚀 Usage\n\n`;
      if (customizationData.sections.usage.content) {
        markdown += `${customizationData.sections.usage.content}\n\n`;
      } else {
        markdown += `\`\`\`javascript\nimport { something } from '${repoData?.repoInfo?.name || 'package-name'}';\n\`\`\`\n\n`;
      }
    }

    // Features Section
    if (customizationData.sections.features.enabled) {
      markdown += `## ✨ Features\n\n`;
      if (customizationData.sections.features.content) {
        markdown += `${customizationData.sections.features.content}\n\n`;
      } else {
        markdown += `- Feature 1\n- Feature 2\n- Feature 3\n\n`;
      }
    }

    // Development Section
    if (customizationData.sections.development.enabled) {
      markdown += `## 🛠️ Development\n\n`;
      if (customizationData.sections.development.content) {
        markdown += `${customizationData.sections.development.content}\n\n`;
      } else {
        markdown += `\`\`\`bash\n# Clone the repository\ngit clone https://github.com/${repoData?.repoInfo?.name || 'username'}/${repoData?.repoInfo?.name || 'repo'}\n\n# Install dependencies\nnpm install\n\n# Run development server\nnpm run dev\n\`\`\`\n\n`;
      }
    }

    // Contributing Section
    if (customizationData.sections.contributing.enabled) {
      markdown += `## 🤝 Contributing\n\n`;
      if (customizationData.sections.contributing.content) {
        markdown += `${customizationData.sections.contributing.content}\n\n`;
      } else {
        markdown += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
      }
    }

    // License Section
    if (customizationData.sections.license.enabled) {
      markdown += `## 📄 License\n\n`;
      if (customizationData.sections.license.content) {
        markdown += `${customizationData.sections.license.content}\n\n`;
      } else {
        markdown += `This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n`;
      }
    }

    // Support Section
    if (customizationData.sections.support.enabled) {
      markdown += `## 💬 Support\n\n`;
      if (customizationData.sections.support.content) {
        markdown += `${customizationData.sections.support.content}\n\n`;
      } else {
        markdown += `If you have any questions or need help, please open an issue on GitHub.\n\n`;
      }
    }

    // Author Information
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