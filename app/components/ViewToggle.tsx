import React from 'react';

export type ViewType = 'pages' | 'files' | 'blocks';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('pages')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentView === 'pages' 
            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <span className="text-lg">📄</span>
        <span>Pages</span>
      </button>
      
      <button
        onClick={() => onViewChange('blocks')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentView === 'blocks' 
            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <span className="text-lg">🧩</span>
        <span>Blocks</span>
      </button>
      
      <button
        onClick={() => onViewChange('files')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
          ${currentView === 'files' 
            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
      >
        <span className="text-lg">📁</span>
        <span>File Explorer</span>
      </button>
    </div>
  );
};

export default ViewToggle;
