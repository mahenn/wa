// ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { List, Typography, Button, Divider } from 'antd';
import moment from 'moment';
import { css } from '@emotion/css';
import MessageMenu from './MessageMenu';
import { message as antMessage } from 'antd';
import { ForwardOutlined, AudioOutlined, VideoCameraOutlined,CheckOutlined } from '@ant-design/icons';
import { WAMessageAck } from '../../server/structures/enums.dto';

const { Text } = Typography;

const chatWindowStyles = css`
  height: calc(100vh - 50px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #e5ddd5;
  padding: 16px;

  .message-group {
    margin: 8px 0;
  }

  .date-separator {
    text-align: center;
    margin: 16px 0;
    
    .ant-divider {
      margin: 8px 0;
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
    }
  }

  .message {
    display: flex;
    margin: 4px 0;
    
    &.sent {
      justify-content: flex-end;
    }

    .message-content {
      max-width: 65%;
      padding: 8px 12px;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);

      &.sent {
        background-color: #dcf8c6;
      }
    }

    .message-meta {
      font-size: 11px;
      margin-top: 4px;
      text-align: right;
    }
  }

  .load-more {
    align-self: center;
    margin: 16px 0;
  }

  .message-container {
    display: flex;
    flex-direction: column-reverse; // Reverse the messages container
    min-height: 0; // Important for proper scrolling
  }

  .load-more {
    position: sticky;
    top: 0;
    z-index: 1;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px;
    margin: 0;
    width: 100%;
  }

  .message {
    position: relative;
    
    .message-content {
      position: relative;
      padding: 8px 12px;
      border-radius: 8px;
      margin: 4px 8px;
      max-width: 65%;
      word-wrap: break-word;

      .message-menu {
        position: absolute;
        top: 4px;
        right: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1;
      }

      &:hover .message-menu {
        opacity: 1;
      }

      .reply-snippet {
        background: rgba(0, 0, 0, 0.05);
        border-left: 4px solid #128C7E;
        padding: 8px;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: rgba(0, 0, 0, 0.08);
        }
      }
    }

    &.sent {
      .message-content {
        background: #dcf8c6;
        margin-left: auto;
      }
    }

    &.received {
      .message-content {
        background: #fff;
      }
    }
  

      .message-reactions {
        display: flex;
        gap: 4px;
        margin-top: 4px;
        flex-wrap: wrap;

        .reaction {
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          .reaction-count {
            color: #667781;
          }
        }

        .message-reactions {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
        
        .reaction {
          background-color: #e8e8e8;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          
          &:hover {
            background-color: #d8d8d8;
          }
        }
      }

      }
    }

  @keyframes highlight-message {
    0% { background-color: rgba(255, 251, 0, 0.3); }
    100% { background-color: transparent; }
  }

  .message {
    &.highlight {
      animation: highlight-message 1s ease-out;
    }
  }

`;

interface ReplyToMessage {
  id: string;
  fromMe: boolean;
  from: string;
  body: string;
  hasMedia?: boolean;
  media?: {
    mimetype?: string;
    url?: string;
  };
}

interface ChatWindowProps {
  chatMessages: any[];
  loadMessages: (chatId: string, offset?: number) => Promise<void>;
  onReplyToMessage: (message: any) => void;
  onReactToMessage: (messageId: string, emoji: string) => Promise<void>;
  selectedChatId: string;
  hasMoreMessages: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  loading: boolean;
  sessionId: string;
  onDeleteMessage?: (message: any) => Promise<void>; // Add this prop

}

//const [chatMessages, setChatMessages] = useState<any>([]); // if using local state

