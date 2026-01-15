'use client';

import React, { useState, useEffect } from 'react';
import { generateResponse, generateAdvice, checkInternalContent } from '../utils/claudeApi';
import { knowledgeBase } from '../data/dummyData';

const AICopilot = ({ conversation, onAddToComposer }) => {
  const [suggestedResponse, setSuggestedResponse] = useState(null);
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateSuggestion = async () => {
      setLoading(true);
      setError(null);
      try {
        const lastMessage = conversation.messages[conversation.messages.length - 1]?.content || '';
        const context = conversation.messages.map(msg => ({ sender: msg.sender, content: msg.content }));
        const prompt = `Based on the following knowledge base and conversation context, generate 1 concise and important response (max 2-3 sentences) for the agent:\n\nKnowledge Base: ${JSON.stringify(knowledgeBase)}\n\nLast Message: ${lastMessage}`;
        
        const response = await generateResponse(prompt, context);
        if (!response.success) throw new Error(response.error);

        const suggestion = {
          id: 1,
          question: 'How do I get a refund?',
          answer: `We understand that sometimes a purchase may not meet your expectations, and you may need to request a refund.

To assist you with your refund request, could you please provide your order ID and proof of purchase.

Please note:
We can only refund orders placed within the last 60 days, and your item must meet our requirements for condition to be returned. Please check when you placed your order before proceeding.

Once I've checked these details, if everything looks OK, I will send a returns QR code which you can use to post the item back to us. Your refund will be automatically issued once you put it in the post.`,
          advice: '',
          containsInternalContent: false,
        };

        const adviceResult = await generateAdvice(suggestion.answer);
        suggestion.advice = adviceResult.success ? adviceResult.data : 'Could not generate advice.';
        
        const internalCheck = await checkInternalContent(suggestion.answer);
        suggestion.containsInternalContent = internalCheck.success ? internalCheck.data : false;

        setSuggestedResponse(suggestion);

        const articles = [
          { id: 1, title: 'Getting a refund', content: 'Information about refund procedures and requirements', type: 'documentation' },
          { id: 2, title: 'Refund for an order placed by mistake', content: 'How to handle mistaken orders', type: 'documentation' },
          { id: 3, title: 'Refund for an unwanted gift', content: 'Process for returning unwanted gifts', type: 'documentation' }
        ];
        setKnowledgeArticles(articles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (conversation) {
      generateSuggestion();
    }
  }, [conversation]);

  const handleAskFollowUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const context = conversation.messages.map(msg => ({ sender: msg.sender, content: msg.content }));
      const prompt = `Answer the following follow-up question based on the conversation context:\n\nQuestion: ${followUpQuestion}`;
      const response = await generateResponse(prompt, context);
      if (!response.success) throw new Error(response.error);

      let answer = response.data;
      const internalCheck = await checkInternalContent(answer);
      if (internalCheck.success && internalCheck.data) {
        answer += `\n\n⚠️ Contains internal content: ${internalCheck.data}`;
      }

      setFollowUpAnswer(answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-blue-600">AI Copilot</span>
        </div>
        <button className="p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* AI Introduction */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Hi, I'm Fin AI Copilot</h3>
          <p className="text-sm text-gray-600">Ask me anything about this conversation.</p>
        </div>

        {loading && (
          <div className="text-center text-gray-500 text-sm mb-4">
            <p>Loading AI suggestion...</p>
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 text-sm mb-4">
            <p>{error}</p>
          </div>
        )}

      
        {/* Suggested Response */}
{suggestedResponse && (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-600">Suggested</span>
      <button
        onClick={() => onAddToComposer(suggestedResponse.answer)}
        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-6 4H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Add to composer
      </button>
    </div>
    <div className="flex items-start gap-3">
      <span className="text-lg">⭐</span>
      <div className="max-w-[80%]">
        <p className="text-sm font-medium text-gray-800 mb-1">{suggestedResponse.question}</p>
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #e8d5ff 0%, #f0e6ff 50%, #f5f0ff 100%)',
            borderRadius: '16px',
            margin: '8px 0',
          }}
        >
          <p className="text-sm text-gray-800 whitespace-pre-line">{suggestedResponse.answer}</p>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Knowledge Sources */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{knowledgeArticles.length} relevant sources found</span>
          </div>
          
          <div className="space-y-2">
            {knowledgeArticles.map((article) => (
              <div key={article.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                <div className="w-4 h-4 bg-gray-800 rounded flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v1H7V5zm0 3h6v1H7V8zm0 3h6v1H7v-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-800">{article.title}</span>
              </div>
            ))}
            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">
              See all →
            </button>
          </div>
        </div>

        {/* Follow-up Answer */}
        {followUpAnswer && (
          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Follow-up Answer:</p>
            <p className="text-sm text-gray-800 whitespace-pre-line">{followUpAnswer}</p>
            <button
              onClick={() => onAddToComposer(followUpAnswer)}
              className="text-blue-600 hover:underline text-sm mt-2 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-6 4H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Add to composer
            </button>
          </div>
        )}
      </div>

      {/* Footer Input */}
      {/* Footer Input */}
<div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
  <div className="relative">
    <input
      type="text"
      placeholder="Ask a follow up question..."
      value={followUpQuestion}
      onChange={(e) => setFollowUpQuestion(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      onKeyPress={(e) => e.key === 'Enter' && handleAskFollowUp()}
    />
    <button
      onClick={handleAskFollowUp}
      className="absolute right-3 top-1/2 transform -translate-y-1/2"
    >
      <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  </div>
</div>
    </div>
  );
};

export default AICopilot;