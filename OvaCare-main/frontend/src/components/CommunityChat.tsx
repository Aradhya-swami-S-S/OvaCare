import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Users, 
  Minimize2, 
  Maximize2,
  AlertCircle 
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

interface CommunityChatProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized?: boolean;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ 
  isOpen, 
  onToggle, 
  isMinimized = false 
}) => {
  const [message, setMessage] = useState('');
  const [isMinimizedState, setIsMinimizedState] = useState(isMinimized);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    messages, 
    isConnected, 
    sendMessage, 
    isTyping,
    setIsTyping 
  } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimizedState) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimizedState]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isConnected && !isSending) {
      setIsSending(true);
      sendMessage(message);
      setMessage('');
      setIsTyping(false);
      
      // Reset sending state after a short delay
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
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

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 ${
      isMinimizedState ? 'w-80 h-16' : 'w-80 h-96'
    } transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Community Chat</span>
          {!isConnected && (
            <AlertCircle className="h-4 w-4 text-yellow-300" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimizedState(!isMinimizedState)}
            className="p-1 hover:bg-purple-700 rounded"
          >
            {isMinimizedState ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          
          <button
            onClick={onToggle}
            className="p-1 hover:bg-purple-700 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimizedState && (
        <>
          {/* Connection Status */}
          <div className={`p-2 border-b transition-colors ${
            isConnected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm flex items-center ${
              isConnected ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Connected - Real-time chat active
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Connecting to chat...
                </>
              )}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 h-64 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
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
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-3 py-2 bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Someone is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                maxLength={500}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!message.trim() || !isConnected || isSending}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Messages are anonymous
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {message.length}/500
                </span>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Socket connected:', isConnected);
                      console.log('Messages count:', messages.length);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Debug
                  </button>
                )}
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CommunityChat;