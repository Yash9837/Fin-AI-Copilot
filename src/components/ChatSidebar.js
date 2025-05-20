'use client';

import React, { useState } from 'react';
import AICopilot from './AICopilot';
import DetailsPanel from './DetailsPanel';

const ChatSidebar = ({ conversation, user, onAddToComposer }) => {
  const [activeTab, setActiveTab] = useState('ai-copilot'); // Default to AI Copilot tab

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Segmented Control */}
      <div className="flex justify-center border-b border-gray-200 p-4">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('ai-copilot')}
            className={`pb-2 text-sm ${
              activeTab === 'ai-copilot'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 text-sm ${
              activeTab === 'details'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'ai-copilot' ? (
        <AICopilot conversation={conversation} onAddToComposer={onAddToComposer} />
      ) : (
        <DetailsPanel user={user} />
      )}
    </div>
  );
};

export default ChatSidebar;