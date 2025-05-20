'use client';

import React, { useState } from 'react';

export default function InboxSidebar({ conversations, activeConversation, onSelectConversation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (sortOption === 'Newest') {
      return parseInt(b.timeAgo) - parseInt(a.timeAgo);
    }
    return parseInt(a.timeAgo) - parseInt(b.timeAgo);
  });

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen lg:w-64 md:w-56 sm:w-full sm:border-r-0 sm:border-b sm:border-b-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-slate-800">Your inbox</h1>
      </div>
  
      <div className="p-4">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
  
      <div className="p-2 border-b border-slate-200 flex items-center gap-2">
        <span className="flex items-center text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <span className="text-blue-600 font-medium">{conversations.length} Open</span>
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </span>
  
        <span className="flex items-center gap-1 text-sm text-slate-600 ml-auto">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
          </select>
        </span>
      </div>
  
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-200 transition-all duration-200 rounded-r-lg ${
              activeConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  conversation.isSystem ? 'bg-slate-800' : 'bg-blue-600'
                } text-white`}
              >
                {conversation.isSystem ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  conversation.avatar
                )}
              </div>
  
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div className="font-medium text-sm truncate flex items-center text-slate-800">
                    {conversation.user.name}
                    {conversation.priority && (
                      <span className="ml-1 bg-yellow-200 text-yellow-800 text-xs px-1 rounded">Snooze</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{conversation.timeAgo}</div>
                </div>
  
                {conversation.user.source && (
                  <div className="text-xs text-slate-500 flex items-center">
                    <span>{conversation.user.source}</span>
                  </div>
                )}
  
                <div className="text-sm text-slate-600 truncate mt-1">{conversation.snippet}</div>
  
                {conversation.secondLine && (
                  <div className="text-xs text-slate-500 mt-1">{conversation.secondLine}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}