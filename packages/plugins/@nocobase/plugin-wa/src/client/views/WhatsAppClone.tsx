import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { MessageOutlined, TeamOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import ContactsSidebar from './ContactsSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

const { Sider, Content, Footer } = Layout;


declare global {
  interface Window {
    app?: {
      ws: WebSocket;
    };
  }
}

interface WhatsAppCloneProps {
  contacts: any[];
  chats: any[];
  loadMessages: (chatId: string, offset?: number) => Promise<void>;
  sendMessage: (chatId: string, messageContent: any) => void;
  chatMessages: any[];
  selectedChatId: string;
  setSelectedChatId: (chatId: string) => void;
  sessionId: string;
  replyToMessage: any;
  onReplyToMessage: (message: any) => void;
  onCancelReply: () => void;
  hasMoreMessages: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  sendReaction?: (chatId: string, messageId: string, reaction: string) => void;
}

const WhatsAppClone: React.FC<WhatsAppCloneProps> = ({
  contacts,
  chats,
  loadMessages,
  sendMessage,
  chatMessages,
  selectedChatId,
  setSelectedChatId,
  sessionId,
  replyToMessage,
  onReplyToMessage,
  onCancelReply,
  hasMoreMessages,
  onLoadMore,
  isLoadingMore,
  sendReaction
}) => {
  const [selectedPage, setSelectedPage] = useState('chats'); // Default to chats view
  const [reactionToMessage, setReactionToMessage] = useState(null);

  const handleSelectChat = (chatId) => {
    if (!chatId) {
      console.error('Invalid chatId selected.');
      return;
    }
    setSelectedChatId(chatId);
    loadMessages(chatId);
  };

  // const handleReactToMessage = (messageId, emoji) => {
  //   console.log(`React to message ${messageId} with ${emoji}`);
  //   setReactionToMessage({ messageId, emoji });

  //   // Send the reaction to WebSocket server
  //   window.app?.ws.send(
  //     JSON.stringify({
  //       type: 'react-to-message',
  //       chatId: selectedChatId,
  //       content: { messageId, emoji },
  //       sessionId,
  //     })
  //   );
  // };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await window.app?.ws.send(JSON.stringify({
        type: 'react-to-message',
        chatId: selectedChatId,
        messageId,
        reaction: {
          text: emoji,
          messageId
        },
        sessionId,
      }));
    } catch (error) {
      console.error('Failed to react to message:', error);
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
            <Sider width={442} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
              <ContactsSidebar chats={chats} onSelectChat={handleSelectChat} />
            </Sider>
            <Layout>
              <Content>
                {selectedChatId ? (
                  <>
                    <ChatWindow
                      chatMessages={chatMessages}
                      loadMessages={loadMessages}
                      onReplyToMessage={onReplyToMessage}
                      onReactToMessage={handleReactToMessage}
                      selectedChatId={selectedChatId}
                      hasMoreMessages={hasMoreMessages}
                      onLoadMore={onLoadMore}
                      isLoadingMore={isLoadingMore}
                      sessionId={sessionId}
                      loading={isLoadingMore} 
                    />
                    <Footer style={{ padding: '10px', background: '#f0f0f0' }}>
                      <ChatInput
                        onSendMessage={(msg) => sendMessage(selectedChatId, msg)}
                        replyToMessage={replyToMessage} // Pass replyToMessage to ChatInput
                        onCancelReply={onCancelReply} // Handle cancel reply action
                      />
                    </Footer>
                  </>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>Select a chat to start messaging</div>
                )}
              </Content>
            </Layout>
          </Layout>
  );
};

export default WhatsAppClone;