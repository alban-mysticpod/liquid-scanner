'use client';

import React from 'react';
import CollapsibleSection from './CollapsibleSection';
import KeyValueList from './KeyValueList';

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

interface FileExplorerProps {
  files: LiquidFile[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files }) => {
  // Group files by directory
  const groupedFiles = files.reduce((groups: Record<string, LiquidFile[]>, file) => {
    const dir = file.directory === '.' ? 'root' : file.directory;
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(file);
    return groups;
  }, {});

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US');
  };

  const renderSchemaSection = (schema: any, sectionKey: string, icon: string) => {
    const sectionData = schema[sectionKey];
    if (!sectionData || !Array.isArray(sectionData)) return null;

    return (
      <CollapsibleSection
        title={`${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}`}
        icon={icon}
        badge={sectionData.length}
        level={2}
        colorType={sectionKey as 'settings' | 'blocks' | 'presets'}
      >
        <div className="p-4 space-y-4">
          {sectionData.map((item: any, index: number) => (
            <KeyValueList
              key={index}
              data={item}
              title={item.id || item.name || `${sectionKey.slice(0, -1).charAt(0).toUpperCase() + sectionKey.slice(0, -1).slice(1)} ${index + 1}`}
              showTypeIcons={true}
            />
          ))}
        </div>
      </CollapsibleSection>
    );
  };

  const renderFile = (file: LiquidFile) => {
    const fileIcon = file.hasSchema ? '📄' : '📝';
    const fileTitle = (
      <div className="flex items-center justify-between w-full">
        <span>{file.name}</span>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.lastModified.toString())}</span>
        </div>
      </div>
    );

    if (!file.hasSchema) {
      return (
        <div key={file.relativePath} className="px-4 py-2 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{fileIcon}</span>
            {fileTitle}
          </div>
        </div>
      );
    }

    return (
      <CollapsibleSection
        key={file.relativePath}
        title={file.name}
        icon={fileIcon}
        badge="Schema"
        level={1}
        colorType="file"
      >
        <div className="p-4 space-y-2">
          {file.schema ? (
            <div className="space-y-2">
              {/* Main schema properties */}
              <KeyValueList 
                data={{
                  name: file.schema.name || 'Not specified',
                  tag: file.schema.tag || 'Not specified',
                  class: file.schema.class || 'Not specified'
                }}
                title="Schema Information"
              />

              {/* Settings section */}
              {renderSchemaSection(file.schema, 'settings', '⚙️')}

              {/* Blocks section */}
              {renderSchemaSection(file.schema, 'blocks', '🧩')}

              {/* Presets section */}
              {renderSchemaSection(file.schema, 'presets', '🎨')}

              {/* Other properties */}
              {Object.keys(file.schema).filter(key => !['name', 'tag', 'class', 'settings', 'blocks', 'presets'].includes(key)).length > 0 && (
                <CollapsibleSection
                  title="Other Properties"
                  icon="📋"
                  level={2}
                  colorType="other"
                >
                  <div className="p-4">
                    <KeyValueList 
                      data={Object.fromEntries(
                        Object.entries(file.schema).filter(([key]) => 
                          !['name', 'tag', 'class', 'settings', 'blocks', 'presets'].includes(key)
                        )
                      )}
                    />
                  </div>
                </CollapsibleSection>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ JSON Parsing Error</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Schema content was found but is not valid JSON.
              </p>
              <pre className="bg-yellow-100 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {file.schemaRaw}
              </pre>
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedFiles).map(([directory, dirFiles]) => {
        const filesWithSchema = dirFiles.filter(f => f.hasSchema);
        
        return (
          <CollapsibleSection
            key={directory}
            title={directory}
            icon="📁"
            badge={`${dirFiles.length} files${filesWithSchema.length > 0 ? ` • ${filesWithSchema.length} schemas` : ''}`}
            defaultOpen={true}
            level={0}
            colorType="directory"
          >
            <div className="bg-white">
              {dirFiles.map(renderFile)}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
};

export default FileExplorer;
