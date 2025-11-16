import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage } from '../utils/chatService';
import { UserContext } from '../UserContext';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI expense assistant. I can help you manage your expenses, create new transactions, provide summaries, and search through your expenses using natural language. How can I help you today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { value: username } = useContext(UserContext);
  const token = localStorage.getItem('token');

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) {
      return;
    }

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get conversation history (last 10 messages, excluding the initial greeting)
      const conversationHistory = messages
        .slice(1)
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Send message to backend
      const response = await sendChatMessage(
        userMessage.content,
        conversationHistory,
        token
      );

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared! How can I help you today?',
      },
    ]);
  };

  return (
    <div className="chat-widget-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-header-icon">🤖</div>
              <div className="chat-header-text">
                <h3>AI Expense Assistant</h3>
                <p>Ask me anything about your expenses</p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-action-btn"
                onClick={clearChat}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                className="chat-close-btn"
                onClick={toggleChat}
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${
                  message.role === 'user' ? 'user-message' : 'assistant-message'
                }`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Ask me about your expenses..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </form>

          {/* Quick Actions */}
          <div className="chat-quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => setInputMessage('Show me my expenses this month')}
              disabled={isLoading}
            >
              📊 Monthly Summary
            </button>
            <button
              className="quick-action-btn"
              onClick={() => setInputMessage('Add a new expense')}
              disabled={isLoading}
            >
              ➕ Add Expense
            </button>
            <button
              className="quick-action-btn"
              onClick={() => setInputMessage('Show me food expenses')}
              disabled={isLoading}
            >
              🍔 Food Expenses
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        title={isOpen ? 'Close chat' : 'Open AI assistant'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;

