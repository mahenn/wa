import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { MessageOutlined, TeamOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import ContactsSidebar from './ContactsSidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

const { Sider, Content, Footer } = Layout;

const WhatsAppClone = ({
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
  onCancelReply
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

  const handleReactToMessage = (messageId, emoji) => {
    console.log(`React to message ${messageId} with ${emoji}`);
    setReactionToMessage({ messageId, emoji });

    // Send the reaction to WebSocket server
    window.app?.ws.send(
      JSON.stringify({
        type: 'react-to-message',
        chatId: selectedChatId,
        content: { messageId, emoji },
        sessionId,
      })
    );
  };

  // Function to render the page based on selected menu item
  const renderPageContent = () => {
    switch (selectedPage) {
      case 'chats':

        return  (
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
                    />
                    <Footer style={{ padding: '10px', background: '#f0f0f0' }}>
                      <ChatInput
                        onSendMessage={(msg) => sendMessage(selectedChatId, msg, sessionId)}
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
      case 'contacts':
        return <ContactsSidebar chats={chats} onSelectChat={handleSelectChat} />;
      case 'communities':
        return <div style={{ padding: '20px' }}>Communities Feature Coming Soon...</div>;
      case 'settings':
        return <div style={{ padding: '20px' }}>Settings Page</div>;
      default:
        return <div style={{ padding: '20px', textAlign: 'center' }}>Select a section</div>;
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Sidebar for navigation */}
      <Sider width={80} style={{ background: '#202c33' }}>
        <Menu
          theme="dark"
          mode="vertical"
          defaultSelectedKeys={['chats']}
          style={{ height: '100%', borderRight: 0 }}
          onSelect={({ key }) => setSelectedPage(key)}
        >
          <Menu.Item key="chats" icon={<MessageOutlined />}>
            Chats
          </Menu.Item>
          <Menu.Item key="contacts" icon={<TeamOutlined />}>
            Contacts
          </Menu.Item>
          <Menu.Item key="communities" icon={<UserOutlined />}>
            Communities
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Settings
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main content based on selected section */}
      <Layout style={{ padding: '0 0px 0px' }}>
        <Content
          style={{
            background: '#fff',
            padding: 0,
            margin: 0,
            minHeight: 280,
          }}
        >
          {renderPageContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default WhatsAppClone;