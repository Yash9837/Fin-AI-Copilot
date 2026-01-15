'use client';

import React, { useState, useRef } from 'react';
import { FaBolt, FaCode, FaSmile, FaLink, FaPaperclip, FaHeading } from 'react-icons/fa';
import { rephraseTone } from '../utils/claudeApi';

const EMOJI_LIST = ['😊', '👍', '❤️', '😂', '🎉', '✅', '⚡', '🔥', '💯', '👏', '🙏', '💪', '🎯', '✨', '🚀', '💡'];

const Composer = ({ composerText, setComposerText, handleRephrase, handleSummarize, onSendMessage }) => {
  const [sending, setSending] = useState(false);
  const [showRephraseDropdown, setShowRephraseDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (composerText.trim()) {
      setSending(true);
      await onSendMessage(composerText);
      setComposerText('');
      setAttachedFiles([]);
      setSending(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachedFiles([...attachedFiles, ...newFiles]);
  };
  
  const removeFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };
  
  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = composerText.substring(0, start) + emoji + composerText.substring(end);
    setComposerText(newText);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleRephraseOption = async (tone) => {
    await handleRephrase(tone);
    setShowRephraseDropdown(false);
  };

  return (
    <div className="bg-white p-4 border-t border-gray-200">
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div key={index} className="relative group bg-slate-100 rounded-lg p-2 flex items-center gap-2 text-sm">
              {file.preview && (
                <img src={file.preview} alt={file.name} className="w-10 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{file.size}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-start gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-slate-300 rounded-lg p-3 pr-10 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
            placeholder="Type your message... (Ctrl+Enter to send)"
            rows="3"
          />
          
          <div className="absolute right-2 bottom-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Add emoji"
            >
              <FaSmile className="w-4 h-4" />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-8 gap-1 z-10">
                {EMOJI_LIST.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 hover:bg-gray-100 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleSend}
          disabled={sending || !composerText.trim()}
          className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium shadow-sm ${
            sending || !composerText.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {sending ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Sending
            </>
          ) : (
            <>
              Send
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </>
          )}
        </button>
      </div>
      
      <div className="flex items-center justify-between text-gray-500 text-xs mt-2">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors"
          >
            <FaPaperclip className="w-3 h-3" />
            <span>Attach file</span>
          </button>
          <button
            onClick={handleSummarize}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <FaBolt className="w-3 h-3" />
            <span>Summarize</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowRephraseDropdown(!showRephraseDropdown)}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <FaBolt className="w-3 h-3" />
              <span>Rephrase</span>
            </button>
            {showRephraseDropdown && (
              <div className="absolute bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                <button
                  onClick={() => handleRephraseOption('friendly')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-t-lg"
                >
                  Friendly
                </button>
                <button
                  onClick={() => handleRephraseOption('professional')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  Professional
                </button>
                <button
                  onClick={() => handleRephraseOption('formal')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-lg"
                >
                  Formal
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="text-gray-400">
          Ctrl+Enter to send • Esc to clear
        </span>
      </div>
    </div>
  );
};

export default Composer;
