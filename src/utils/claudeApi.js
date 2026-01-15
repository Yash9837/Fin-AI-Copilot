/**
 * FREE Hugging Face Inference API Integration
 * Using models that don't require authentication for basic usage
 * Model: meta-llama/Llama-3.2-3B-Instruct (fast and free)
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct';
const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY || 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Optional for rate limiting

/**
 * Call Hugging Face Inference API
 * @param {string} prompt - The full prompt to send
 * @returns {Object} Response object with success status and data or error
 */
const callHuggingFaceAPI = async (prompt, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(HF_API_KEY !== 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' && {
            'Authorization': `Bearer ${HF_API_KEY}`
          })
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle model loading (retry after wait)
        if (errorData.error?.includes('loading') && attempt < retries - 1) {
          console.log('Model is loading, waiting 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue;
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        return { success: true, data: data[0].generated_text.trim() };
      } else if (data.generated_text) {
        return { success: true, data: data.generated_text.trim() };
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      if (attempt === retries - 1) {
        console.error('Error calling Hugging Face API:', error.message);
        return { success: false, error: `AI service error: ${error.message}` };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return { success: false, error: 'Failed after multiple retries' };
};

/**
 * Generate a response using Hugging Face
 * @param {string} prompt - The prompt to send to the AI
 * @param {Array} conversationContext - Array of previous messages for context
 * @returns {Object} Response object with success status and data or error
 */
export const generateResponse = async (prompt, conversationContext = []) => {
  try {
    // Build conversation history
    let fullPrompt = '';
    
    if (conversationContext && conversationContext.length > 0) {
      fullPrompt = 'Previous conversation:\n';
      conversationContext.slice(-6).forEach(msg => {
        const role = msg.sender === 'user' ? 'Customer' : 'Agent';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
      fullPrompt += `\nTask: ${prompt}\n\nResponse:`;
    } else {
      fullPrompt = `${prompt}\n\nResponse:`;
    }

    return await callHuggingFaceAPI(fullPrompt);
  } catch (error) {
    console.error('Error generating response:', error.message);
    return { success: false, error: `Failed to generate response: ${error.message}` };
  }
};


/**
 * Summarize a conversation using Hugging Face
 * @param {Array} messages - Array of conversation messages
 * @returns {Object} Response object with success status and summary or error
 */
export const summarizeConversation = async (messages) => {
  const conversationText = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n');
  const prompt = `Summarize this customer support conversation in 2-3 clear sentences:\n\n${conversationText}\n\nSummary:`;
  return await callHuggingFaceAPI(prompt);
};

/**
 * Rephrase text in a specific tone using Hugging Face
 * @param {string} text - The text to rephrase
 * @param {string} tone - The desired tone (e.g., 'friendly', 'professional', 'casual')
 * @returns {Object} Response object with success status and rephrased text or error
 */
export const rephraseTone = async (text, tone) => {
  const prompt = `Rewrite this message in a ${tone} tone for customer support. Only provide the rewritten message:\n\nOriginal: ${text}\n\nRewritten:`;
  return await callHuggingFaceAPI(prompt);
};

/**
 * Generate advice for an agent on how to proceed with a response
 * @param {string} response - The response to analyze
 * @returns {Object} Response object with success status and advice or error
 */
export const generateAdvice = async (response) => {
  const prompt = `As a customer support advisor, provide 1-2 sentences of advice for an agent about this response:\n\n${response}\n\nAdvice:`;
  return await callHuggingFaceAPI(prompt);
};

/**
 * Check if text contains internal-only content
 * @param {string} text - The text to check
 * @returns {Object} Response object with success status and internal content detection or error
 */
export const checkInternalContent = async (text) => {
  const prompt = `Does this message contain internal-only information (system IDs, internal notes, confidential data)? Answer "yes" or "no" and explain if yes:\n\n${text}\n\nAnswer:`;
  
  const result = await callHuggingFaceAPI(prompt);
  if (!result.success) return { success: false, error: result.error };
  
  const containsInternal = result.data.toLowerCase().includes('yes');
  return { 
    success: true, 
    data: containsInternal ? result.data : false 
  };
};

/**
 * Analyze conversation sentiment
 * @param {Array} messages - Array of conversation messages
 * @returns {Object} Response object with sentiment analysis
 */
export const analyzeSentiment = async (messages) => {
  const recentMessages = messages.slice(-3).map(msg => msg.content).join(' ');
  const prompt = `Analyze the customer's sentiment in one word (positive, negative, neutral, frustrated, or satisfied):\n\n${recentMessages}\n\nSentiment:`;
  return await callHuggingFaceAPI(prompt);
};

/**
 * Suggest conversation tags
 * @param {Array} messages - Array of conversation messages
 * @returns {Object} Response object with suggested tags
 */
export const suggestTags = async (messages) => {
  const conversationText = messages.slice(-5).map(msg => msg.content).join(' ');
  const prompt = `Suggest 2-3 relevant tags for this customer support conversation (e.g., billing, technical, refund, urgent). List only the tags separated by commas:\n\n${conversationText}\n\nTags:`;
  return await callHuggingFaceAPI(prompt);
};
