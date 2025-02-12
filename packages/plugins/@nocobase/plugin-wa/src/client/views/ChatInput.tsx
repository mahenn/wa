import React, { useState } from 'react';
import { Input, Button, Upload, Typography,message } from 'antd';
import { UploadOutlined, 
        SmileOutlined, 
        PaperClipOutlined, 
        SendOutlined, 
        CloseCircleOutlined,
        CameraOutlined,
        FileImageOutlined,
        FileOutlined,
        AudioOutlined
} from '@ant-design/icons';

import { css } from '@emotion/css';


const chatInputStyles = css`
  .chat-input-container {
    background: #f0f2f5;
    padding: 10px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    
    .input-wrapper {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      padding: 8px 12px;
      min-height: 42px;
      display: flex;
      align-items: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);

      .ant-input {
        border: none;
        padding: 0;
        background: transparent;
        resize: none;
        max-height: 100px;
        overflow-y: auto;
        
        &:focus {
          box-shadow: none;
        }
      }
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #54656f;
      
      .anticon {
        font-size: 20px;
        cursor: pointer;
        transition: color 0.3s;
        
        &:hover {
          color: #00a884;
        }
      }
    }

    .send-button {
      background: #00a884;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: background 0.3s;
      
      &:hover {
        background: #008f72;
      }

      .anticon {
        font-size: 18px;
      }
    }
  }

  .attachment-menu {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .attachment-option {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: #f5f5f5;
      }

      .anticon {
        font-size: 20px;
        margin-right: 12px;
      }
    }
  }

  .reply-preview {
    background: rgba(0, 0, 0, 0.05);
    padding: 8px 12px;
    margin-bottom: 8px;
    border-left: 4px solid #00a884;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .reply-content {
      .reply-title {
        color: #00a884;
        font-weight: 500;
        margin-bottom: 2px;
      }
      
      .reply-text {
        color: #667781;
        font-size: 13px;
      }
    }

    .close-button {
      cursor: pointer;
      color: #667781;
      
      &:hover {
        color: #000;
      }
    }
  }

  .media-preview {
    background: rgba(0, 0, 0, 0.05);
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .file-name {
      color: #667781;
      font-size: 13px;
    }

    .close-button {
      cursor: pointer;
      &:hover {
        color: #dc3545;
      }
    }
  }
`;



interface ChatInputProps {
  onSendMessage: (message: any) => void;
  replyToMessage?: any;
  onCancelReply?: () => void;
}

const { Text } = Typography;



const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, replyToMessage, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
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
            //window.atob(base64Data); // Check if Base64 string is valid
            // Send both message text and media file in one payload
            onSendMessage({ 
              type: getMediaType(uploadedFile.type),
              content: base64Data,
              caption: message,
              fileName: uploadedFile.name,
              mimetype: uploadedFile.type,
              replyTo: replyToMessage?.id
            });
            setMessage(''); 
            setUploadedFile(null);
            setFileError(false); 
            onCancelReply(); // Clear reply after sending
            setShowAttachMenu(false);

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
        setShowAttachMenu(false);

      }
    } catch (error) {
      message.error('Failed to send message');
    }
  };
  
  const getMediaType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const handleUpload = (file) => {
    const maxSize = 16 * 1024 * 1024; // 16MB limit
    if (file.size > maxSize) {
      message.error('File size cannot exceed 16MB');
      return false;
    }
    setUploadedFile(file); // Store the uploaded file
    return false; // Prevent the automatic upload
  };

//   return (
//     <div className={chatInputStyles}>
//       {replyToMessage && (
//         <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
//           <Text type="secondary">Replying to: {replyToMessage.body}</Text>
//           <CloseCircleOutlined onClick={onCancelReply}
//             style={{ marginLeft: '10px', cursor: 'pointer' }}
//           />
//         </div>
//       )}
//       <div style={{ display: 'flex' }}>
//         <Input
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onPressEnter={(e) => {
//             if (!e.shiftKey) {
//               e.preventDefault();
//               handleSend();
//             }
//           }}
//           //onPressEnter={handleSend}
//           placeholder="Type a message..."
//           style={{ flexGrow: 1, marginRight: '10px' }}
//         />
//         <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*,video/*,application/*">
//           <Button icon={<UploadOutlined />} />
//         </Upload>
//         <Button type="primary" onClick={handleSend}>
//           Send
//         </Button>
//       </div>
//       {uploadedFile && (
//         <div className="media-preview">
//           <span>{uploadedFile.name}</span>
//           <CloseCircleOutlined onClick={() => setUploadedFile(null)} />
//         </div>
//       )}
//       {fileError && <div style={{ color: 'red' }}>Invalid file encoding. Please try again.</div>}
//     </div>
//   );
// };

  return (
    <div className={chatInputStyles}>
      <div className="chat-input-container">
        {/* Emoji Button */}
        <div className="action-buttons">
          <SmileOutlined />
          
          {/* Attachment Button with Menu */}
          <div style={{ position: 'relative' }}>
            <PaperClipOutlined onClick={() => setShowAttachMenu(!showAttachMenu)} />
            {showAttachMenu && (
              <div className="attachment-menu">
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                  <div className="attachment-option">
                    <FileImageOutlined style={{ color: '#7f66ff' }} />
                    <span>Photos</span>
                  </div>
                </Upload>
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                  <div className="attachment-option">
                    <FileOutlined style={{ color: '#5157ae' }} />
                    <span>Document</span>
                  </div>
                </Upload>
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                <div className="attachment-option">
                  <CameraOutlined style={{ color: '#bf59cf' }} />
                  <span>Camera</span>
                </div>
              
              </Upload>
              </div>
            )}
          </div>
        </div>

        {/* Input Wrapper */}
        <div className="input-wrapper">
          {replyToMessage && (
            <div className="reply-preview">
              <div className="reply-content">
                <div className="reply-title">
                  {replyToMessage.fromMe ? 'You' : replyToMessage.from}
                </div>
                <div className="reply-text">{replyToMessage.body}</div>
              </div>
              <CloseCircleOutlined 
                className="close-button" 
                onClick={onCancelReply} 
              />
            </div>
          )}

          {uploadedFile && (
            <div className="media-preview">
              <span className="file-name">{uploadedFile.name}</span>
              <CloseCircleOutlined 
                className="close-button"
                onClick={() => setUploadedFile(null)} 
              />
            </div>
          )}

          <Input.TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Send Button */}
        <Button 
          className="send-button"
          icon={<SendOutlined />}
          onClick={handleSend}
        />
      </div>
    </div>
  );
};
export default ChatInput; 
