'use client';

import { useState } from 'react';

interface BasicInfoSectionProps {
  data: any;
  updateData: (data: any) => void;
  repoData: any;
}

export default function BasicInfoSection({ data, updateData, repoData }: BasicInfoSectionProps) {
  const [newTag, setNewTag] = useState('');
  const [newBadge, setNewBadge] = useState({ type: 'custom', url: '', alt: '' });

  const predefinedBadges = [
    { name: 'Build Status', url: 'https://img.shields.io/badge/build-passing-brightgreen', alt: 'Build Status' },
    { name: 'Version', url: 'https://img.shields.io/badge/version-1.0.0-blue', alt: 'Version' },
    { name: 'License', url: 'https://img.shields.io/badge/license-MIT-green', alt: 'License' },
    { name: 'Downloads', url: 'https://img.shields.io/npm/dm/package-name', alt: 'Downloads' },
    { name: 'Stars', url: 'https://img.shields.io/github/stars/username/repo', alt: 'Stars' },
    { name: 'Forks', url: 'https://img.shields.io/github/forks/username/repo', alt: 'Forks' },
    { name: 'Issues', url: 'https://img.shields.io/github/issues/username/repo', alt: 'Issues' },
    { name: 'PRs', url: 'https://img.shields.io/github/issues-pr/username/repo', alt: 'PRs' }
  ];

  const addTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim())) {
      updateData({ tags: [...data.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    updateData({ tags: data.tags.filter((_: any, i: number) => i !== index) });
  };

  const addBadge = () => {
    if (newBadge.url.trim()) {
      updateData({ badges: [...data.badges, { ...newBadge, id: Date.now() }] });
      setNewBadge({ type: 'custom', url: '', alt: '' });
    }
  };

  const removeBadge = (index: number) => {
    updateData({ badges: data.badges.filter((_: any, i: number) => i !== index) });
  };

  const addPredefinedBadge = (badge: any) => {
    const badgeUrl = badge.url.replace('username/repo', `${repoData?.repoInfo?.name || 'username'}/${repoData?.repoInfo?.name || 'repo'}`);
    updateData({ badges: [...data.badges, { ...badge, url: badgeUrl, id: Date.now() }] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Basic Information</h2>
        <p className="text-gray-600 mb-6">Configure the essential information about your project.</p>
      </div>

      {/* Project Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Title
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter project title"
        />
      </div>

      {/* Project Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your project in a few sentences"
        />
      </div>

      {/* Logo/Banner */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo/Banner URL
        </label>
        <input
          type="url"
          value={data.logo}
          onChange={(e) => updateData({ logo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/logo.png"
        />
        {data.logo && (
          <div className="mt-2">
            <img src={data.logo} alt="Project logo" className="max-h-20 rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        )}
      </div>

      {/* Badges */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Badges
        </label>
        
        {/* Predefined Badges */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick Add:</p>
          <div className="flex flex-wrap gap-2">
            {predefinedBadges.map((badge, index) => (
              <button
                key={index}
                onClick={() => addPredefinedBadge(badge)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {badge.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Badge */}
        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={newBadge.url}
            onChange={(e) => setNewBadge({ ...newBadge, url: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Badge URL (e.g., shields.io)"
          />
          <input
            type="text"
            value={newBadge.alt}
            onChange={(e) => setNewBadge({ ...newBadge, alt: e.target.value })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Alt text"
          />
          <button
            onClick={addBadge}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Current Badges */}
        {data.badges.length > 0 && (
          <div className="space-y-2">
            {data.badges.map((badge: any, index: number) => (
              <div key={badge.id || index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <img src={badge.url} alt={badge.alt} className="h-6" />
                <button
                  onClick={() => removeBadge(index)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a tag"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {tag}
                <button
                  onClick={() => removeTag(index)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Author Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Author Information
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={data.author.name}
              onChange={(e) => updateData({ author: { ...data.author, name: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={data.author.email}
              onChange={(e) => updateData({ author: { ...data.author, email: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Website</label>
            <input
              type="url"
              value={data.author.website}
              onChange={(e) => updateData({ author: { ...data.author, website: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">GitHub</label>
            <input
              type="url"
              value={data.author.github}
              onChange={(e) => updateData({ author: { ...data.author, github: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://github.com/username"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Twitter</label>
            <input
              type="url"
              value={data.author.twitter}
              onChange={(e) => updateData({ author: { ...data.author, twitter: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://twitter.com/username"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 