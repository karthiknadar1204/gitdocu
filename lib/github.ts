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

async function fetchGitHubAPI(endpoint: string): Promise<any> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitDoc-App'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchFileContent(username: string, repo: string, path: string): Promise<string> {
  try {
    const fileData = await fetchGitHubAPI(`/repos/${username}/${repo}/contents/${path}`);
    
    if (fileData.content && fileData.encoding === 'base64') {
      return Buffer.from(fileData.content, 'base64').toString('utf-8');
    }
    
    return fileData.content || '';
  } catch (error) {
    console.warn(`Failed to fetch content for ${path}:`, error);
    return '';
  }
}

export async function getRepoData(username: string, repo: string): Promise<RepoData> {
  console.log(`🔍 Fetching data for ${username}/${repo}`);
  
  try {
    // Step 1: Get repo info
    console.log('📡 Fetching repo info...');
    const repoInfo = await fetchGitHubAPI(`/repos/${username}/${repo}`);
    
    // Step 2: Get file tree
    console.log('📡 Fetching file tree...');
    const treeData = await fetchGitHubAPI(`/repos/${username}/${repo}/git/trees/main?recursive=1`);
    
    if (!treeData.tree) {
      throw new Error('No files found in repository');
    }
    
    const fileTree = treeData.tree as GitHubTreeItem[];
    console.log(`📁 Found ${fileTree.length} files in repo`);
    
    // Step 3: Filter important files
    const importantFilePaths = fileTree
      .filter(item => item.type === 'blob' && isImportantFile(item.path))
      .slice(0, 20) // Limit to 20 most important files
      .map(item => item.path);
    
    console.log(`⭐ Identified ${importantFilePaths.length} important files:`, importantFilePaths);
    
    // Step 4: Fetch content of important files
    console.log('📡 Fetching important file contents...');
    const importantFiles: { [key: string]: string } = {};
    
    for (const filePath of importantFilePaths) {
      const content = await fetchFileContent(username, repo, filePath);
      if (content) {
        importantFiles[filePath] = content;
        console.log(`✅ Fetched: ${filePath} (${content.length} chars)`);
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