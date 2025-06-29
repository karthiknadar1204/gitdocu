import OpenAI from "openai";

export const client = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

interface FileAnalysis {
    path: string;
    content: string;
    type: 'config' | 'source' | 'documentation' | 'build' | 'other';
    importance: number;
    size: number;
    chunks?: string[];
}

interface AIAnalysisResult {
    projectType: string;
    mainLanguage: string;
    dependencies: string[];
    entryPoints: string[];
    features: string[];
    installationCommands: string[];
    usageExamples: string[];
    projectDescription: string;
    techStack: string[];
    architecture: string;
    developmentSetup: string;
}

// Cache for file analyses to avoid re-processing
const analysisCache = new Map<string, any>();

// Adaptive processing based on codebase size
function getProcessingStrategy(fileCount: number, totalSize: number): {
    maxFiles: number;
    maxChunkSize: number;
    maxConcurrent: number;
    useChunking: boolean;
} {
    if (fileCount > 1000 || totalSize > 10000000) {
        // Very large codebase
        return {
            maxFiles: 15,
            maxChunkSize: 2000,
            maxConcurrent: 3,
            useChunking: true
        };
    } else if (fileCount > 500 || totalSize > 5000000) {
        // Large codebase
        return {
            maxFiles: 25,
            maxChunkSize: 2500,
            maxConcurrent: 4,
            useChunking: true
        };
    } else if (fileCount > 100 || totalSize > 1000000) {
        // Medium codebase
        return {
            maxFiles: 30,
            maxChunkSize: 3000,
            maxConcurrent: 5,
            useChunking: false
        };
    } else {
        // Small codebase
        return {
            maxFiles: 40,
            maxChunkSize: 4000,
            maxConcurrent: 6,
            useChunking: false
        };
    }
}

// Smart file prioritization for large codebases
function prioritizeFiles(fileTree: any[], importantFiles: { [key: string]: string }): FileAnalysis[] {
    const priorityPatterns = {
        config: ['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle', 'Gemfile', 'composer.json', 'pyproject.toml'],
        entry: ['main.js', 'main.ts', 'main.py', 'main.go', 'index.js', 'index.ts', 'app.js', 'app.ts', 'app.py', 'lib/main.dart'],
        docs: ['README.md', 'readme.md', 'docs/', 'documentation/'],
        build: ['Dockerfile', 'docker-compose.yml', 'Makefile', 'CMakeLists.txt', 'build.sh'],
        source: ['src/', 'lib/', 'app/', 'components/', 'pages/']
    };

    const files: FileAnalysis[] = [];
    let totalSize = 0;
    
    for (const [path, content] of Object.entries(importantFiles)) {
        let importance = 1;
        let type: 'config' | 'source' | 'documentation' | 'build' | 'other' = 'other';
        
        // Boost importance based on file type and location
        if (priorityPatterns.config.some(pattern => path.includes(pattern))) {
            importance = 10;
            type = 'config';
        } else if (priorityPatterns.entry.some(pattern => path.includes(pattern))) {
            importance = 9;
            type = 'source';
        } else if (priorityPatterns.docs.some(pattern => path.includes(pattern))) {
            importance = 8;
            type = 'documentation';
        } else if (priorityPatterns.build.some(pattern => path.includes(pattern))) {
            importance = 7;
            type = 'build';
        } else if (priorityPatterns.source.some(pattern => path.includes(pattern))) {
            importance = 6;
            type = 'source';
        }
        
        // Boost importance for root-level files
        if (!path.includes('/')) {
            importance += 2;
        }
        
        // Reduce importance for test files
        if (path.includes('test') || path.includes('spec') || path.includes('__tests__')) {
            importance -= 3;
        }
        
        // Reduce importance for generated files
        if (path.includes('node_modules') || path.includes('dist') || path.includes('build')) {
            importance -= 5;
        }

        totalSize += content.length;
        files.push({
            path,
            content,
            type,
            importance: Math.max(1, importance),
            size: content.length
        });
    }

    // Get adaptive processing strategy
    const strategy = getProcessingStrategy(files.length, totalSize);
    console.log(`Processing strategy: ${JSON.stringify(strategy)}`);

    // Sort by importance and limit to top files
    return files
        .sort((a, b) => b.importance - a.importance)
        .slice(0, strategy.maxFiles);
}

