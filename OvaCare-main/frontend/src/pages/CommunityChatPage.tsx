import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  Users, 
  AlertCircle,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const CommunityChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    messages, 
    isConnected, 
    sendMessage, 
    isTyping,
    setIsTyping 
  } = useSocket();
  
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      sendMessage(message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set typing indicator
    if (value.trim()) {
      setIsTyping(true);
      
      // Clear typing indicator after 2 seconds of no typing
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      
      setTypingTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: typeof messages }, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Community Chat</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>Anonymous Community</span>
            </div>
            
            <Link
              to="/"
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">Connecting to chat server...</span>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {Object.keys(groupedMessages).length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Community Chat</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This is a safe, anonymous space for the community to connect and share experiences. 
                  All messages are completely anonymous.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {date}
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {dateMessages.map((msg) => (
                        <div key={msg._id} className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.isOwnMessage 
                              ? 'bg-purple-600 text-white rounded-br-none' 
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          } shadow-sm`}>
                            <div className={`flex items-center justify-between mb-1 ${
                              msg.isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs font-medium">
                                {msg.isOwnMessage ? 'You' : 'Anonymous'}
                              </span>
                              <span className="text-xs ml-2">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                            <p className="leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Someone is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="border-t border-gray-200 bg-white px-4 py-4">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder={isConnected ? "Type your anonymous message..." : "Connecting..."}
                    disabled={!isConnected}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>All messages are anonymous</span>
                    <span>{message.length}/500</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || !isConnected}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityChatPage;