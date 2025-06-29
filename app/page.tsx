'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Github, 
  Sparkles, 
  FileText, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  Star,
  Code,
  Palette,
  Download,
  Search,
  Cpu,
  Layers,
  ExternalLink,
  Copy
} from 'lucide-react';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [repo, setRepo] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && repo) {
      window.location.href = `/${username}/${repo}`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Intelligent file prioritization and smart content analysis using advanced AI to understand your codebase structure."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Professional READMEs",
      description: "Generate comprehensive, well-structured README files that follow industry best practices and standards."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for large codebases with parallel processing, caching, and adaptive strategies for quick results."
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Customizable Editor",
      description: "Advanced markdown editor with live preview, section management, and professional formatting tools."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Smart Prioritization",
      description: "Automatically identifies and prioritizes important files like package.json, README.md, and entry points."
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Works with JavaScript, Python, Go, Rust, Java, PHP, and more with language-specific optimizations."
    }
  ];

  const benefits = [
    "Save hours of manual README writing",
    "Ensure consistent documentation quality",
    "Focus on code, not documentation",
    "Professional presentation for your projects",
    "Easy customization and editing",
    "Export to clipboard with one click"
  ];

  const urlExamples = [
    {
      original: "https://github.com/facebook/react",
      transformed: "https://gitdoc.xyz/facebook/react",
      description: "React - A JavaScript library for building user interfaces",
      features: ["Package.json analysis", "Component structure", "Installation scripts"]
    },
    {
      original: "https://github.com/microsoft/vscode",
      transformed: "https://gitdoc.xyz/microsoft/vscode",
      description: "Visual Studio Code - Code editor",
      features: ["Extension system", "Build configuration", "Development setup"]
    },
    {
      original: "https://github.com/vercel/next.js",
      transformed: "https://gitdoc.xyz/vercel/next.js",
      description: "Next.js - React framework",
      features: ["Framework features", "API routes", "Deployment guides"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">gitdoc.xyz</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How it Works
              </a>
              <Link 
                href="https://github.com" 
                target="_blank"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered README Generation</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Generate Professional
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                README Files
              </span>
              in Seconds
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform any GitHub repository into a beautifully documented project with our intelligent AI that understands your codebase and creates comprehensive README files.
            </p>

            {/* Repository Input Form */}
            <form onSubmit={handleGenerate} className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="GitHub username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Repository name"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Generate README</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
                <div className="text-gray-600">Repositories Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
                <div className="text-gray-600">Languages Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">30s</div>
                <div className="text-gray-600">Average Generation Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* URL Transformation Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              It's That Simple
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Just replace <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">github.com</code> with <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono text-blue-800">gitdoc.xyz</code> in any GitHub URL and get instant README generation!
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {urlExamples.map((example, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Github className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Original GitHub URL:</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                      <code className="text-gray-700 break-all">{example.original}</code>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">GitDoc URL:</span>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <code className="text-blue-800 break-all">{example.transformed}</code>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-3">{example.description}</p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">What GitDoc will analyze:</span>
                    </div>
                    <div className="space-y-2">
                      {example.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => copyToClipboard(example.transformed)}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy URL</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">No signup required • Works with any public repository</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Development
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create professional documentation that makes your projects stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent system analyzes your repository and generates comprehensive documentation in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Repository Analysis</h3>
              <p className="text-gray-600">
                Our AI scans your repository structure, identifies important files, and understands your project's architecture.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Content Generation</h3>
              <p className="text-gray-600">
                Based on the analysis, we generate comprehensive README content with proper sections, code examples, and installation instructions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customize & Export</h3>
              <p className="text-gray-600">
                Edit the generated content in our advanced editor, preview in real-time, and export with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose GitDoc?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Stop spending hours writing documentation. Let AI handle the heavy lifting while you focus on what matters most - your code.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Star className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Perfect for Open Source</h3>
                </div>
                <p className="text-blue-100 mb-6">
                  Make your open source projects more accessible and professional with comprehensive documentation that helps contributors get started quickly.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span className="text-sm">Multi-language</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Smart analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">One-click export</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">gitdoc.xyz</span>
              </div>
              <p className="text-gray-400">
                AI-powered README generation for modern developers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="https://github.com" target="_blank" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://github.com" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 gitdoc.xyz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