// Smart content chunking for large files
function chunkContent(content: string, maxChunkSize: number = 3000): string[] {
    if (content.length <= maxChunkSize) {
        return [content];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    const lines = content.split('\n');

    for (const line of lines) {
        if ((currentChunk + line).length > maxChunkSize && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

// Parallel file analysis with chunking and caching
export async function analyzeFilesParallel(files: FileAnalysis[]): Promise<any[]> {
    const strategy = getProcessingStrategy(files.length, files.reduce((sum, f) => sum + f.size, 0));
    const results: any[] = [];
    
    // Process files in batches
    for (let i = 0; i < files.length; i += strategy.maxConcurrent) {
        const batch = files.slice(i, i + strategy.maxConcurrent);
        const batchPromises = batch.map(file => analyzeFileWithCaching(file, strategy));
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(Boolean));
        
        // Add delay between batches to avoid rate limits
        if (i + strategy.maxConcurrent < files.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    return results;
}

// Analyze file with caching and adaptive chunking
async function analyzeFileWithCaching(file: FileAnalysis, strategy: any): Promise<any> {
    // Check cache first
    const cacheKey = `${file.path}-${file.content.length}`;
    if (analysisCache.has(cacheKey)) {
        console.log(`Using cached analysis for ${file.path}`);
        return analysisCache.get(cacheKey);
    }

    let result;
    if (strategy.useChunking && file.content.length > strategy.maxChunkSize) {
        result = await analyzeFileWithChunking(file, strategy.maxChunkSize);
    } else {
        result = await analyzeFile(file);
    }

    // Cache the result
    if (result) {
        analysisCache.set(cacheKey, result);
    }

    return result;
}

// Analyze file with smart chunking
async function analyzeFileWithChunking(file: FileAnalysis, maxChunkSize: number): Promise<any> {
    const chunks = chunkContent(file.content, maxChunkSize);
    file.chunks = chunks;
    
    if (chunks.length === 1) {
        return analyzeFile(file);
    }
    
    // For large files, analyze each chunk and combine results
    const chunkAnalyses = await Promise.all(
        chunks.map((chunk, index) => analyzeFileChunk(file.path, chunk, index, chunks.length))
    );
    
    // Combine chunk analyses
    return combineChunkAnalyses(chunkAnalyses, file);
}

// Analyze a single chunk of a large file
async function analyzeFileChunk(path: string, content: string, chunkIndex: number, totalChunks: number): Promise<any> {
    const prompt = `
Analyze this chunk (${chunkIndex + 1}/${totalChunks}) of file: ${path}

Content:
${content}

Extract key information as JSON:
{
    "dependencies": ["dependencies found"],
    "scripts": ["scripts/commands found"],
    "entryPoints": ["entry points found"],
    "features": ["features mentioned"],
    "description": "brief description of this chunk"
}
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        const result = response.choices[0]?.message?.content;
        return result ? JSON.parse(cleanJsonResponse(result)) : null;
    } catch (error) {
        console.error(`Error analyzing chunk ${chunkIndex} of ${path}:`, error);
        return null;
    }
}

// Combine analyses from multiple chunks
function combineChunkAnalyses(chunkAnalyses: any[], file: FileAnalysis): any {
    const combined = {
        fileType: file.type,
        keyInfo: {
            dependencies: [] as string[],
            scripts: [] as string[],
            entryPoints: [] as string[],
            features: [] as string[],
            description: ''
        },
        importance: file.importance
    };

    for (const analysis of chunkAnalyses) {
        if (analysis?.keyInfo) {
            combined.keyInfo.dependencies.push(...(analysis.keyInfo.dependencies || []));
            combined.keyInfo.scripts.push(...(analysis.keyInfo.scripts || []));
            combined.keyInfo.entryPoints.push(...(analysis.keyInfo.entryPoints || []));
            combined.keyInfo.features.push(...(analysis.keyInfo.features || []));
        }
    }

    // Remove duplicates
    combined.keyInfo.dependencies = [...new Set(combined.keyInfo.dependencies)];
    combined.keyInfo.scripts = [...new Set(combined.keyInfo.scripts)];
    combined.keyInfo.entryPoints = [...new Set(combined.keyInfo.entryPoints)];
    combined.keyInfo.features = [...new Set(combined.keyInfo.features)];

    return combined;
}

// Analyze individual files to extract key information
export async function analyzeFile(file: FileAnalysis): Promise<any> {
    const prompt = `
Analyze this file and extract key information:

File: ${file.path}
Content:
${file.content.substring(0, 3000)}${file.content.length > 3000 ? '...' : ''}

Extract and return as JSON:
{
    "fileType": "config|source|documentation|build|other",
    "keyInfo": {
        "dependencies": ["list of dependencies"],
        "scripts": ["list of scripts/commands"],
        "entryPoints": ["main files"],
        "features": ["key features mentioned"],
        "description": "brief description"
    },
    "importance": 1-10
}
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
        });

        const result = response.choices[0]?.message?.content;
        return result ? JSON.parse(cleanJsonResponse(result)) : null;
    } catch (error) {
        console.error(`Error analyzing file ${file.path}:`, error);
        return null;
    }
}

// Helper function to clean JSON response from markdown formatting
function cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If it still doesn't start with {, try to find JSON object
    if (!cleaned.startsWith('{')) {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleaned = jsonMatch[0];
        }
    }
    
    return cleaned;
}

