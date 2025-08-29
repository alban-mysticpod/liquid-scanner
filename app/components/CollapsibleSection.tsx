'use client';

import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  badge?: string | number;
  defaultOpen?: boolean;
  level?: number;
  colorType?: 'directory' | 'file' | 'schema' | 'settings' | 'blocks' | 'presets' | 'other';
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon = "📁",
  badge,
  defaultOpen = false,
  level = 0,
  colorType = 'other',
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const paddingLeft = level * 20;
  
  const getColorClasses = () => {
    switch (colorType) {
      case 'directory':
        return {
          bg: 'bg-slate-50 border-l-4 border-l-slate-400',
          hover: 'hover:bg-slate-100',
          badge: 'bg-slate-100 text-slate-700'
        };
      case 'file':
        return {
          bg: 'bg-emerald-50 border-l-4 border-l-emerald-400',
          hover: 'hover:bg-emerald-100',
          badge: 'bg-emerald-100 text-emerald-700'
        };
      case 'schema':
        return {
          bg: 'bg-red-50 border-l-4 border-l-red-400',
          hover: 'hover:bg-red-100',
          badge: 'bg-red-100 text-red-700'
        };
      case 'settings':
        return {
          bg: 'bg-blue-50 border-l-4 border-l-blue-400',
          hover: 'hover:bg-blue-100',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'blocks':
        return {
          bg: 'bg-purple-50 border-l-4 border-l-purple-400',
          hover: 'hover:bg-purple-100',
          badge: 'bg-purple-100 text-purple-700'
        };
      case 'presets':
        return {
          bg: 'bg-amber-50 border-l-4 border-l-amber-400',
          hover: 'hover:bg-amber-100',
          badge: 'bg-amber-100 text-amber-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          hover: 'hover:bg-gray-100',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="border border-gray-200 rounded-md mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${colors.bg} ${colors.hover}`}
        style={{ paddingLeft: paddingLeft + 16 }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
