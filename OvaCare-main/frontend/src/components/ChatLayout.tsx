import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CommunityChat from './CommunityChat';
import FloatingChatButton from './FloatingChatButton';

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Check if we're on the full-page chat route
  const isOnChatPage = location.pathname === '/community-chat';

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setHasNewMessages(false);
  };

  const handleFloatingButtonClick = () => {
    setIsChatOpen(true);
    setHasNewMessages(false);
  };

  // Only show chat components if user is logged in and not on chat page
  if (!user || isOnChatPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      {/* Floating Chat Button - only show when chat is closed and not on chat page */}
      {!isChatOpen && (
        <FloatingChatButton
          onClick={handleFloatingButtonClick}
          hasNewMessages={hasNewMessages}
        />
      )}
      
      {/* Community Chat Widget - only show when not on chat page */}
      <CommunityChat
        isOpen={isChatOpen}
        onToggle={handleChatToggle}
      />
    </div>
  );
};

export default ChatLayout;