// Analyze the entire repository to generate comprehensive README data
export async function analyzeRepository(
    repoInfo: any,
    importantFiles: { [key: string]: string },
    fileTree: any[]
): Promise<AIAnalysisResult> {
    
    console.log(`Analyzing repository with ${Object.keys(importantFiles).length} files and ${fileTree.length} total files`);
    
    // Smart file prioritization for large codebases
    const prioritizedFiles = prioritizeFiles(fileTree, importantFiles);
    console.log(`Prioritized ${prioritizedFiles.length} most important files`);
    
    // Parallel analysis of prioritized files
    const fileAnalyses = await analyzeFilesParallel(prioritizedFiles);
    console.log(`Completed analysis of ${fileAnalyses.length} files`);

    // Detect language and project type from files
    const detectedLanguage = detectLanguageFromFiles(fileTree, importantFiles);
    const detectedProjectType = detectProjectTypeFromFiles(fileTree, importantFiles);

    // Create comprehensive analysis prompt with file summaries
    const fileSummaries = fileAnalyses.map(analysis => {
        if (!analysis) return '';
        return `
${analysis.fileType?.toUpperCase() || 'FILE'}: ${analysis.keyInfo?.description || 'No description'}
- Dependencies: ${analysis.keyInfo?.dependencies?.join(', ') || 'None'}
- Scripts: ${analysis.keyInfo?.scripts?.join(', ') || 'None'}
- Features: ${analysis.keyInfo?.features?.join(', ') || 'None'}
`;
    }).join('\n');

    const prompt = `
You are an expert software developer analyzing a GitHub repository to generate a comprehensive README.

Repository Information:
- Name: ${repoInfo.name}
- Description: ${repoInfo.description || 'No description provided'}
- Language: ${repoInfo.language || detectedLanguage || 'Unknown'}
- Total Files: ${fileTree.length}
- Analyzed Files: ${fileAnalyses.length}

File Analysis Summary:
${fileSummaries}

Based on this analysis, provide a comprehensive README structure. Return ONLY valid JSON without any markdown formatting:

{
    "projectType": "${detectedProjectType}",
    "mainLanguage": "${detectedLanguage}",
    "dependencies": ["list of main dependencies based on the analysis"],
    "entryPoints": ["main entry files found in the repository"],
    "features": ["key features of the project based on code analysis"],
    "installationCommands": ["appropriate installation commands for ${detectedLanguage}"],
    "usageExamples": ["code examples for basic usage in ${detectedLanguage}"],
    "projectDescription": "comprehensive 2-3 sentence description of what this project does",
    "techStack": ["technologies and frameworks used"],
    "architecture": "brief architecture overview based on file structure",
    "developmentSetup": "development setup instructions for ${detectedLanguage}"
}

Important: 
- For Go projects, use "go mod" commands, not npm
- For Python projects, use "pip" commands
- For Node.js projects, use "npm" commands
- For Rust projects, use "cargo" commands
- Return ONLY the JSON object, no markdown formatting
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        const result = response.choices[0]?.message?.content;
        if (result) {
            const cleanedResult = cleanJsonResponse(result);
            console.log('Cleaned AI response:', cleanedResult);
            return JSON.parse(cleanedResult);
        }
    } catch (error) {
        console.error('Error analyzing repository:', error);
    }

    // Fallback result with better detection
    return {
        projectType: detectedProjectType,
        mainLanguage: detectedLanguage,
        dependencies: extractDependenciesFromFiles(importantFiles),
        entryPoints: extractEntryPointsFromFiles(fileTree),
        features: extractFeaturesFromFiles(importantFiles),
        installationCommands: generateInstallationCommands(detectedLanguage),
        usageExamples: generateUsageExamples(detectedLanguage),
        projectDescription: repoInfo.description || `A ${detectedLanguage} project`,
        techStack: [detectedLanguage],
        architecture: '',
        developmentSetup: generateDevelopmentSetup(detectedLanguage)
    };
}

// Generate README content based on AI analysis
export async function generateREADME(
    aiAnalysis: AIAnalysisResult,
    customizationData: any,
    repoInfo: any
): Promise<string> {
    
    const prompt = `
Generate a professional README.md for this project based on the AI analysis and user customization preferences.

AI Analysis:
${JSON.stringify(aiAnalysis, null, 2)}

Repository Info:
- Name: ${repoInfo.name}
- Description: ${repoInfo.description}
- Language: ${repoInfo.language}

User Customization:
${JSON.stringify(customizationData, null, 2)}

Generate a complete README.md that:
1. Uses the user's custom title and description if provided
2. Includes appropriate badges and tags
3. Follows the user's section order preferences
4. Incorporates the AI analysis intelligently
5. Uses proper markdown formatting
6. Is professional and comprehensive
7. Uses correct installation commands for ${aiAnalysis.mainLanguage}

Return only the markdown content, no JSON wrapper or code blocks.
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
        });

        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error generating README:', error);
        return '';
    }
}

