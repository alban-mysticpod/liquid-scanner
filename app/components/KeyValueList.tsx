'use client';

import React, { useState } from 'react';
import SettingTypeIcon from './SettingTypeIcon';
import CollapsibleSection from './CollapsibleSection';

interface KeyValueListProps {
  data: Record<string, any>;
  title?: string;
  showTypeIcons?: boolean;
}

const KeyValueList: React.FC<KeyValueListProps> = ({ data, title, showTypeIcons = false }) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `[${value.length} items]`;
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderOptionsTable = (options: any[]) => {
    if (!Array.isArray(options) || options.length === 0) return null;

    return (
      <div className="mt-2">
        <CollapsibleSection
          title={`Options (${options.length})`}
          icon="📋"
          defaultOpen={false}
          level={3}
          colorType="other"
        >
          <div className="p-3 bg-gray-50">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    {options[0] && Object.keys(options[0]).map(key => (
                      <th key={key} className="px-2 py-1 text-left font-medium text-gray-700 uppercase tracking-wider border-b">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {options.map((option, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(option).map((value: any, valueIndex) => (
                        <td key={valueIndex} className="px-2 py-1 whitespace-nowrap text-gray-900 border-b">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      {title && (
        <div className="flex items-center space-x-2 mb-3">
          {showTypeIcons && data.type && (
            <SettingTypeIcon type={data.type} className="w-5 h-5 text-blue-600" />
          )}
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        </div>
      )}
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-start border-b border-gray-100 pb-2 last:border-b-0">
            <div className="sm:w-1/3 text-sm font-medium text-gray-700 mb-1 sm:mb-0 flex items-center space-x-2">
              <span>{key}:</span>
              {showTypeIcons && key === 'type' && (
                <SettingTypeIcon type={String(value)} className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <div className="sm:w-2/3 text-sm text-gray-900">
              {key === 'options' && Array.isArray(value) ? (
                <div>
                  <span className="text-gray-600">[{value.length} options]</span>
                  {renderOptionsTable(value)}
                </div>
              ) : typeof value === 'object' && value !== null ? (
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                  {formatValue(value)}
                </pre>
              ) : (
                <span className="break-words">{formatValue(value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyValueList;
