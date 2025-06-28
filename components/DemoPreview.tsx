'use client';

import { useState } from 'react';

interface DemoPreviewProps {
  type: string;
  url: string;
  title: string;
}

export default function DemoPreview({ type, url, title }: DemoPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const getEmbedUrl = (url: string, type: string) => {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      
      switch (type) {
        case 'codesandbox':
          // Convert CodeSandbox URL to embed format
          if (urlObj.hostname.includes('codesandbox.io')) {
            const sandboxId = urlObj.pathname.split('/').pop();
            return `https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark`;
          }
          return url;
          
        case 'stackblitz':
          // Convert StackBlitz URL to embed format
          if (urlObj.hostname.includes('stackblitz.com')) {
            return `${url}?embed=1&devToolsHeight=50`;
          }
          return url;
          
        case 'live-demo':
          return url;
          
        case 'video':
          // Handle YouTube and other video platforms
          if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
          }
          return url;
          
        default:
          return url;
      }
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(url, type);

  if (!url) {
    return (
      <div className="border border-gray-200 rounded-md p-8 text-center">
        <div className="text-gray-400 text-4xl mb-2">🎬</div>
        <p className="text-gray-600">No demo URL provided</p>
        <p className="text-sm text-gray-500 mt-1">Add a URL to see the demo preview</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="border border-red-200 rounded-md p-4 bg-red-50">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">⚠️</span>
          <span className="text-red-800">Failed to load demo</span>
        </div>
        <p className="text-sm text-red-600 mt-1">Please check the URL and try again</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
        >
          Open in new tab →
        </a>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{title}</span>
            <span className={`px-2 py-1 text-xs rounded ${
              type === 'codesandbox' ? 'bg-orange-100 text-orange-700' :
              type === 'stackblitz' ? 'bg-purple-100 text-purple-700' :
              type === 'video' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {type}
            </span>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ↗
          </a>
        </div>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {type === 'video' ? (
          <iframe
            src={embedUrl || ''}
            className="w-full h-64"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : type === 'live-demo' ? (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">🌐</div>
              <p className="text-gray-600">Live Demo</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Open Demo →
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl || ''}
            className="w-full h-64"
            frameBorder="0"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>
    </div>
  );
} 