// Helper functions for better language and project detection
function detectLanguageFromFiles(fileTree: any[], importantFiles: { [key: string]: string }): string {
    const fileExtensions = fileTree.map(item => item.path.split('.').pop()?.toLowerCase()).filter(Boolean);
    
    if (fileExtensions.includes('go') || Object.keys(importantFiles).some(f => f.includes('go.mod'))) {
        return 'Go';
    }
    if (fileExtensions.includes('py') || Object.keys(importantFiles).some(f => f.includes('requirements.txt'))) {
        return 'Python';
    }
    if (fileExtensions.includes('js') || fileExtensions.includes('ts') || Object.keys(importantFiles).some(f => f.includes('package.json'))) {
        return 'JavaScript';
    }
    if (fileExtensions.includes('rs') || Object.keys(importantFiles).some(f => f.includes('Cargo.toml'))) {
        return 'Rust';
    }
    if (fileExtensions.includes('java') || Object.keys(importantFiles).some(f => f.includes('pom.xml'))) {
        return 'Java';
    }
    if (fileExtensions.includes('php') || Object.keys(importantFiles).some(f => f.includes('composer.json'))) {
        return 'PHP';
    }
    
    return 'Unknown';
}

function detectProjectTypeFromFiles(fileTree: any[], importantFiles: { [key: string]: string }): string {
    const hasDocker = Object.keys(importantFiles).some(f => f.includes('Dockerfile'));
    const hasWebFiles = fileTree.some(item => item.path.includes('index.html') || item.path.includes('app.js'));
    const hasCLI = fileTree.some(item => item.path.includes('main.go') || item.path.includes('main.py'));
    
    if (hasDocker) return 'containerized-app';
    if (hasWebFiles) return 'web-app';
    if (hasCLI) return 'cli-tool';
    
    return 'library';
}

