import React, { useState } from 'react';
import { List, Avatar, Typography, Input, Tooltip, Badge, Button } from 'antd';
import moment from 'moment';
import { CameraOutlined, VideoCameraOutlined, AudioOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;


interface Chat {
  id: string ;
  name?: string;
  notify?: string;
  isGroup?: boolean;
  groupMetadata?: {
    subject?: string;
  };
  lastMessage?: WAMessage;
  unreadCount?: number;
  profilePic?: string;
}

interface WAMessage {
  body?: string;
  timestamp?: number;
  hasMedia?: boolean;
  media?: {
    mimetype?: string;
  };
}

interface ContactsSidebarProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
}



const ContactsSidebar: React.FC<ContactsSidebarProps> = ({ chats, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // Track the selected filter

  const getChatName = (chat: Chat) => {
    //console.log("contactsidebar chat:",chat);
    return chat.isGroup
      ? chat.groupMetadata?.subject || chat.name  ||  'Unnamed Group'
      : chat.name || chat.notify || 'Unnamed Contact';
  };

  // Get chat ID 
  const getChatId = (chat: Chat) => chat.id;
 
  // Filter chats based on search term
  const filteredChats = chats.filter((chat: Chat) => {
    const chatName = getChatName(chat);
    if (filter === 'Unread' && !chat.unreadCount) return false;
    if (filter === 'Groups' && !chat.isGroup) return false;
    return chatName && typeof chatName === 'string' && chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort chats by last message timestamp
  const sortedChats = filteredChats.sort((a, b) => {
    const lastMsgA = a.lastMessage?.timestamp || 0;
    const lastMsgB = b.lastMessage?.timestamp || 0;
    return lastMsgB - lastMsgA;
  });

  // Helper function to determine the media type and render the appropriate icon
  const renderMediaIcon = (lastMessage?: WAMessage) => {
    if (!lastMessage || !lastMessage.hasMedia || !lastMessage.media.mimetype) return null;
    const mimeType = lastMessage.media.mimetype;
    if (mimeType.includes('image')) return <CameraOutlined />;
    if (mimeType.includes('video')) return <VideoCameraOutlined />;
    if (mimeType.includes('audio')) return <AudioOutlined />;

    return null;
  }; 
  return (
    <div style={{ padding: '5px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Chats</h2>
        <Button icon={<PlusOutlined />} style={{ border: 'none', background: 'transparent' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-evenly', marginBottom: '10px' }}>
        <Button
          type={filter === 'All' ? 'primary' : 'default'}
          shape="round"
          onClick={() => setFilter('All')}
        >
          All
        </Button>
        <Button
          type={filter === 'Unread' ? 'primary' : 'default'}
          shape="round"
          onClick={() => setFilter('Unread')}
        >
          Unread
        </Button>
        <Button
          type={filter === 'Groups' ? 'primary' : 'default'}
          shape="round"
          onClick={() => setFilter('Groups')}
        >
          Groups
        </Button>
      </div>

      <Input.Search
        placeholder="Search Chats"
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <List
          itemLayout="horizontal"
          dataSource={sortedChats}
          renderItem={(chat: Chat) => {

            const lastMessage = chat.lastMessage?.body || 'No messages yet';
            const truncatedMessage = lastMessage.length > 50 ? `${lastMessage.slice(0, 50)}...` : lastMessage;
            const lastTime = chat.lastMessage?.timestamp ? moment(chat.lastMessage.timestamp * 1000).fromNow() : '';
            const chatName = getChatName(chat);
            const chatId = getChatId(chat);
            
            // Unread count is tracked via chat.unreadCount (default is 0)
            const unreadCount = chat.unreadCount || 0;

            return (
              <List.Item onClick={() => onSelectChat(chatId)}>
                <List.Item.Meta
                  // Display profile image of user or group
                  avatar={
                    <Badge count={unreadCount} style={{ backgroundColor: '#52c41a' }}>
                      <Avatar src={chat.profilePic || 'https://via.placeholder.com/40'} />
                    </Badge>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>{chatName}</Text>
                      <Text type="secondary">{lastTime}</Text>
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderMediaIcon(chat.lastMessage)} {/* Show media icon if applicable */}
                      <Tooltip title={lastMessage}>
                        <Text style={{ marginLeft: '5px' }}>{truncatedMessage}</Text>
                      </Tooltip>
                    </div>
                  } 
                />
              </List.Item> 
            );
          }}
        />
      </div>
    </div>
  );
};
export default ContactsSidebar; 
