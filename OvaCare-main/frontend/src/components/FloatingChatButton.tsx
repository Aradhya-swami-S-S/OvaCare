import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

interface FloatingChatButtonProps {
  onClick: () => void;
  hasNewMessages?: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onClick, 
  hasNewMessages = false 
}) => {
  const { isConnected } = useSocket();

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 ${
        isConnected 
          ? 'bg-purple-600 hover:bg-purple-700' 
          : 'bg-gray-400 hover:bg-gray-500'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <MessageCircle className="h-6 w-6 text-white" />
        
        {/* New messages indicator */}
        {hasNewMessages && (
          <div className="absolute -top-1 -left-1 bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
        )}
        
        {/* Connection status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
      </div>
    </button>
  );
};

export default FloatingChatButton;