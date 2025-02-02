// ChatWindow.tsx
import React, { useEffect, useRef, useState } from 'react';
import { List, Typography, Button, Divider } from 'antd';
import moment from 'moment';
import { css } from '@emotion/css';

const { Text } = Typography;

const chatWindowStyles = css`
  height: calc(100vh - 150px);
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
      color: #667781;
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

`;

interface ChatWindowProps {
  chatMessages: any[]; // Changed from messages to chatMessages to match usage
  onLoadMore: () => void;
  hasMoreMessages: boolean;
  loading?: boolean;
}


const ChatWindow: React.FC<ChatWindowProps> = ({
  chatMessages,
  onLoadMore,
  hasMoreMessages,
  loading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    if (scrollTop === 0 && hasMoreMessages && !loading) {
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

 console.log("group messages",groupMessagesByDate(chatMessages));

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
            <div
              key={message.id}
              className={`message ${message.fromMe ? 'sent' : ''}`}
            >{console.log(message)}
              <div className={`message-content ${message.fromMe ? 'sent' : ''}`}>
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
                <div className="message-text">{message.body }{message.mimetype}</div>
               
                <div className="message-meta">
                  {moment(message.timestamp * 1000).format('HH:mm')}
                  {message.ack && <span className="message-status">{message.ackName}</span>}
                </div>
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