function extractDependenciesFromFiles(importantFiles: { [key: string]: string }): string[] {
    const dependencies: string[] = [];
    
    Object.entries(importantFiles).forEach(([path, content]) => {
        if (path.includes('go.mod')) {
            const matches = content.match(/require\s+([^\s]+)/g);
            if (matches) dependencies.push(...matches.map(m => m.replace('require ', '')));
        }
        if (path.includes('package.json')) {
            try {
                const pkg = JSON.parse(content);
                if (pkg.dependencies) dependencies.push(...Object.keys(pkg.dependencies));
            } catch (e) {}
        }
        if (path.includes('requirements.txt')) {
            const deps = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            dependencies.push(...deps);
        }
    });
    
    return dependencies.slice(0, 10); // Limit to top 10
}

function extractEntryPointsFromFiles(fileTree: any[]): string[] {
    const entryPoints = fileTree
        .filter(item => item.type === 'blob' && 
            (item.path.includes('main.go') || item.path.includes('main.py') || 
             item.path.includes('index.js') || item.path.includes('app.py')))
        .map(item => item.path);
    
    return entryPoints;
}

function extractFeaturesFromFiles(importantFiles: { [key: string]: string }): string[] {
    const features: string[] = [];
    
    Object.entries(importantFiles).forEach(([path, content]) => {
        if (path.includes('README')) {
            // Extract features from README content
            const lines = content.split('\n');
            lines.forEach(line => {
                if (line.includes('-') || line.includes('*')) {
                    const feature = line.replace(/^[\s\-\*]+/, '').trim();
                    if (feature && feature.length > 10) features.push(feature);
                }
            });
        }
    });
    
    return features.slice(0, 5); // Limit to top 5
}

function generateInstallationCommands(language: string): string[] {
    switch (language.toLowerCase()) {
        case 'go':
            return ['go mod download', 'go install .'];
        case 'python':
            return ['pip install -r requirements.txt'];
        case 'javascript':
            return ['npm install'];
        case 'rust':
            return ['cargo build'];
        case 'java':
            return ['./mvnw install'];
        default:
            return ['# Installation commands will be generated based on project type'];
    }
}

function generateUsageExamples(language: string): string[] {
    switch (language.toLowerCase()) {
        case 'go':
            return ['go run main.go', 'go build && ./app'];
        case 'python':
            return ['python main.py', 'python -m app'];
        case 'javascript':
            return ['npm start', 'node index.js'];
        case 'rust':
            return ['cargo run', 'cargo test'];
        default:
            return ['# Usage examples will be generated based on project type'];
    }
}

function generateDevelopmentSetup(language: string): string {
    switch (language.toLowerCase()) {
        case 'go':
            return 'go mod download && go run main.go';
        case 'python':
            return 'pip install -r requirements.txt && python main.py';
        case 'javascript':
            return 'npm install && npm run dev';
        case 'rust':
            return 'cargo build && cargo run';
        default:
            return '# Development setup will be generated based on project type';
    }
}

// Helper functions
function getFileType(path: string): 'config' | 'source' | 'documentation' | 'build' | 'other' {
    if (path.includes('package.json') || path.includes('requirements.txt') || path.includes('Cargo.toml') || path.includes('go.mod')) {
        return 'config';
    }
    if (path.includes('README') || path.includes('docs/') || path.includes('.md')) {
        return 'documentation';
    }
    if (path.includes('Dockerfile') || path.includes('docker-compose') || path.includes('Makefile')) {
        return 'build';
    }
    if (path.includes('.js') || path.includes('.ts') || path.includes('.py') || path.includes('.go')) {
        return 'source';
    }
    return 'other';
}

function getFileImportance(path: string): number {
    const importantFiles = [
        'README.md', 'package.json', 'requirements.txt', 'main.py', 'index.js',
        'app.py', 'main.go', 'Cargo.toml', 'Dockerfile', 'docker-compose.yml',
        'go.mod', 'go.sum'
    ];
    
    const fileName = path.split('/').pop()?.toLowerCase();
    if (importantFiles.some(file => fileName === file.toLowerCase())) {
        return 10;
    }
    
    if (path.startsWith('src/') || path.startsWith('lib/')) {
        return 8;
    }
    
    if (path.includes('.md') || path.includes('.json')) {
        return 7;
    }
    
    return 5;
}

// const response = await client.responses.create({
//     model: "gpt-3.5-turbo",
//     input: "Write a one-sentence bedtime story about a unicorn."
// });

// console.log(response.output_text);