// Add the MessageTicks component within ChatWindow.tsx
const MessageTicks = ({ ack }) => {
  const tickStyles = css`
    .message-ticks {
      margin-left: 4px;
      display: inline-flex;
      align-items: center;
      
      &.single {
        color: #a5a5a5;
      }
      
      &.double {
        color: #a5a5a5;
      }
      
      &.read {
        color: #53bdeb;
      }
      
      .tick {
        font-size: 14px;
        &:last-child {
          margin-left: -4px;
        }
      }
    }
  `;

  const getTicksClass = (ack) => {
    switch (ack) {
      case 1: return 'single';  // Sent
      case 2: return 'double';  // Delivered
      case 3: return 'read';    // Read
      default: return 'single'; // Pending/Error
    }
  };

  if (!ack) return null;

  return (
    <span className={`message-ticks ${tickStyles} ${getTicksClass(ack)}`}>
      {ack >= 1 && (
        <>
          <CheckOutlined className="tick" />
          {ack >= 2 && <CheckOutlined className="tick" />}
        </>
      )}
    </span>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatMessages,
  loadMessages,
  onReplyToMessage,
  onReactToMessage,
  selectedChatId,
  hasMoreMessages,
  onLoadMore,
  isLoadingMore,
  sessionId,
  loading
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleReplyClick = (replyToMessageId: string) => {
    const originalMessage = chatMessages.find(msg => msg.id.includes(replyToMessageId));
    if (originalMessage) {
      const messageElement = document.getElementById(`message-${originalMessage.id}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('highlight');
        setTimeout(() => {
          messageElement.classList.remove('highlight');
        }, 2000);
      }
    }
  };

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
  
  const handleReply = (message: any) => {
    onReplyToMessage(message);
  };

  const handleDownload = async (message: any) => {
    if (message.hasMedia) {
      try {
        const response = await fetch(message.media.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = message.media.filename || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        antMessage.error('Failed to download media');
      }
    }
  };

  const handleForward = (message: any) => {
    // Implement forward functionality using the API
    // You'll need to show a modal to select contacts/chats to forward to
    //console.log('Forward message:', message);
  };

  const handleDelete = async (message: any) => {
    try {
      // Call the delete message API
      await window.app?.ws.send(JSON.stringify({
        type: 'delete-message',
        chatId: selectedChatId,
        messageId: message.id,
        sessionId: sessionId,
      }));
      // Update the messages list
      // setChatMessages(prevMessages => 
      //   prevMessages.filter(msg => msg.id !== message.id)
      // );

      antMessage.success('Message deleted successfully');
    } catch (error) {
      antMessage.error('Failed to delete message');
    }
  };

  const renderReplySnippet = (replyTo: ReplyToMessage) => {
    if (!replyTo) return null;
    
    return (
      <div className="reply-snippet"  onClick={() => handleReplyClick(replyTo.id)}>
        <div className="reply-header">
          <span className="reply-author">{replyTo.fromMe ? 'You' : replyTo.from}</span>
        </div>
        {replyTo.hasMedia && (
          <div className="reply-media">
            {replyTo.media?.mimetype?.includes('image') && (
              <img src={replyTo.media?.url} alt="Reply media" />
            )}
            {replyTo.media?.mimetype?.includes('video') && (
              <span><VideoCameraOutlined /> Video</span>
            )}
            {replyTo.media?.mimetype?.includes('audio') && (
              <span><AudioOutlined /> Audio</span>
            )}
          </div>
        )}
        <div className="reply-text">{replyTo.body}</div>
      </div>
    );
  };

  // Add this helper function to render reactions
  const renderReactions = (reactions) => {
    if (!reactions || reactions.length === 0) return null;
    
    return (
      <div className="message-reactions">
        {reactions.map((reaction, index) => (
           <span key={`${reaction.messageId}-${index}`} className="reaction">
            {reaction.text}
            <span className="reaction-count">{reaction.count}</span>
          </span>
        ))}
      </div>
    );
  };

  // Add this new useEffect ⬇️
  useEffect(() => {
    if (chatMessages.length > 0 && isInitialLoad) {
      scrollToBottom();
      setIsInitialLoad(false);
    }
  }, [chatMessages, isInitialLoad]);

  // Add this new scrollToBottom function ⬇️
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    // Create a copy and sort messages by timestamp in ascending order
    const sortedMessages = [...messages].sort((a, b) => 
      (a.timestamp || 0) - (b.timestamp || 0)
    );


    sortedMessages.forEach(message => {
      const date = moment(message.timestamp * 1000).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });


    // Sort the dates in reverse chronological order (newest first)
    const sortedDates = Object.keys(groups).sort((b, a) => 
      moment(b).valueOf() - moment(a).valueOf()
    );

    // Create a new ordered groups object
    const orderedGroups: { [key: string]: any[] } = {};
    sortedDates.forEach(date => {
      orderedGroups[date] = groups[date];
    });

    return orderedGroups;
  };

  // // Auto scroll to bottom for new messages
  // useEffect(() => {
  //   if (autoScroll && messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [chatMessages, autoScroll]);


  // Maintain scroll position when loading older messages
  const loadMoreMessages = async () => {
    if (loading || !hasMoreMessages) return;
    
    const prevHeight = containerRef.current?.scrollHeight || 0;
    await onLoadMore();
    
    // After loading, adjust scroll position to maintain view
    if (containerRef.current) {
      const newHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newHeight - prevHeight;
    }
  };


  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Enable/disable auto-scroll based on user's scroll position
    setAutoScroll(Math.abs(scrollHeight - clientHeight - scrollTop) < 100);
    
    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasMoreMessages && loading) {
      loadMoreMessages();
    }
  };

  const renderDateSeparator = (date: string) => {
    const messageDate = moment(date);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');

    let displayText;
    if (messageDate.isSame(today, 'day')) {
      displayText = 'Today';
    } else if (messageDate.isSame(yesterday, 'day')) {
      displayText = 'Yesterday';
    } else {
      displayText = messageDate.format('MMMM D, YYYY');
    }

    return (
      <div className="date-separator">
        <Divider>
          <Text type="secondary">{displayText}</Text>
        </Divider>
      </div>
    );
  };

  return (
    <div 
      className={chatWindowStyles}
      ref={containerRef}
      onScroll={handleScroll}
    >
      {hasMoreMessages && (
        <div style={{ textAlign: 'center', padding: '10px' }}>
        <Button 
          className="load-more"
          onClick={loadMoreMessages}
          loading={loading}
          disabled={loading}
        >
            {loading ? 'Loading...' : 'Load More Messages'}
        </Button>
      </div>
      )}


      {Object.entries(groupMessagesByDate(chatMessages)).map(([date, msgs]) => (
        <div key={date} className="message-group">
          {renderDateSeparator(date)}
          {msgs.map((message) => (
            <div key={message.id} id={`message-${message.id}`} className={`message ${message.fromMe ? 'sent' : ''}`}>
              <div className={`message-content ${message.fromMe ? 'sent' : ''}`}>
                <div className="message-menu">
                  {message.id && (
                    <MessageMenu
                      message={message}
                      onReply={handleReply}
                      onDownload={handleDownload}
                      onForward={handleForward}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
                {message.forwarded && (
                <div className="forwarded-label">
                  <ForwardOutlined /> Forwarded
                </div>
              )}
              
              {message.replyTo && renderReplySnippet(message.replyTo)}

                {message.hasMedia && (
                  <div className="media-container">
                    {message.media.mimetype?.includes('image') && (
                      <img src={message.media?.url} alt="Media content" style={{ width: '100%' }} />
                    )}
                    {message.media.mimetype?.includes('video') && (
                      <video controls src={message.media?.url} />
                    )}
                    {message.media.mimetype?.includes('audio') && (
                      <audio controls src={message.media?.url} />
                    )}
                    {message.media.mimetype?.includes('application') && (
                      <a href={message.media?.url} target="_blank" rel="noopener noreferrer">
                        📎 {message.media?.filename || 'Document'}
                      </a>
                    )}
                  </div>
                )}
                <div className="message-text"
                  dangerouslySetInnerHTML={{ __html: parseWhatsAppFormatting(message.body) }}
                  style={{ whiteSpace: 'pre-wrap' }} // Maintain line breaks
                />
               
                <div className="message-meta">
                  {moment(message.timestamp * 1000).format('HH:mm')}&nbsp;&nbsp;
                  {<MessageTicks ack={message.ack} /> } {message.ack}
                </div>
                {message._data.reactions && renderReactions(message._data.reactions)}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;