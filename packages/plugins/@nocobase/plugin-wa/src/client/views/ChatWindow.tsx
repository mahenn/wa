import React, { useEffect, useRef, useState } from 'react';
import { List, Avatar, Typography, Button, Dropdown, Menu, Popover } from 'antd';
import moment from 'moment';
import './ChatWindow.css'; // Custom CSS file for additional styles

const { Text } = Typography;

const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];


const renderTicks = (ack) => {
  if (ack === 1) return '✔'; // Sent (single tick)
  if (ack === 2) return '✔✔'; // Delivered (double tick)
  if (ack === 3) return '✔✔'; // Seen (blue ticks)
  return ''; // Default, no ticks
};

const ReactionSelector = ({ onSelectReaction }) => (
  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
    {reactions.map((reaction, index) => (
      <span
        key={index}
        onClick={() => onSelectReaction(reaction)}
        style={{ fontSize: '20px', cursor: 'pointer', padding: '5px' }}
      >
        {reaction}
      </span>
    ))}
  </div>
);

const parseWhatsAppFormatting = (text) => {
  if (!text) return text;

  // Replace bold (*text*) with <b>text</b>
  let formattedText = text.replace(/\*([^*]+)\*/g, '<b>$1</b>');

  // Replace italic (_text_) with <i>text</i>
  formattedText = formattedText.replace(/_([^_]+)_/g, '<i>$1</i>');

  // Replace strikethrough (~text~) with <s>text</s>
  formattedText = formattedText.replace(/~([^~]+)~/g, '<s>$1</s>');

  // Replace monospace (`text`) with <code>text</code>
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Automatically convert URLs into clickable links
  formattedText = formattedText.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return formattedText;
};

// Helper to render replied messages
const renderRepliedMessage = (message) => {
  if (message.hasQuotedMsg) {
    const quotedMessage = message._data.quotedMsg;

    const renderQuotedMedia = () => {
      if (quotedMessage.directPath && quotedMessage.type) {
        const mimeType = quotedMessage.type;
        const mediaData = quotedMessage.body || quotedMessage.filehash;

        if (mimeType.includes('image')) {
          return (
            <img
              src={`data:${mimeType};base64,${mediaData}`}
              alt="Replied image"
              style={{  objectFit: 'cover', marginRight: '5px',alignItems: 'right' }}
            />
          );
        }

        if (mimeType.includes('video')) {
          return (
            <video
              src={`data:${mimeType};base64,${mediaData}`}
              style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '5px' }}
              controls
            />
          );
        }

        if (mimeType.includes('audio')) {
          return (
            <audio
              src={`data:${mimeType};base64,${mediaData}`}
              controls
              style={{ width: '150px', marginRight: '5px' }}
            />
          );
        }

        if (mimeType.includes('application/pdf') || mimeType.includes('application/vnd')) {
          return (
            <a
              href={`data:${mimeType};base64,${mediaData}`}
              download={`document.${mimeType.split('/')[1]}`}
              style={{ marginRight: '5px' }}
            >
              Download Document
            </a>
          );
        }
      }

      return null;
    };

    return (
      <div className="replied-message" style={{ borderLeft: '4px solid #ccc', paddingLeft: '10px', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
        {renderQuotedMedia()}
        <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
          {quotedMessage.directPath ?   'Media message' : quotedMessage.body }
        </Text>
      </div>
    );
  }
  return null;
};

// Helper to render forwarded messages
const renderForwardedMessage = (message) => {
  if (message.isForwarded) {
    return (
      <div style={{ fontStyle: 'italic', color: '#aaa', marginBottom: '5px' }}>
        Forwarded
      </div>
    );
  }
  return null;
};

