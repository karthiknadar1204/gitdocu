interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
  url: string;
}

interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

interface RepoData {
  fileTree: GitHubTreeItem[];
  importantFiles: {
    [key: string]: string;
  };
  repoInfo: {
    name: string;
    description: string;
    language: string;
  };
}

// Important file patterns to prioritize
const IMPORTANT_FILES = [
  'README.md',
  'readme.md',
  'package.json',
  'requirements.txt',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Gemfile',
  'composer.json',
  'Dockerfile',
  'docker-compose.yml',
  'Makefile',
  'CMakeLists.txt',
  'index.js',
  'index.ts',
  'main.js',
  'main.ts',
  'main.py',
  'main.go',
  'app.py',
  'app.js',
  'app.ts',
  'src/main.ts',
  'src/main.js',
  'src/index.ts',
  'src/index.js',
  'lib/main.dart',
  'pubspec.yaml',
  'CONTRIBUTING.md',
  'LICENSE',
  '.gitignore'
];

// File extensions to prioritize
const IMPORTANT_EXTENSIONS = [
  '.md', '.json', '.txt', '.toml', '.mod', '.xml', 
  '.gradle', '.lock', '.yml', '.yaml', '.js', '.ts', 
  '.py', '.go', '.dart', '.rs', '.java', '.kt', '.swift'
];

function isImportantFile(path: string): boolean {
  const fileName = path.split('/').pop()?.toLowerCase() || '';
  
  // Check if it's in our important files list
  if (IMPORTANT_FILES.some(file => fileName === file.toLowerCase())) {
    return true;
  }
  
  // Check if it has important extension
  if (IMPORTANT_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
    return true;
  }
  
  // Check if it's in important directories
  if (path.startsWith('docs/') || path.startsWith('src/') || path.startsWith('lib/')) {
    return true;
  }
  
  return false;
}

// Add delay between API calls to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// GitHub API utility with rate limiting and error handling
class GitHubAPI {
  private static instance: GitHubAPI;
  private requestCount = 0;
  private lastRequestTime = 0;
  private rateLimitReset = 0;

  static getInstance(): GitHubAPI {
    if (!GitHubAPI.instance) {
      GitHubAPI.instance = new GitHubAPI();
    }
    return GitHubAPI.instance;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Rate limiting: max 60 requests per hour for unauthenticated requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Ensure at least 1 second between requests
    if (timeSinceLastRequest < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitDoc-App/1.0 (https://github.com/your-repo)',
        'X-GitHub-Api-Version': '2022-11-28',
        ...options.headers,
      },
    });

    this.lastRequestTime = Date.now();
    this.requestCount++;

