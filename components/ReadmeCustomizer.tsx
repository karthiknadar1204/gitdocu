'use client';

import { useState } from 'react';
import BasicInfoSection from './sections/BasicInfoSection';
import InstallationSection from './sections/InstallationSection';
import UsageSection from './sections/UsageSection';
import FeaturesSection from './sections/FeaturesSection';
import DevelopmentSection from './sections/DevelopmentSection';
import ContributingSection from './sections/ContributingSection';
import LicenseSection from './sections/LicenseSection';
import SupportSection from './sections/SupportSection';
import StylingSection from './sections/StylingSection';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ReadmeCustomizerProps {
  customizationData: any;
  setCustomizationData: (data: any) => void;
  repoData: any;
}

const DEFAULT_SECTION_ORDER = [
  'basic',
  'installation',
  'usage',
  'features',
  'development',
  'contributing',
  'license',
  'support',
  'styling',
];

const SECTION_MAP: Record<string, { name: string; icon: string }> = {
  basic: { name: 'Basic Information', icon: '📋' },
  installation: { name: 'Installation', icon: '⚙️' },
  usage: { name: 'Usage & Examples', icon: '🚀' },
  features: { name: 'Features', icon: '✨' },
  development: { name: 'Development', icon: '🛠️' },
  contributing: { name: 'Contributing', icon: '🤝' },
  license: { name: 'License', icon: '📄' },
  support: { name: 'Support', icon: '💬' },
  styling: { name: 'Styling & Layout', icon: '🎨' },
};

export default function ReadmeCustomizer({ customizationData, setCustomizationData, repoData }: ReadmeCustomizerProps) {
  const [activeSection, setActiveSection] = useState('basic');
  const [reorderMode, setReorderMode] = useState(false);

  // Section order state (persist in customizationData)
  const sectionOrder = customizationData.sectionOrder || DEFAULT_SECTION_ORDER;

  const updateSection = (sectionId: string, data: any) => {
    setCustomizationData((prev: any) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], ...data },
    }));
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'basic':
        return (
          <BasicInfoSection
            data={customizationData.basicInfo}
            updateData={(data: any) => updateSection('basicInfo', data)}
            repoData={repoData}
          />
        );
      case 'installation':
        return (
          <InstallationSection
            data={customizationData.sections.installation}
            updateData={(data: any) => updateSection('sections.installation', data)}
            repoData={repoData}
          />
        );
      case 'usage':
        return (
          <UsageSection
            data={customizationData.sections.usage}
            updateData={(data: any) => updateSection('sections.usage', data)}
            repoData={repoData}
          />
        );
      case 'features':
        return (
          <FeaturesSection
            data={customizationData.sections.features}
            updateData={(data: any) => updateSection('sections.features', data)}
            repoData={repoData}
          />
        );
      case 'development':
        return (
          <DevelopmentSection
            data={customizationData.sections.development}
            updateData={(data: any) => updateSection('sections.development', data)}
            repoData={repoData}
          />
        );
      case 'contributing':
        return (
          <ContributingSection
            data={customizationData.sections.contributing}
            updateData={(data: any) => updateSection('sections.contributing', data)}
            repoData={repoData}
          />
        );
      case 'license':
        return (
          <LicenseSection
            data={customizationData.sections.license}
            updateData={(data: any) => updateSection('sections.license', data)}
            repoData={repoData}
          />
        );
      case 'support':
        return (
          <SupportSection
            data={customizationData.sections.support}
            updateData={(data: any) => updateSection('sections.support', data)}
            repoData={repoData}
          />
        );
      case 'styling':
        return (
          <StylingSection
            data={customizationData.styling}
            updateData={(data: any) => updateSection('styling', data)}
            repoData={repoData}
          />
        );
      default:
        return null;
    }
  };

  // Drag and drop handlers
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(sectionOrder);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setCustomizationData((prev: any) => ({ ...prev, sectionOrder: newOrder }));
  };

  return (
    <div className="h-full flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Customization</h2>
          <button
            className={`px-2 py-1 text-xs rounded transition-colors ${reorderMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setReorderMode((v) => !v)}
            title="Reorder Sections"
          >
            {reorderMode ? 'Done' : 'Reorder'}
          </button>
        </div>
        {reorderMode ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {sectionOrder.map((sectionId: string, idx: number) => (
                    <Draggable key={sectionId} draggableId={sectionId} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md border transition-colors bg-white ${snapshot.isDragging ? 'border-blue-400 shadow-lg' : 'border-gray-200'} cursor-move`}
                        >
                          <span className="mr-3 text-lg">{SECTION_MAP[sectionId].icon}</span>
                          {SECTION_MAP[sectionId].name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <nav className="space-y-1">
            {sectionOrder.map((sectionId: string) => (
              <button
                key={sectionId}
                onClick={() => setActiveSection(sectionId)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === sectionId
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{SECTION_MAP[sectionId].icon}</span>
                {SECTION_MAP[sectionId].name}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {!reorderMode && renderSection(activeSection)}
          {reorderMode && (
            <div className="text-center text-gray-500 mt-20">
              <span className="text-lg">Drag and drop to reorder sections</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 