// Helper to render message content (text, images, videos, etc.)
const renderMessageContent = (message) => {
  const formattedText = parseWhatsAppFormatting(message.body);

  // Check for chat message with no media
  if (message.type === 'chat') {
    return (
      <>
        {renderForwardedMessage(message)}
        {renderRepliedMessage(message)}
        {/* Use dangerouslySetInnerHTML to render formatted text */}
        <div
          dangerouslySetInnerHTML={{ __html: formattedText }}
          style={{ whiteSpace: 'pre-wrap' }} // Maintain line breaks
        />
      </>
    );
  }

  // Handle media (image, video, audio)
  if (message.hasMedia && message.mediaData) {
    const mimeType = message.mediaType || 'image/jpeg';

    // Image type
    if (mimeType.includes('image')) {
      return (
        <div>
          {renderForwardedMessage(message)}
          {renderRepliedMessage(message)}
          <img src={`data:${mimeType};base64,${message.mediaData}`} alt="Sent image" style={{ width: '100%' }} />
          {message.body && (
            <div
              dangerouslySetInnerHTML={{ __html: parseWhatsAppFormatting(message.body) }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>
      );
    }

    // Video type
    if (mimeType.includes('video')) {
      return (
        <div>
          {renderForwardedMessage(message)}
          {renderRepliedMessage(message)}
          <video src={`data:${mimeType};base64,${message.mediaData}`} controls style={{ maxWidth: '200px' }} />
          {message.body && (
            <div
              dangerouslySetInnerHTML={{ __html: parseWhatsAppFormatting(message.body) }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>
      );
    }

    // Audio type
    if (mimeType.includes('audio')) {
      return (
        <div>
          {renderForwardedMessage(message)}
          {renderRepliedMessage(message)}
          <audio src={`data:${mimeType};base64,${message.mediaData}`} controls />
          {message.body && (
            <div
              dangerouslySetInnerHTML={{ __html: parseWhatsAppFormatting(message.body) }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>
      );
    }

     // SVG type
    if (mimeType.includes('image/svg+xml')) {
      return (
        <div>
          {renderForwardedMessage(message)}
          {renderRepliedMessage(message)}
          <img src={`data:${mimeType};base64,${message.mediaData}`} alt="Sent SVG" style={{ width: '100%' }} />
          {message.body && (
            <div
              dangerouslySetInnerHTML={{ __html: parseWhatsAppFormatting(message.body) }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>
      );
    }

    // Document type (PDF, DOCX, etc.)
    if (mimeType.includes('application/pdf') || mimeType.includes('application/vnd.openxmlformats-officedocument')) {
      return (
        <div>
          {renderForwardedMessage(message)}
          {renderRepliedMessage(message)}
          <a href={`data:${mimeType};base64,${message.mediaData}`} download={`document.${mimeType.split('/')[1]}`}>
            Download Document
          </a>
          {message.body && (
            <div
              dangerouslySetInnerHTML={{ __html: parseWhatsAppFormatting(message.body) }}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          )}
        </div>
      );
    }

  }

  // Fallback for unsupported or unknown media types
  return <Text>Unsupported message type or media format</Text>;
};


const ChatWindow = ({ chatMessages, onReplyToMessage,onReactToMessage, selectedChat, loadMessages, selectedChatId }) => {
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const messagesEndRef = useRef(null);
  const [offset, setOffset] = useState(0); // Track the current offset for pagination
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false); // Loading state for older messa


  const chatContainerRef = useRef(null); // Reference for detecting scroll

  //console.log(chatMessages);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOlderMessages = async () => {
    if (loadingOlderMessages) return;

    setLoadingOlderMessages(true);

    // Capture current scroll height before loading older messages
    const previousScrollHeight = chatContainerRef.current?.scrollHeight;

    try {
      await loadMessages(selectedChatId, offset + 100); // Increase offset to fetch older messages
      setOffset((prevOffset) => prevOffset + 100);
      // Wait until messages are rendered, then adjust scroll position
      setTimeout(() => {
        const container = chatContainerRef.current;
        if (container) {
          // Adjust the scroll position to maintain previous position
          container.scrollTop = container.scrollHeight - previousScrollHeight;
        }
      }, 0);
    } finally {
      setLoadingOlderMessages(false);
    }
  };


  // Automatically scroll to the bottom when new messages are received
  useEffect(() => {
      console.log('ChatMessages in ChatWindow:', chatMessages);

    scrollToBottom();
  }, [chatMessages]);



  // Detect scroll to the top to load more messages
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current?.scrollTop === 0 ) {
        loadOlderMessages(); // Load more messages when scrolled to the top
      }
    };

    const container = chatContainerRef.current;
    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [ loadingOlderMessages,offset]);




  const handleReply = (message) => {
    setDropdownVisible(null);
    onReplyToMessage(message);
  };

  const handleReaction = (message, reaction) => {
    onReactToMessage(message.id._serialized, reaction);
  };

  const ReplyMenu = ({ onReply,message }) => (
    <Menu>
      <Menu.Item onClick={() => onReply(message)}>Reply</Menu.Item>
      <Menu.Item>
        <Popover content={<ReactionSelector onSelectReaction={(reaction) => handleReaction(message, reaction)} />}
         trigger="click"        
        >
          <span>React</span>
        </Popover>
      </Menu.Item>
      <Menu.Item>Forward</Menu.Item>
      <Menu.Item>Delete</Menu.Item>
    </Menu>
  );

  const renderReactions = (message) => {
    if (!message.hasReaction) return null;
    console.log(message);
    return (
      <div style={{ marginTop: '5px', textAlign: 'right' }}>
        {message.reactions.map((reaction, index) => (
          <span
            key={index}
            style={{
              backgroundColor: '#e9e9e9',
              padding: '2px 5px',
              borderRadius: '10px',
              marginLeft: '2px'
            }}
          >
            {reaction.aggregateEmoji} {reaction.senders.length}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="chat-window" ref={chatContainerRef}>
      {/* Top header with profile picture and chat name */}
      {!selectedChat && (
        <div className="chat-header" style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
          <Avatar src={ 'https://via.placeholder.com/40'} size={40} />
          <Text style={{ marginLeft: '10px', fontSize: '16px', fontWeight: 'bold' }}>namehere</Text>
        </div>
      )}

      <List
        itemLayout="horizontal"
        dataSource={chatMessages}
        renderItem={(message, index) => {
          const isFromMe = message.fromMe;

          return (
            <List.Item
              key={message.id._serialized || index}
              style={{ justifyContent: isFromMe ? 'flex-end' : 'flex-start' }}
              className={`chat-message ${isFromMe ? 'from-me' : 'from-others'}`}
            >
              <div
                style={{
                  width: '323px', // Control message bubble width
                  backgroundColor: isFromMe ? '#dcf8c6' : '#fff', // Green for "from me", white for others
                  padding: '10px',
                  borderRadius: '8px',
                  display: 'block',
                  flexDirection: 'column', // Keep content aligned vertically
                  alignItems: isFromMe ? 'flex-end' : 'flex-start', // Align text and content
                }}
              >
                <List.Item.Meta
                  
                  title={
                    <div style={{ width: '303px', textAlign: 'left' }}>
                      {renderMessageContent(message)}
                    </div>
                  }
                  description={
                    <div style={{ width: '303px', textAlign: 'right' }}>
                      <Text type="secondary">{moment(message.timestamp * 1000).format('hh:mm A')}</Text>
                      <Text style={{ marginLeft: '5px' }}>
                        {renderTicks(message.ack)}
                      </Text>
                      <Dropdown
                        overlay={<ReplyMenu onReply={handleReply} message={message} />}
                        visible={dropdownVisible === message.id._serialized}
                        onVisibleChange={(visible) => setDropdownVisible(visible ? message.id._serialized : null)}
                      >
                        <Button type="link">⋮</Button>
                      </Dropdown>
                    </div>
                  }
                />
              </div>
            </List.Item>
          );
        }}
      />
      <div ref={messagesEndRef} /> {/* A div to ensure auto-scroll to bottom */}
    </div>
  );
};

export default ChatWindow;
