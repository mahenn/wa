import React, { useEffect, useState, useRef, useCallback } from 'react';
import WhatsAppClone from './WhatsAppClone';
import WhatsAppQRCodeModal from './WhatsAppQRCodeModal';
import { useApp } from '@nocobase/client';
import { useRequest } from '@nocobase/client';

const WhatsAppSession = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<any | null>(null); // Track the message being replied to
  const [sessionStarted, setSessionStarted] = useState(false); // Track if the session has been initialized
  const [retryAttempts, setRetryAttempts] = useState(0); // Track retry attempts
  const wsClient = useRef(useApp()?.ws);
  //const wsClient = useRef(window.app?.ws);
  const [page, setPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sessionId = 'default';


  const loadMessages = useCallback((chatId: string, offset = 0) => {
    return new Promise((resolve, reject) => {
      if (!chatId) {
        reject(new Error('Invalid chatId'));
        return;
      }
      setIsLoadingMore(true);

      wsClient.current?.send(JSON.stringify({ type: 'get-messages', chatId, sessionId, offset }));
      setSelectedChatId(chatId);
      resolve();
    });
  }, [sessionId]);

  // Handle loading more messages
  const handleLoadMore = useCallback(async () => {
    if (!selectedChatId || isLoadingMore) return;
    
    const nextPage = page + 1;
    const offset = nextPage * 50; // Assuming 50 messages per page
    
    try {
      await loadMessages(selectedChatId, offset);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  }, [selectedChatId, page, isLoadingMore, loadMessages]);




  const sendMessage = useCallback((chatId: string, messageContent: any) => {
    wsClient.current?.send(JSON.stringify({
      type: 'new-message',
      chatId,
      sessionId,
      content: messageContent,
    }));
  }, []);

  // Add this function to send reactions to the server
  const sendReaction = useCallback((chatId: string, messageId: string, reaction: string) => {
    wsClient.current?.send(JSON.stringify({
      type: 'react-to-message',
      chatId,
      sessionId,
      content: { messageId, reaction },
    }));
  }, [sessionId]);

  const updateChatsWithNewMessage = useCallback((chatId: string, message: any) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const isActiveChat = chat.id === selectedChatId;
          return {
            ...chat,
            lastMessage: message,
            unreadCount: isActiveChat ? 0 : (chat.unreadCount || 0) + 1,
          };
        }
        return chat;
      })
    );

    if (chatId === selectedChatId) {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    }
  }, [selectedChatId]);

  const sessionStartSent = useRef(false);


  // const { data: sessionStatus, loading: sessionLoading } = useRequest({
  //   url: '/wasessions:get',
  //   method: 'GET',
  // });

  //console.log("waha session status:",sessionStatus);

  useEffect(() => {
    if (!wsClient.current || !wsClient.current.on) {
      console.error('WebSocket client is not available or not connected properly');
      return;
    }

   // if (sessionStarted.current) return;

   // sessionStarted.current = true;

    // Start the WhatsApp session
    if (!sessionStartSent.current) {
      wsClient.current.send(JSON.stringify({ type: 'start-session', sessionId: sessionId }));
      sessionStartSent.current = true;
      setSessionStarted(true);
    }

    const messageHandler = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);

      switch (data.type) {
        case 'qr':
          setLoading(false);
          setQrCode(data.qr);
          setIsReady(false);
          setErrorMessage(null);
          break;

        case 'ready':
        //case 'maintaining':
          setIsReady(true);
          setLoading(false);
          setQrCode(null);
          setErrorMessage(null);
          //wsClient.current.send(JSON.stringify({ type: 'get-contacts', sessionId: sessionId }));
          wsClient.current.send(JSON.stringify({ type: 'get-chats', sessionId: sessionId }));
          break;

        case 'contacts':
          setContacts(data.contacts);
          break;

        case 'chats':
          console.log("chat data here",data.chats);
          setChats(data.chats);
          break;

        case 'new-message':
        case 'new-media-message':
        case 'message-reacted':
          console.log('New message received:', data.message);
          updateChatsWithNewMessage(data.message.from, data.message);
          break;
        case 'message-sent':
          console.log('Message sent:', data.message);
          updateChatsWithNewMessage(data.message.to, data.message);
          break;
        case 'messages':
          console.log('Loaded messages:', data.chatId ,selectedChatId);

          if (data.chatId === selectedChatId) {
            if (data.offset === 0) {
              // New messages or initial load
              setChatMessages(data.messages);
            } else {
              // Loading more messages
              setChatMessages(prevMessages => {
                // Remove duplicates and combine messages
                const newMessages = data.messages.filter(
                  newMsg => !prevMessages.some(
                    existingMsg => existingMsg.id === newMsg.id
                  )
                );
                return [...newMessages, ...prevMessages];
              });
            }
            setHasMoreMessages(data.messages.length === 50); // Update hasMore based on received message count
            setIsLoadingMore(false);
          }





          break;

        case 'error':
          console.error('Error received:', data.message);
          setErrorMessage(`Error: ${data.message || 'Unknown error occurred'}`);
          setLoading(false);
          setIsReady(false);
          break;

        case 'authenticated':
          console.log("authenticated", data);
          break;

          
        default:
          console.warn('Unknown message type:', data.type);
      }
    };

    wsClient.current.on('message', messageHandler);

    return () => {
      wsClient.current.off('message', messageHandler);
    };
  }, [selectedChatId,updateChatsWithNewMessage]);

  // useEffect(() => {
  //   if (selectedChatId && chatMessages.length === 0) {
  //     loadMessages(selectedChatId);
  //   }
  // }, [selectedChatId]);
  //selectedChatId, updateChatsWithNewMessage


  // Reset pagination when changing chats
  useEffect(() => {
    setPage(0);
    //setOffset(0);
    setHasMoreMessages(true);
    setChatMessages([]);
  }, [selectedChatId]);


  // Handler for replying to a message
  const handleReplyToMessage = (message) => {
    setReplyToMessage(message);
  };

  // Handler for canceling the reply action
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  console.log(isReady,qrCode,loading,errorMessage,sessionId,sessionStarted)

  return (
    <div>
      <WhatsAppQRCodeModal
        isVisible={!isReady}
        qrCode={qrCode}
        isLoading={!qrCode && loading}
      />
      {errorMessage && <div className="error">{errorMessage}</div>}
      {isReady && (
        <WhatsAppClone
          contacts={contacts}
          chats={chats}
          loadMessages={loadMessages}
          sendMessage={sendMessage}
          chatMessages={chatMessages}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          sessionId={sessionId}
          replyToMessage={replyToMessage} // Pass the message being replied to
          onReplyToMessage={handleReplyToMessage} // Handle reply action
          onCancelReply={handleCancelReply} // Handle cancel reply action
          sendReaction={sendReaction}
          hasMoreMessages={hasMoreMessages}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
        />
      )}
    </div>
  );
};

export default WhatsAppSession;