    // Check rate limit headers
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining === '0' && reset) {
      this.rateLimitReset = parseInt(reset) * 1000;
      const waitTime = this.rateLimitReset - Date.now();
      if (waitTime > 0) {
        throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(waitTime / 60000)} minutes.`);
      }
    }

    return response;
  }

  async getRepository(username: string, repo: string): Promise<any> {
    const url = `https://api.github.com/repos/${username}/${repo}`;
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 404) {
        throw new Error('Repository not found. Please check the username and repository name.');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }
    
    return response.json();
  }

  async getRepositoryTree(username: string, repo: string, branch: string = 'main'): Promise<any> {
    const url = `https://api.github.com/repos/${username}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 404) {
        // Try alternative branches
        const alternativeBranches = ['master', 'develop', 'dev'];
        for (const altBranch of alternativeBranches) {
          try {
            const altUrl = `https://api.github.com/repos/${username}/${repo}/git/trees/${altBranch}?recursive=1`;
            const altResponse = await this.makeRequest(altUrl);
            if (altResponse.ok) {
              return altResponse.json();
            }
          } catch (error) {
            console.warn(`Failed to fetch ${altBranch} branch:`, error);
          }
        }
        throw new Error('Could not access repository tree. Repository might be private or not found.');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }
    
    return response.json();
  }

  async getFileContent(username: string, repo: string, path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
    const response = await this.makeRequest(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Rate limit exceeded');
      } else if (response.status === 404) {
        return null; // File not found
      } else {
        console.warn(`Failed to fetch ${path}: ${response.status}`);
        return null;
      }
    }
    
    const fileData = await response.json();
    if (fileData.content && fileData.encoding === 'base64') {
      return Buffer.from(fileData.content, 'base64').toString('utf-8');
    }
    
    return null;
  }

  async getMultipleFiles(username: string, repo: string, paths: string[]): Promise<{ [key: string]: string }> {
    const files: { [key: string]: string } = {};
    let rateLimitHit = false;

    for (const path of paths) {
      if (rateLimitHit) break;
      
      try {
        const content = await this.getFileContent(username, repo, path);
        if (content) {
          files[path] = content;
          console.log(`✅ Fetched: ${path} (${content.length} chars)`);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Rate limit')) {
          console.warn('Rate limit hit, stopping file fetch');
          rateLimitHit = true;
          break;
        }
        console.warn(`Failed to fetch ${path}:`, error);
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return files;
  }

  getRemainingRequests(): number {
    return Math.max(0, 60 - this.requestCount);
  }

  getTimeUntilReset(): number {
    if (this.rateLimitReset === 0) return 0;
    return Math.max(0, this.rateLimitReset - Date.now());
  }
}

export const githubAPI = GitHubAPI.getInstance();

export async function getRepoData(username: string, repo: string): Promise<RepoData> {
  console.log(`🔍 Fetching data for ${username}/${repo}`);
  
  try {
    // Step 1: Get repo info
    console.log('📡 Fetching repo info...');
    const repoInfo = await githubAPI.getRepository(username, repo);
    
    // Step 2: Get file tree
    console.log('📡 Fetching file tree...');
    const treeData = await githubAPI.getRepositoryTree(username, repo);
    
    if (!treeData.tree) {
      throw new Error('No files found in repository');
    }
    
    const fileTree = treeData.tree as GitHubTreeItem[];
    console.log(`📁 Found ${fileTree.length} files in repo`);
    
    // Step 3: Filter important files (limit to top 10 most important)
    const importantFilePaths = fileTree
      .filter(item => item.type === 'blob' && isImportantFile(item.path))
      .sort((a, b) => {
        // Sort by importance (README.md first, then package.json, etc.)
        const aImportance = IMPORTANT_FILES.indexOf(a.path.split('/').pop()?.toLowerCase() || '');
        const bImportance = IMPORTANT_FILES.indexOf(b.path.split('/').pop()?.toLowerCase() || '');
        return (bImportance === -1 ? 999 : bImportance) - (aImportance === -1 ? 999 : aImportance);
      })
      .slice(0, 10) // Limit to 10 most important files
      .map(item => item.path);
    
    console.log(`⭐ Identified ${importantFilePaths.length} important files:`, importantFilePaths);
    
    // Step 4: Fetch content of important files with delays
    console.log('📡 Fetching important file contents...');
    const importantFiles: { [key: string]: string } = {};
    
    for (let i = 0; i < importantFilePaths.length; i++) {
      const filePath = importantFilePaths[i];
      console.log(`📄 Fetching ${i + 1}/${importantFilePaths.length}: ${filePath}`);
      
      const content = await githubAPI.getFileContent(username, repo, filePath);
      if (content) {
        importantFiles[filePath] = content;
        console.log(`✅ Fetched: ${filePath} (${content.length} chars)`);
      }
      
      // Add delay between requests to respect rate limits
      if (i < importantFilePaths.length - 1) {
        await delay(1000); // 1 second delay between requests
      }
    }
    
    const result: RepoData = {
      fileTree,
      importantFiles,
      repoInfo: {
        name: repoInfo.name,
        description: repoInfo.description || '',
        language: repoInfo.language || 'Unknown'
      }
    };
    
    console.log('🎉 Repo data fetch completed successfully!');
    console.log('📊 Summary:', {
      totalFiles: fileTree.length,
      importantFilesCount: Object.keys(importantFiles).length,
      repoName: result.repoInfo.name,
      language: result.repoInfo.language
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in getRepoData:', error);
    throw error;
  }
} 