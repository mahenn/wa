import React, { useState } from 'react';
import { Input, Button, Upload, Typography,message } from 'antd';
import { UploadOutlined, CloseCircleOutlined, SendOutlined, 
  PaperClipOutlined } from '@ant-design/icons';


interface ChatInputProps {
  onSendMessage: (message: any) => void;
  replyToMessage?: any;
  onCancelReply?: () => void;
}

const { Text } = Typography;



const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, replyToMessage, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null); // Store the uploaded file
  const [fileError, setFileError] = useState(false); // Track file encoding errors

  const handleSend = () => {
    if (!message.trim() && !uploadedFile) return;

     try
     {  // Ensure there's either a message or a file
      if (uploadedFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64Data = result.split(',')[1]; // Ensure correct Base64 encoding without prefix
          try {
            window.atob(base64Data); // Check if Base64 string is valid
            // Send both message text and media file in one payload
            onSendMessage({ 
              type: 'media', 
              content: base64Data, 
              media: { 
                mimetype: uploadedFile.type, 
                filename: uploadedFile.name, 
                caption: message || '', 
                replyTo: replyToMessage ? replyToMessage.id : null, // Add reply-to message ID
              } 
            });
            setMessage(''); 
            setUploadedFile(null);
            setFileError(false); 
            onCancelReply(); // Clear reply after sending
          } catch (err) {
            console.error('Invalid Base64 string:', err);
            setFileError(true); // Handle invalid Base64 errors
          }
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        onSendMessage({
          type: 'text',
          content: message,
          replyTo: replyToMessage?.id,
        });
        setMessage('');
        onCancelReply(); // Clear reply after sending
      }
    } catch (error) {
      message.error('Failed to send message');
    }
  };
 

  const handleUpload = (file) => {
    setUploadedFile(file); // Store the uploaded file
    return false; // Prevent the automatic upload
  };

  return (
    <div style={{ display: 'flex', padding: '20px', flexDirection: 'column' }}>
      {replyToMessage && (
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <Text type="secondary">Replying to: {replyToMessage.body}</Text>
          <CloseCircleOutlined onClick={onCancelReply}
            style={{ marginLeft: '10px', cursor: 'pointer' }}
          />
        </div>
      )}
      <div style={{ display: 'flex' }}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          //onPressEnter={handleSend}
          placeholder="Type a message..."
          autoSize={{ maxRows: 4 }}
          style={{ flexGrow: 1, marginRight: '10px' }}
        />
        <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*,video/*,application/*">
          <Button icon={<UploadOutlined />} />
        </Upload>
        <Button type="primary" onClick={handleSend}>
          Send
        </Button>
      </div>
      {uploadedFile && (
        <div className="media-preview">
          <span>{uploadedFile.name}</span>
          <CloseCircleOutlined onClick={() => setUploadedFile(null)} />
        </div>
      )}
      {fileError && <div style={{ color: 'red' }}>Invalid file encoding. Please try again.</div>}
    </div>
  );
};

export default ChatInput; 
