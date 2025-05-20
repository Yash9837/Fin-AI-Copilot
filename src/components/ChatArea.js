import React from 'react';

export default function ChatArea({ conversation, showSummary, conversationSummary, onSendMessage, isTyping, onSuggestVideoCall }) {
  if (!conversation) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h2 className="text-lg font-semibold text-gray-900">{conversation.user.name}</h2>
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
          <button className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800 transition">
            Close
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {showSummary && conversationSummary && (
          <div className="mb-6 max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-1">Conversation Summary:</p>
            <p className="text-sm text-yellow-700">{conversationSummary}</p>
          </div>
        )}
        
        <div className="max-w-2xl mx-auto space-y-4">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.sender === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {conversation.user.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 max-w-[80%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.sender === 'user' ? conversation.user.name : message.sender === 'agent' ? 'You' : 'Fin'}
                  </span>
                  {message.sender === 'agent' && (
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  )}
                </div>
                
                <div
                  className={`p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gray-100'
                      : message.sender === 'system'
                      ? 'bg-gray-100 text-gray-600 italic'
                      : 'bg-blue-100'
                  }`}
                  style={{ borderRadius: '16px', margin: '8px 0' }}
                >
                  <p className="text-sm text-gray-800 whitespace-pre-line">{message.content}</p>
                </div>

                {message.sender === 'agent' && (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>Seen · {message.timestamp}</span>
                    <div className="w-4 h-4 ml-2 rounded-full overflow-hidden">
                      <div className="bg-gray-300 w-full h-full flex items-center justify-center text-xs">
                        A
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">Fin</div>
                <div className="bg-gray-100 p-3 rounded-lg max-w-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}