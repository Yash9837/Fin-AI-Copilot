'use client';

import React, { useState } from 'react';

const DetailsPanel = ({ user }) => {
  const [isAttributesOpen, setIsAttributesOpen] = useState(false);
  const [isUserDataOpen, setIsUserDataOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Details</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h3 className="font-medium text-gray-700">Assignee</h3>
          <select className="border rounded-lg p-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
            <option>Ben King</option>
            <option>Unassigned</option>
          </select>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16M4 8h16M4 12h8M4 16h16M4 20h16" />
            </svg>
            Team
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            FastTrack
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700">Links</h3>
          <div className="mt-2">
            <p className="text-sm text-blue-600 hover:underline cursor-pointer">Track Claim Status</p>
            <p className="text-sm text-blue-600 hover:underline cursor-pointer">View Policy Details</p>
          </div>
        </div>

        <div className="mb-4">
          <h3
            className="font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
            onClick={() => setIsAttributesOpen(!isAttributesOpen)}
          >
            <svg className={`w-4 h-4 transform ${isAttributesOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Conversation Attributes
          </h3>
          {isAttributesOpen && (
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Status:</strong> Open</p>
              <p><strong>Priority:</strong> High</p>
              <p><strong>Waiting Since:</strong> 13m</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <h3
            className="font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
            onClick={() => setIsUserDataOpen(!isUserDataOpen)}
          >
            <svg className={`w-4 h-4 transform ${isUserDataOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            User Data
          </h3>
          {isUserDataOpen && (
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Order ID:</strong> {user.orderId}</p>
              {user.source && <p><strong>Source:</strong> {user.source}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsPanel;