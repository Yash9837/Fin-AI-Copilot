'use client';

import React, { useState, useRef } from 'react';
import { FaBolt, FaCode, FaSmile, FaLink, FaPaperclip, FaHeading } from 'react-icons/fa';
import { rephraseTone } from '../utils/geminiApi';

const Composer = ({ composerText, setComposerText, handleRephrase, handleSummarize, onSendMessage }) => {
  const [sending, setSending] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [showRephraseDropdown, setShowRephraseDropdown] = useState(false);
  const [hasSelectedText, setHasSelectedText] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (composerText.trim()) {
      setSending(true);
      await onSendMessage(composerText);
      setComposerText('');
      setSending(false);
    }
  };

  const applyFormatting = (style) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = composerText.substring(start, end);

    if (!selectedText) return;

    let newText = composerText;
    if (style === 'bold') {
      newText = composerText.substring(0, start) + `**${selectedText}**` + composerText.substring(end);
      setIsBold(!isBold);
    } else if (style === 'italic') {
      newText = composerText.substring(0, start) + `*${selectedText}*` + composerText.substring(end);
      setIsItalic(!isItalic);
    } else if (style === 'code') {
      newText = composerText.substring(0, start) + `\`${selectedText}\`` + composerText.substring(end);
      setIsCode(!isCode);
    } else if (style === 'link') {
      const url = prompt('Enter the URL:');
      if (url) {
        newText = composerText.substring(0, start) + `[${selectedText}](${url})` + composerText.substring(end);
      }
    } else if (style === 'heading') {
      newText = composerText.substring(0, start) + `# ${selectedText}` + composerText.substring(end);
    }

    setComposerText(newText);
    textarea.focus();
  };

  const handleFileUpload = () => {
    alert('File upload functionality would be implemented here.');
  };

  const handleQuickAction = (action) => {
    if (action === 'grammar') {
      alert('Grammar and spelling correction would be implemented here.');
    } else if (action === 'translate') {
      alert('Translation functionality would be implemented here.');
    }
  };

  const handleRephraseOption = async (tone) => {
    await handleRephrase(tone);
    setShowRephraseDropdown(false);
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    const selectedText = composerText.substring(textarea.selectionStart, textarea.selectionEnd);
    setHasSelectedText(!!selectedText);
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200">
      <div className="mb-2">
        {hasSelectedText && (
          <>
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => applyFormatting('bold')}
                className={`p-0.5 rounded-md ${isBold ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <strong className="text-sm">B</strong>
              </button>
              <button
                onClick={() => applyFormatting('italic')}
                className={`p-0.5 rounded-md ${isItalic ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <em className="text-sm">i</em>
              </button>
              <button
                onClick={() => applyFormatting('code')}
                className={`p-0.5 rounded-md ${isCode ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FaCode className="w-3 h-3" />
              </button>
              <button
                onClick={() => applyFormatting('link')}
                className="p-0.5 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <FaLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => applyFormatting('heading')}
                className="p-0.5 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <FaHeading className="w-3 h-3" />
              </button>
              <button
                onClick={handleFileUpload}
                className="p-0.5 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <FaPaperclip className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={handleSummarize}
                className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition shadow-sm"
              >
                Summarize
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowRephraseDropdown(!showRephraseDropdown)}
                  className="bg-gray-900 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition shadow-sm flex items-center"
                >
                  Rephrase
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showRephraseDropdown && (
                  <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                    <button
                      onClick={() => handleRephraseOption('my-tone')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      My tone of voice
                    </button>
                    <button
                      onClick={() => handleRephraseOption('friendly')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      More friendly
                    </button>
                    <button
                      onClick={() => handleRephraseOption('formal')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      More formal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <div className="flex items-center space-x-2 mb-2">
          <textarea
            ref={textareaRef}
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onSelect={handleTextSelection}
            className="flex-1 border rounded-lg p-3 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            placeholder="Chat..."
            rows="3"
          />
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleSend}
              disabled={sending}
              className={`bg-gray-900 text-white px-4 py-2 rounded-lg transition flex items-center shadow-sm ${
                sending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
              }`}
            >
              {sending ? (
                <span className="flex items-center">
                  Sending
                  <svg className="animate-spin ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                </span>
              ) : (
                <>
                  Send
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <span>Use 3E + K for shortcuts</span>
        <FaBolt className="w-4 h-4" />
        <FaCode className="w-4 h-4" />
        <FaSmile className="w-4 h-4" />
        <button
          onClick={() => handleQuickAction('grammar')}
          className="ml-2 text-blue-500 hover:underline"
        >
          Check Grammar
        </button>
        <button
          onClick={() => handleQuickAction('translate')}
          className="ml-2 text-blue-500 hover:underline"
        >
          Translate
        </button>
        <button className="ml-auto text-blue-500 hover:underline">Ask a follow up question...</button>
      </div>
    </div>
  );
};

export default Composer;