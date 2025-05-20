'use client';

import { useState, useEffect } from 'react';
import InboxSidebar from '../components/InboxSidebar';
import ChatArea from '../components/ChatArea';
import AICopilot from '../components/AICopilot';
import Composer from '../components/Composer';
import DetailsPanel from '../components/DetailsPanel';
import { conversations, initialConversation } from '../data/dummyData';
import { generateResponse, summarizeConversation, rephraseTone } from '../utils/geminiApi';

export default function Home() {
  const [activeConversation, setActiveConversation] = useState(initialConversation);
  const [composerText, setComposerText] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ai-copilot');
  const [panelWidth, setPanelWidth] = useState(256); // Default width in pixels (equivalent to lg:w-64)
  const [isResizing, setIsResizing] = useState(false);

  const handleSelectConversation = (conversation) => {
    setActiveConversation({
      ...initialConversation,
      user: conversation.user,
      messages: initialConversation.messages.filter((msg) => msg.sender !== 'system'),
    });
    setShowSummary(false);
    setConversationSummary('');
    setError(null);
  };

  const handleAddToComposer = (content) => {
    setComposerText(content);
  };

  const handleRephrase = async (tone) => {
    if (composerText.trim()) {
      setError(null);
      const response = await rephraseTone(composerText, tone);
      if (response.success) {
        setComposerText(response.data);
      } else {
        setError(response.error);
      }
    }
  };

  const handleSummarize = async () => {
    setError(null);
    const response = await summarizeConversation(activeConversation.messages);
    if (response.success) {
      setConversationSummary(response.data);
      setShowSummary(true);
    } else {
      setError(response.error);
    }
  };

  const handleSendMessage = async (messageText) => {
    const newMessage = {
      id: activeConversation.messages.length + 1,
      content: messageText,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
      status: 'seen',
    };

    const updatedMessages = [...activeConversation.messages, newMessage];
    setActiveConversation({
      ...activeConversation,
      messages: updatedMessages,
    });

    setIsTyping(true);
    setError(null);
    const context = updatedMessages.map(msg => ({ sender: msg.sender, content: msg.content }));
    const prompt = 'Respond to the user as a helpful customer support agent.';
    const response = await generateResponse(prompt, context);

    setIsTyping(false);
    if (response.success) {
      const aiMessage = {
        id: updatedMessages.length + 1,
        content: response.data,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
        status: 'delivered',
      };

      setActiveConversation({
        ...activeConversation,
        messages: [...updatedMessages, aiMessage],
      });
    } else {
      setError(response.error);
    }
  };

  const handleReplyWithAI = async () => {
    setIsTyping(true);
    setError(null);
    const context = activeConversation.messages.map(msg => ({ sender: msg.sender, content: msg.content }));
    const prompt = 'Generate a helpful response to continue the conversation as a customer support agent.';
    const response = await generateResponse(prompt, context);

    setIsTyping(false);
    if (response.success) {
      const aiMessage = {
        id: activeConversation.messages.length + 1,
        content: response.data,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
        status: 'seen',
      };

      setActiveConversation({
        ...activeConversation,
        messages: [...activeConversation.messages, aiMessage],
      });

      setIsTyping(true);
      const userPrompt = 'Respond to the agent as a user continuing the conversation.';
      const userResponse = await generateResponse(userPrompt, [...activeConversation.messages, aiMessage]);

      setIsTyping(false);
      if (userResponse.success) {
        const userMessage = {
          id: activeConversation.messages.length + 2,
          content: userResponse.data,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
          status: 'delivered',
        };

        setActiveConversation({
          ...activeConversation,
          messages: [...activeConversation.messages, aiMessage, userMessage],
        });
      } else {
        setError(userResponse.error);
      }
    } else {
      setError(response.error);
    }
  };

  const handleSuggestVideoCall = () => {
    const videoCallMessage = {
      id: activeConversation.messages.length + 1,
      content: 'This issue might be complex. Would you like to schedule a video call to resolve it more efficiently?',
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' }),
      status: 'seen',
    };

    setActiveConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, videoCallMessage],
    });
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const container = document.querySelector('.main-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        if (newWidth >= 200 && newWidth <= 500) {
          setPanelWidth(newWidth);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <main className="flex h-screen flex-col lg:flex-row overflow-hidden">
      <InboxSidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        className="w-full lg:w-64 md:w-56 sm:w-full"
      />
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 text-sm">
            <p>{error}</p>
          </div>
        )}
        <div className="flex flex-1 overflow-hidden main-container">
          <div className="flex-1 flex flex-col">
            <ChatArea
              conversation={activeConversation}
              showSummary={showSummary}
              conversationSummary={conversationSummary}
              onSendMessage={handleSendMessage}
              onReplyWithAI={handleReplyWithAI}
              isTyping={isTyping}
              onSuggestVideoCall={handleSuggestVideoCall}
            />
            <Composer
              composerText={composerText}
              setComposerText={setComposerText}
              handleRephrase={handleRephrase}
              handleSummarize={handleSummarize}
              onSendMessage={handleSendMessage}
            />
          </div>
          <div
            className="flex flex-col h-full border-l border-slate-200 relative"
            style={{ width: `${panelWidth}px`, minWidth: '200px', maxWidth: '500px' }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute left-0 top-0 h-full w-2 cursor-col-resize -ml-1 hover:bg-gray-200 transition-all z-10" />
            <div className="flex justify-center border-b border-slate-200 p-4">
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
            {activeTab === 'ai-copilot' && (
              <AICopilot
                conversation={activeConversation}
                onAddToComposer={handleAddToComposer}
              />
            )}
            {activeTab === 'details' && <DetailsPanel user={activeConversation.user} />}
          </div>
        </div>
      </div>
    </main>
  );
}