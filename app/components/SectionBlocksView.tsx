import React, { useState, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import SettingTypeIcon from './SettingTypeIcon';

interface BlockInfo {
  name: string;
  file: string;
  displayName: string;
  isPrivate: boolean;
  hasSchema: boolean;
  schema?: any;
  canBeAddedToSection: boolean;
  reason?: string;
}

interface SectionBlocksInfo {
  sectionName: string;
  sectionFile: string;
  sectionDisplayName: string;
  acceptsThemeBlocks: boolean;
  acceptsAppBlocks: boolean;
  allowedPrivateBlocks: string[];
  availableBlocks: {
    publicBlocks: BlockInfo[];
    privateBlocks: BlockInfo[];
  };
}

interface SectionBlocksData {
  success: boolean;
  summary?: {
    totalSections: number;
    totalBlocks: number;
    publicBlocks: number;
    privateBlocks: number;
    sectionsAcceptingThemeBlocks: number;
    sectionsAcceptingAppBlocks: number;
  };
  sectionBlocks?: SectionBlocksInfo[];
  error?: string;
}

interface SectionBlocksViewProps {
  // This component doesn't need any props since it fetches its own data
}

const SectionBlocksView: React.FC<SectionBlocksViewProps> = () => {
  const [blocksData, setBlocksData] = useState<SectionBlocksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSubView, setCurrentSubView] = useState<'by-section' | 'all-blocks'>('by-section');

  // Fetch blocks analysis on component mount
  useEffect(() => {
    const fetchBlocksData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/blocks-by-section');
        const data: SectionBlocksData = await response.json();
        setBlocksData(data);
      } catch (error) {
        console.error('Error fetching blocks data:', error);
        setBlocksData({
          success: false,
          error: 'Failed to load blocks analysis'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlocksData();
  }, []);

  // Helper function to render a block item
  const renderBlockItem = (block: BlockInfo) => (
    <div 
      key={block.name} 
      className={`p-3 rounded-md border ${
        block.canBeAddedToSection 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={block.canBeAddedToSection ? '✅' : '❌'} />
            {block.isPrivate && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">🔒 Private</span>}
            <span className="font-medium text-gray-900">
              {block.displayName}
            </span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-500">
              {block.file}
            </code>
          </div>
          
          {block.hasSchema && (
            <div className="mt-1 text-xs text-gray-600">
              📋 Has schema configuration
            </div>
          )}
          
          {block.reason && (
            <div className="mt-1 text-xs text-red-600">
              🚫 {block.reason}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to get all unique blocks from all sections
  const getAllBlocks = () => {
    if (!blocksData?.success || !blocksData.sectionBlocks) return [];
    
    const allBlocksMap = new Map<string, BlockInfo & { usableInSections: number }>();
    
    blocksData.sectionBlocks.forEach(sectionInfo => {
      [...sectionInfo.availableBlocks.publicBlocks, ...sectionInfo.availableBlocks.privateBlocks].forEach(block => {
        if (allBlocksMap.has(block.name)) {
          const existing = allBlocksMap.get(block.name)!;
          if (block.canBeAddedToSection) {
            existing.usableInSections += 1;
          }
        } else {
          allBlocksMap.set(block.name, {
            ...block,
            usableInSections: block.canBeAddedToSection ? 1 : 0
          });
        }
      });
    });
    
    return Array.from(allBlocksMap.values()).sort((a, b) => {
      // Sort by usability then by name
      if (a.usableInSections !== b.usableInSections) {
        return b.usableInSections - a.usableInSections;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  };

  const allBlocks = getAllBlocks();
  const usableBlocks = allBlocks.filter(b => b.usableInSections > 0);
  const unusableBlocks = allBlocks.filter(b => b.usableInSections === 0);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          🧩 Blocks Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Complete analysis of theme blocks. Switch between section-by-section view and global blocks overview.
        </p>
        
        {/* Sub-view toggle */}
        <div className="mt-4 flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setCurrentSubView('by-section')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${currentSubView === 'by-section'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            📊 By Section
          </button>
          <button
            onClick={() => setCurrentSubView('all-blocks')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${currentSubView === 'all-blocks'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            📋 All Blocks
          </button>
        </div>
        
        {loading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-800">
              ⏳ Analyzing blocks and section compatibility...
            </div>
          </div>
        )}
        
        {blocksData?.error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <div className="text-sm text-red-800">
              ❌ {blocksData.error}
            </div>
          </div>
        )}
      </div>

      {blocksData?.success && blocksData.summary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">📊 Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">{blocksData.summary.totalSections}</div>
              <div className="text-gray-600">Total sections</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">{blocksData.summary.totalBlocks}</div>
              <div className="text-gray-600">Total blocks</div>
            </div>
            <div>
              <div className="font-medium text-green-600">{usableBlocks.length}</div>
              <div className="text-gray-600">Usable blocks</div>
            </div>
            <div>
              <div className="font-medium text-red-600">{unusableBlocks.length}</div>
              <div className="text-gray-600">Unused blocks</div>
            </div>
            <div>
              <div className="font-medium text-emerald-600">{blocksData.summary.publicBlocks}</div>
              <div className="text-gray-600">Public blocks</div>
            </div>
            <div>
              <div className="font-medium text-orange-600">{blocksData.summary.privateBlocks}</div>
              <div className="text-gray-600">Private blocks</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">{blocksData.summary.sectionsAcceptingThemeBlocks}</div>
              <div className="text-gray-600">Accept @theme</div>
            </div>
            <div>
              <div className="font-medium text-indigo-600">{blocksData.summary.sectionsAcceptingAppBlocks}</div>
              <div className="text-gray-600">Accept @app</div>
            </div>
          </div>
        </div>
      )}

      {blocksData?.success && blocksData.sectionBlocks && currentSubView === 'by-section' && (
        <div className="space-y-4">
          {blocksData.sectionBlocks.map((sectionInfo) => {
            const addablePublic = sectionInfo.availableBlocks.publicBlocks.filter(b => b.canBeAddedToSection);
            const addablePrivate = sectionInfo.availableBlocks.privateBlocks.filter(b => b.canBeAddedToSection);
            const restrictedPublic = sectionInfo.availableBlocks.publicBlocks.filter(b => !b.canBeAddedToSection);
            const restrictedPrivate = sectionInfo.availableBlocks.privateBlocks.filter(b => !b.canBeAddedToSection);
            
            const totalAddable = addablePublic.length + addablePrivate.length;
            const totalRestricted = restrictedPublic.length + restrictedPrivate.length;
            
            return (
              <CollapsibleSection
                key={sectionInfo.sectionName}
                title={sectionInfo.sectionDisplayName}
                icon="🧩"
                badge={`${totalAddable} addable, ${totalRestricted} restricted`}
                defaultOpen={false}
                level={0}
                colorType="directory"
              >
                <div className="p-4 space-y-4">
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm text-gray-700">
                      <div className="font-medium text-gray-900 mb-1">
                        📋 Section Info
                      </div>
                      <p>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {sectionInfo.sectionFile}
                        </code>
                      </p>
                      <div className="mt-2 flex gap-4 text-xs">
                        <span className={sectionInfo.acceptsThemeBlocks ? 'text-green-600' : 'text-gray-400'}>
                          {sectionInfo.acceptsThemeBlocks ? '✅' : '❌'} Theme blocks (@theme)
                        </span>
                        <span className={sectionInfo.acceptsAppBlocks ? 'text-green-600' : 'text-gray-400'}>
                          {sectionInfo.acceptsAppBlocks ? '✅' : '❌'} App blocks (@app)
                        </span>
                      </div>
                      {sectionInfo.allowedPrivateBlocks.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Explicitly allowed private blocks:</span> {sectionInfo.allowedPrivateBlocks.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-md p-3">
                      <div className="text-sm text-green-800">
                        <div className="font-medium text-green-900">✅ Addable</div>
                        <div className="text-lg font-bold">{totalAddable}</div>
                        <div className="text-xs">
                          {addablePublic.length} public, {addablePrivate.length} private
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-md p-3">
                      <div className="text-sm text-red-800">
                        <div className="font-medium text-red-900">❌ Restricted</div>
                        <div className="text-lg font-bold">{totalRestricted}</div>
                        <div className="text-xs">
                          {restrictedPublic.length} public, {restrictedPrivate.length} private
                        </div>
                      </div>
                    </div>
                  </div>

                  {addablePublic.length > 0 && (
                    <CollapsibleSection
                      title="✅ Public Blocks (Available)"
                      icon="🌍"
                      badge={addablePublic.length}
                      defaultOpen={true}
                      level={1}
                      colorType="settings"
                    >
                      <div className="p-3 space-y-2">
                        {addablePublic.map(renderBlockItem)}
                      </div>
                    </CollapsibleSection>
                  )}

                  {addablePrivate.length > 0 && (
                    <CollapsibleSection
                      title="✅ Private Blocks (Explicitly Allowed)"
                      icon="🔓"
                      badge={addablePrivate.length}
                      defaultOpen={true}
                      level={1}
                      colorType="blocks"
                    >
                      <div className="p-3 space-y-2">
                        {addablePrivate.map(renderBlockItem)}
                      </div>
                    </CollapsibleSection>
                  )}

                  {restrictedPublic.length > 0 && (
                    <CollapsibleSection
                      title="❌ Public Blocks (Section Doesn't Accept @theme)"
                      icon="🚫"
                      badge={restrictedPublic.length}
                      defaultOpen={false}
                      level={1}
                      colorType="other"
                    >
                      <div className="p-3 space-y-2">
                        {restrictedPublic.map(renderBlockItem)}
                      </div>
                    </CollapsibleSection>
                  )}

                  {restrictedPrivate.length > 0 && (
                    <CollapsibleSection
                      title="❌ Private Blocks (Not Explicitly Allowed)"
                      icon="🔒"
                      badge={restrictedPrivate.length}
                      defaultOpen={false}
                      level={1}
                      colorType="other"
                    >
                      <div className="p-3 space-y-2">
                        {restrictedPrivate.map(renderBlockItem)}
                      </div>
                    </CollapsibleSection>
                  )}
                </div>
              </CollapsibleSection>
            );
          })}
        </div>
      )}

      {blocksData?.success && currentSubView === 'all-blocks' && (
        <div className="space-y-4">
          {usableBlocks.length > 0 && (
            <CollapsibleSection
              title="✅ Usable Blocks"
              icon="✅"
              badge={usableBlocks.length}
              defaultOpen={true}
              level={0}
              colorType="settings"
            >
              <div className="p-4 space-y-3">
                {usableBlocks.map((block) => (
                  <div 
                    key={block.name} 
                    className="p-3 rounded-md border bg-green-50 border-green-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span>✅</span>
                          {block.isPrivate && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">🔒 Private</span>}
                          <span className="font-medium text-gray-900">
                            {block.displayName}
                          </span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-500">
                            {block.file}
                          </code>
                        </div>
                        
                        <div className="mt-1 text-xs text-green-600">
                          📍 Usable in {block.usableInSections} section{block.usableInSections !== 1 ? 's' : ''}
                        </div>
                        
                        {block.hasSchema && (
                          <div className="mt-1 text-xs text-gray-600">
                            📋 Has schema configuration
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {unusableBlocks.length > 0 && (
            <CollapsibleSection
              title="❌ Unused Blocks"
              icon="❌"
              badge={unusableBlocks.length}
              defaultOpen={false}
              level={0}
              colorType="other"
            >
              <div className="p-4 space-y-3">
                {unusableBlocks.map((block) => (
                  <div 
                    key={block.name} 
                    className="p-3 rounded-md border bg-red-50 border-red-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span>❌</span>
                          {block.isPrivate && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">🔒 Private</span>}
                          <span className="font-medium text-gray-900">
                            {block.displayName}
                          </span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-500">
                            {block.file}
                          </code>
                        </div>
                        
                        <div className="mt-1 text-xs text-red-600">
                          🚫 Not usable in any section
                        </div>
                        
                        {block.hasSchema && (
                          <div className="mt-1 text-xs text-gray-600">
                            📋 Has schema configuration
                          </div>
                        )}
                        
                        {block.reason && (
                          <div className="mt-1 text-xs text-gray-500">
                            💡 {block.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}

      {!blocksData?.success && !loading && (
        <div className="bg-amber-50 rounded-md p-3">
          <div className="text-sm text-amber-800">
            <div className="font-medium text-amber-900 mb-1">
              ⚙️ Loading Blocks Analysis
            </div>
            <p className="text-xs">
              Analyzing block compatibility with sections...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionBlocksView;
