import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyBKx5vxppa7SkNHBVktKYmFlYSaetECcPw'; // Replace with your Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export const generateResponse = async (prompt, conversationContext = []) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key is missing or invalid. Please provide a valid API key.');
    }

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: `Conversation context: ${JSON.stringify(conversationContext)}\n\nPrompt: ${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate response structure
    if (
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0] ||
      !response.data.candidates[0].content ||
      !response.data.candidates[0].content.parts ||
      !response.data.candidates[0].content.parts[0] ||
      !response.data.candidates[0].content.parts[0].text
    ) {
      throw new Error('Unexpected Gemini API response structure. Please check the API response.');
    }

    return { success: true, data: response.data.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    if (error.response) {
      console.error('API Response Error:', error.response.data);
      return { success: false, error: `Gemini API error: ${error.response.data.error?.message || 'Unknown error'}` };
    }
    return { success: false, error: `Failed to generate response: ${error.message}` };
  }
};

export const summarizeConversation = async (messages) => {
  const prompt = `Summarize the following conversation in a concise manner (2-3 sentences):\n\n${messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}`;
  return await generateResponse(prompt, messages);
};

export const rephraseTone = async (text, tone) => {
  const prompt = `Rephrase the following text in a ${tone} tone:\n\n${text}`;
  return await generateResponse(prompt);
};

export const generateAdvice = async (response) => {
  const prompt = `Provide brief advice (1-2 sentences) for an agent on how to proceed with this response:\n\n${response}`;
  return await generateResponse(prompt);
};

export const checkInternalContent = async (text) => {
  const prompt = `Does the following text contain internal-only content (e.g., internal notes, system IDs, or sensitive information)? If yes, highlight the internal content:\n\n${text}`;
  const result = await generateResponse(prompt);
  if (!result.success) return { success: false, error: result.error };
  return result.data.toLowerCase().includes('yes') ? { success: true, data: result.data } : { success: true, data: false };
};