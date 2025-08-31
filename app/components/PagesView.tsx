import React, { useState, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';

interface LiquidFile {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  lastModified: Date;
  directory: string;
  hasSchema: boolean;
  schema?: any;
  schemaRaw?: string;
}

interface SectionInfo {
  name: string;
  file: string;
  displayName: string;
  hasPresets: boolean;
  presetsCount: number;
  presets: any[];
  enabled_on?: {
    templates?: string[];
    groups?: string[];
  };
  disabled_on?: {
    groups?: string[];
  };
  availableInGroups: {
    header: boolean;
    main: boolean;
    footer: boolean;
  };
  restrictions: {
    header?: string;
    main?: string;
    footer?: string;
  };
}

interface PageZones {
  header: SectionInfo[];
  main: SectionInfo[];
  footer: SectionInfo[];
}

interface SectionsByPageData {
  success: boolean;
  summary?: {
    totalSections: number;
    byPage: Array<{
      pageType: string;
      pageName: string;
      header: number;
      main: number;
      footer: number;
      total: number;
      withPresets: {
        header: number;
        main: number;
        footer: number;
      };
    }>;
  };
  sectionsByPage?: {
    [pageType: string]: PageZones;
  };
  error?: string;
}

interface PagesViewProps {
  files: LiquidFile[];
}

const PagesView: React.FC<PagesViewProps> = ({ files }) => {
  const [sectionsData, setSectionsData] = useState<SectionsByPageData | null>(null);
  const [loading, setLoading] = useState(false);

  // Define page types based on template analysis
  const pageTypes = [
    {
      id: 'index',
      name: 'Home Page',
      icon: '🏠',
      description: 'Main landing page (index.json)',
      templateFile: 'index.json'
    },
    {
      id: 'product',
      name: 'Product Page',
      icon: '🛍️',
      description: 'Individual product pages (product.json)',
      templateFile: 'product.json'
    },
    {
      id: 'collection',
      name: 'Collection Page',
      icon: '📂',
      description: 'Product collection pages (collection.json)',
      templateFile: 'collection.json'
    },
    {
      id: 'cart',
      name: 'Cart Page',
      icon: '🛒',
      description: 'Shopping cart page (cart.json)',
      templateFile: 'cart.json'
    },
    {
      id: 'blog',
      name: 'Blog Pages',
      icon: '📝',
      description: 'Blog listing and article pages (blog.json, article.json)',
      templateFile: 'blog.json'
    },
    {
      id: '404',
      name: '404 Error Page',
      icon: '❌',
      description: 'Error page (404.json)',
      templateFile: '404.json'
    },
    {
      id: 'search',
      name: 'Search Page',
      icon: '🔍',
      description: 'Search results page (search.json)',
      templateFile: 'search.json'
    },
    {
      id: 'page',
      name: 'Regular Pages',
      icon: '📄',
      description: 'Static pages (page.json, page.contact.json)',
      templateFile: 'page.json'
    }
  ];

  // Fetch sections analysis on component mount
  useEffect(() => {
    const fetchSectionsData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/sections-by-page');
        const data: SectionsByPageData = await response.json();
        setSectionsData(data);
      } catch (error) {
        console.error('Error fetching sections data:', error);
        setSectionsData({
          success: false,
          error: 'Failed to load sections analysis'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSectionsData();
  }, []);

  // Helper function to render a section item
  const renderSectionItem = (section: SectionInfo, zone: string) => (
    <div 
      key={`${section.name}-${zone}`} 
      className="p-3 rounded-md border bg-green-50 border-green-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span className="font-medium text-gray-900">
              {section.displayName}
            </span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-500">
              {section.file}
            </code>
          </div>
          
          {section.hasPresets && (
            <div className="mt-1 text-xs text-gray-600">
              🎨 {section.presetsCount} preset{section.presetsCount !== 1 ? 's' : ''} available
            </div>
          )}
          
          {/* Show zones where this section is available */}
          <div className="mt-1 text-xs text-blue-600">
            📍 Available in: {
              Object.entries(section.availableInGroups)
                .filter(([_, available]) => available)
                .map(([zone, _]) => zone)
                .join(', ')
            }
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          📄 Pages Overview
        </h3>
        <p className="text-sm text-gray-600">
          Real-time analysis of section availability by page type. Sections are filtered based on enabled_on/disabled_on rules.
        </p>
        
        {loading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-800">
              ⏳ Analyzing sections and their page compatibility...
            </div>
          </div>
        )}
        
        {sectionsData?.error && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <div className="text-sm text-red-800">
              ❌ {sectionsData.error}
            </div>
          </div>
        )}
      </div>

      {sectionsData?.success && sectionsData.summary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">📊 Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">{sectionsData.summary.totalSections}</div>
              <div className="text-gray-600">Total sections</div>
            </div>
            <div>
              <div className="font-medium text-green-600">
                {sectionsData.summary.byPage.reduce((sum, page) => sum + page.total, 0)}
              </div>
              <div className="text-gray-600">Total available (all zones)</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">
                {sectionsData.summary.byPage.reduce((sum, page) => 
                  sum + page.withPresets.header + page.withPresets.main + page.withPresets.footer, 0
                )}
              </div>
              <div className="text-gray-600">With presets (all zones)</div>
            </div>
            <div>
              <div className="font-medium text-purple-600">
                {pageTypes.length}
              </div>
              <div className="text-gray-600">Page types</div>
            </div>
          </div>
        </div>
      )}

      {pageTypes.map((pageType) => {
        const pageStats = sectionsData?.summary?.byPage.find(p => p.pageType === pageType.id);
        const pageZones = sectionsData?.sectionsByPage?.[pageType.id] || { header: [], main: [], footer: [] };
        
        return (
          <CollapsibleSection
            key={pageType.id}
            title={pageType.name}
            icon={pageType.icon}
            badge={pageStats ? `${pageStats.total} sections` : pageType.templateFile}
            defaultOpen={pageType.id === 'index'} // Open Home Page by default
            level={0}
            colorType="directory"
          >
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium text-gray-900 mb-1">
                    📋 Description
                  </div>
                  <p>{pageType.description}</p>
                </div>
              </div>
              
              {pageStats && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-md p-3">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium text-blue-900">🎯 Header</div>
                      <div className="text-lg font-bold">{pageStats.header}</div>
                      <div className="text-xs">{pageStats.withPresets.header} with presets</div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-md p-3">
                    <div className="text-sm text-green-800">
                      <div className="font-medium text-green-900">📄 Main Content</div>
                      <div className="text-lg font-bold">{pageStats.main}</div>
                      <div className="text-xs">{pageStats.withPresets.main} with presets</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-md p-3">
                    <div className="text-sm text-purple-800">
                      <div className="font-medium text-purple-900">⬇️ Footer</div>
                      <div className="text-lg font-bold">{pageStats.footer}</div>
                      <div className="text-xs">{pageStats.withPresets.footer} with presets</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Header Sections */}
              {pageZones.header.length > 0 && (
                <CollapsibleSection
                  title="🎯 Header Sections"
                  icon="🎯"
                  badge={pageZones.header.length}
                  defaultOpen={false}
                  level={1}
                  colorType="blocks"
                >
                  <div className="p-3 space-y-2">
                    {pageZones.header.map(section => renderSectionItem(section, 'header'))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Main Content Sections */}
              {pageZones.main.length > 0 && (
                <CollapsibleSection
                  title="📄 Main Content Sections"
                  icon="📄"
                  badge={pageZones.main.length}
                  defaultOpen={true}
                  level={1}
                  colorType="settings"
                >
                  <div className="p-3 space-y-2">
                    {pageZones.main.map(section => renderSectionItem(section, 'main'))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Footer Sections */}
              {pageZones.footer.length > 0 && (
                <CollapsibleSection
                  title="⬇️ Footer Sections"
                  icon="⬇️"
                  badge={pageZones.footer.length}
                  defaultOpen={false}
                  level={1}
                  colorType="presets"
                >
                  <div className="p-3 space-y-2">
                    {pageZones.footer.map(section => renderSectionItem(section, 'footer'))}
                  </div>
                </CollapsibleSection>
              )}

              {!sectionsData?.success && !loading && (
                <div className="bg-amber-50 rounded-md p-3">
                  <div className="text-sm text-amber-800">
                    <div className="font-medium text-amber-900 mb-1">
                      ⚙️ Loading Sections Analysis
                    </div>
                    <p className="text-xs">
                      Analyzing section compatibility with page zones...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
};

export default PagesView;
