import baseUrl from '../appConfig';

/**
 * Send a chat message to the AI assistant
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - AI response
 */
export const sendChatMessage = async (message, conversationHistory = [], token) => {
  try {
    const response = await fetch(`${baseUrl}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get AI response');
    }

    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get user context (categories and recent transactions)
 * @param {string} username - Username
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - User context
 */
export const getUserContext = async (username, token) => {
  try {
    const response = await fetch(`${baseUrl}/chat/context/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user context');
    }

    return data;
  } catch (error) {
    console.error('Error getting user context:', error);
    throw error;
  }
};

