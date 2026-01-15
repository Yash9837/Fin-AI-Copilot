/**
 * LocalStorage utility for persisting conversation data
 */

const STORAGE_KEY = 'fin_ai_conversations';
const SETTINGS_KEY = 'fin_ai_settings';

/**
 * Save conversations to localStorage
 * @param {Array} conversations - Array of conversation objects
 */
export const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error('Error saving conversations:', error);
    return false;
  }
};

/**
 * Load conversations from localStorage
 * @returns {Array} Array of conversation objects or null
 */
export const loadConversations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading conversations:', error);
    return null;
  }
};

/**
 * Save a single conversation message
 * @param {number} conversationId - The conversation ID
 * @param {Object} message - The message object to add
 */
export const saveMessage = (conversationId, message) => {
  try {
    const conversations = loadConversations() || [];
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    
    if (conversationIndex !== -1) {
      conversations[conversationIndex].messages.push(message);
      conversations[conversationIndex].snippet = message.content.substring(0, 30) + '...';
      conversations[conversationIndex].timeAgo = '0m';
      saveConversations(conversations);
    }
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    return false;
  }
};

/**
 * Save user settings
 * @param {Object} settings - Settings object
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Load user settings
 * @returns {Object} Settings object or default settings
 */
export const loadSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      theme: 'light',
      notifications: true,
      soundEnabled: true,
      autoSave: true
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      theme: 'light',
      notifications: true,
      soundEnabled: true,
      autoSave: true
    };
  }
};

/**
 * Clear all stored data
 */
export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Export conversations as JSON file
 * @param {Array} conversations - Conversations to export
 */
export const exportConversations = (conversations) => {
  try {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversations_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting conversations:', error);
    return false;
  }
};
