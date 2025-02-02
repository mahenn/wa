// MessageMenu.tsx
import React from 'react';
import { Menu, Dropdown } from 'antd';
import { MoreOutlined, MessageOutlined, DownloadOutlined, ForwardOutlined, DeleteOutlined } from '@ant-design/icons';

interface MessageMenuProps {
  message: any;
  onReply: (message: any) => void;
  onDownload: (message: any) => void;
  onForward: (message: any) => void;
  onDelete: (message: any) => void;
}

const MessageMenu: React.FC<MessageMenuProps> = ({
  message,
  onReply,
  onDownload,
  onForward,
  onDelete,
}) => {
  const menu = (
    <Menu>
      <Menu.Item key="reply" onClick={() => onReply(message)} icon={<MessageOutlined />}>
        Reply
      </Menu.Item>
      {message.hasMedia && (
        <Menu.Item key="download" onClick={() => onDownload(message)} icon={<DownloadOutlined />}>
          Download
        </Menu.Item>
      )}
      <Menu.Item key="forward" onClick={() => onForward(message)} icon={<ForwardOutlined />}>
        Forward
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => onDelete(message)} icon={<DeleteOutlined />} danger>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <MoreOutlined style={{ cursor: 'pointer' }} />
    </Dropdown>
  );
};

export default MessageMenu;