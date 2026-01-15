'use client';

import React, { useState } from 'react';

export default function InboxSidebar({ conversations, activeConversation, onSelectConversation, onTogglePriority }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [filterOption, setFilterOption] = useState('All');

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterOption === 'Priority') return matchesSearch && conversation.priority;
    if (filterOption === 'Unread') return matchesSearch && conversation.unread;
    return matchesSearch;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (sortOption === 'Newest') {
      return parseInt(a.timeAgo) - parseInt(b.timeAgo);
    }
    if (sortOption === 'Oldest') {
      return parseInt(b.timeAgo) - parseInt(a.timeAgo);
    }
    if (sortOption === 'Priority') {
      return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
    }
    return 0;
  });

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen lg:w-64 md:w-56 sm:w-full sm:border-r-0 sm:border-b sm:border-b-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-slate-800">Your inbox</h1>
        <button className="p-1.5 hover:bg-slate-200 rounded" title="Refresh">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
  
      <div className="p-4 space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All ({conversations.length})</option>
            <option value="Unread">Unread ({conversations.filter(c => c.unread).length})</option>
            <option value="Priority">Priority ({conversations.filter(c => c.priority).length})</option>
          </select>
          
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="Priority">Priority First</option>
          </select>
        </div>
      </div>
  
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No conversations found</p>
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-200 transition-all duration-200 relative ${
                activeConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    conversation.isSystem ? 'bg-slate-800' : 'bg-blue-600'
                  } text-white font-medium text-sm`}
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
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm truncate flex items-center gap-1 text-slate-800">
                      {conversation.user.name}
                      {conversation.priority && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePriority?.(conversation.id);
                          }}
                          className="flex items-center"
                          title="Priority conversation"
                        >
                          <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      )}
                      {conversation.unread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap ml-2">{conversation.timeAgo}</div>
                  </div>
    
                  {conversation.user.source && (
                    <div className="text-xs text-slate-500 flex items-center mt-0.5">
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
          ))
        )}
      </div>
    </div>
  );
}

