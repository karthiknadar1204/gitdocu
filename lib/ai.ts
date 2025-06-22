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

// Analyze individual files to extract key information
export async function analyzeFile(file: FileAnalysis): Promise<any> {
    const prompt = `
Analyze this file and extract key information:

File: ${file.path}
Content:
${file.content.substring(0, 2000)}${file.content.length > 2000 ? '...' : ''}

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
        return result ? JSON.parse(result) : null;
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
    
    // Prepare file analysis data
    const filesForAnalysis = Object.entries(importantFiles).map(([path, content]) => ({
        path,
        content,
        type: getFileType(path),
        importance: getFileImportance(path)
    }));

    // Detect language and project type from files
    const detectedLanguage = detectLanguageFromFiles(fileTree, importantFiles);
    const detectedProjectType = detectProjectTypeFromFiles(fileTree, importantFiles);

    // Create comprehensive analysis prompt
    const prompt = `
You are an expert software developer analyzing a GitHub repository to generate a comprehensive README.

Repository Information:
- Name: ${repoInfo.name}
- Description: ${repoInfo.description || 'No description provided'}
- Language: ${repoInfo.language || detectedLanguage || 'Unknown'}
- Total Files: ${fileTree.length}

Important Files Content:
${filesForAnalysis.map(file => `
=== ${file.path} ===
${file.content.substring(0, 1000)}${file.content.length > 1000 ? '...' : ''}
`).join('\n')}

Based on this analysis, provide a comprehensive README structure. Return ONLY valid JSON without any markdown formatting:

{
    "projectType": "${detectedProjectType}",
    "mainLanguage": "${detectedLanguage}",
    "dependencies": ["list of main dependencies based on the files"],
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
        console.error('Raw AI response:', response?.choices[0]?.message?.content);
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