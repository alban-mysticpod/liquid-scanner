'use client';

import { useState, useEffect } from 'react';
import FileExplorer from './components/FileExplorer';
import PagesView from './components/PagesView';
import SectionBlocksView from './components/SectionBlocksView';
import ViewToggle, { ViewType } from './components/ViewToggle';

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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface ScanResult {
  success: boolean;
  count?: number;
  files?: LiquidFile[];
  scannedPath?: string;
  error?: string;
  details?: string;
}

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOnlyWithSchema, setShowOnlyWithSchema] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('pages'); // Default to Pages view

  const scanFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scan');
      const data: ScanResult = await response.json();
      setScanResult(data);
    } catch (error) {
      setScanResult({
        success: false,
        error: 'API connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatic scan on load
    scanFiles();
  }, []);

  // Filter files based on schema toggle
  const filteredFiles = scanResult?.files ? 
    (showOnlyWithSchema ? scanResult.files.filter(file => file.hasSchema) : scanResult.files) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Liquid Files Scanner
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Hierarchical analysis of .liquid files in Shopify Horizon theme
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={scanFiles}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Scanning...' : 'Rescan Files'}
            </button>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyWithSchema}
                onChange={(e) => setShowOnlyWithSchema(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Show only files with schema
              </span>
            </label>
          </div>
        </div>

        {scanResult && (
          <div className="mb-8">
            {scanResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Scan completed successfully
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>{scanResult.count}</strong> .liquid files found</p>
                      <p className="text-xs mt-1">Scanned path: {scanResult.scannedPath}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Scan error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{scanResult.error}</p>
                      {scanResult.details && (
                        <p className="text-xs mt-1">{scanResult.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {scanResult?.success && (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Files Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{scanResult.count}</div>
                  <div className="text-sm text-blue-800">Total .liquid files</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {scanResult.files?.filter(f => f.hasSchema).length || 0}
                  </div>
                  <div className="text-sm text-green-800">Files with schema</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {showOnlyWithSchema ? 
                      new Set(filteredFiles.map(f => f.directory)).size :
                      new Set(scanResult.files?.map(f => f.directory) || []).size
                    }
                  </div>
                  <div className="text-sm text-purple-800">
                    Directories {showOnlyWithSchema ? '(filtered)' : ''}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatFileSize(scanResult.files?.reduce((sum, file) => sum + file.size, 0) || 0)}
                  </div>
                  <div className="text-sm text-orange-800">Total size</div>
                </div>
              </div>
            </div>

            {/* View Toggle and Content */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {currentView === 'pages' ? '📄 Pages View' : 
                       currentView === 'blocks' ? '🧩 Blocks View' : '📁 File Explorer'}
                      {showOnlyWithSchema && currentView === 'files' && ' (Schema Files Only)'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentView === 'pages' 
                        ? 'Organized by page type and template structure. Default view for theme analysis.'
                        : currentView === 'blocks'
                        ? 'Analysis of which blocks can be added to each section. Shows compatibility rules.'
                        : 'Hierarchical view of directories, files, and their schemas. Click to expand/collapse sections.'
                      }
                    </p>
                  </div>
                  
                  <ViewToggle 
                    currentView={currentView} 
                    onViewChange={setCurrentView} 
                  />
                </div>
              </div>
              
              <div className="p-6">
                {currentView === 'pages' ? (
                  <PagesView files={filteredFiles} />
                ) : currentView === 'blocks' ? (
                  <SectionBlocksView />
                ) : (
                  <FileExplorer files={filteredFiles} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}