// src/client/WhatsAppSessionManager.tsx
import React, { useState, useEffect ,useRef} from 'react';
import { 
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm 
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined,
  StopOutlined,
  DeleteOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useRequest } from '@nocobase/client';
import WhatsAppQRCode from './WhatsAppQRCode';
import { useApp } from '@nocobase/client';
import QRCode from 'qrcode'; // Add this import

const WhatsAppSessionManager: React.FC = () => {
  const [sessions, setSessions] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const wsClient = useRef(useApp()?.ws);
  const [form] = Form.useForm();
  //const wsRef = useRef(useApp()?.ws);
  

  const sessionId = 'default';
  
  // Add WebSocket event listener
  useEffect(() => {
    if (!wsClient.current) return;

    wsClient.current.send(JSON.stringify({ type: 'start-session', sessionId: sessionId }));

    const handleWebSocketMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'engine.event':
            if (data.data.payload?.data?.qr) {
              try {
                const dataUrl = await QRCode.toDataURL(data.data.payload.data.qr); // Fix: Convert to base64
                setQrCode(dataUrl);
                setQrModalVisible(true);
              } catch (error) {
                console.error('QR Code Generation Error:', error);
                message.error('Failed to generate QR code');
              }
            }
            break;
          case 'ready':
            setQrModalVisible(false);
            fetchSessions();
            break;
          case 'error':
            message.error(data.message);
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    wsClient.current.on('message', handleWebSocketMessage);
    return () => {
      wsClient.current?.off('message', handleWebSocketMessage);
    };
  }, []);

  // Fetch sessions
  const { run: fetchSessions, loading } = useRequest({
    url: 'wasessions:list',
    method: 'GET',
  }, {
    manual: true,
    onSuccess: (data) => {
      const sessionsArray = Array.isArray(data?.data) ? data.data : [];
      setSessions(sessionsArray);
    },
  });

  // Create session
  const { run: createSession } = useRequest({
    url: 'wasessions:create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    manual: true,
    onSuccess: (data) => {
      message.success('Session created successfully');
      setIsCreateModalVisible(false);
      form.resetFields();
      setSelectedSession(data); // Store the created session
      setQrModalVisible(true); // Open QR modal after creation
      fetchSessions();
    },
  });

  // Start session
  const { run: startSession } = useRequest({
    url: 'wasessions:start',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    manual: true,
    onSuccess: (data) => {
      message.success('Session started');
      setSelectedSession(data);
      setQrModalVisible(true);
      fetchSessions();
    },
  });

  // Stop session
  const { run: stopSession } = useRequest({
    url: 'wasessions:stop',
    method: 'POST',
  }, {
    manual: true,
    onSuccess: () => {
      message.success('Session stopped');
      fetchSessions();
    },
  });

  // Delete session
  const { run: deleteSession } = useRequest({
    url: 'wasessions:destroy',
    method: 'DELETE',
  }, {
    manual: true,
    onSuccess: () => {
      message.success('Session deleted');
      fetchSessions();
    },
  });

  // Restart session
  const { run: restartSession } = useRequest({
    url: 'wasessions:restart',
    method: 'POST',
  }, {
    manual: true,
    onSuccess: (data) => {
      message.success('Session restarted');
      setSelectedSession(data);
      setQrModalVisible(true);
      fetchSessions();
    },
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ 
          color: status === 'WORKING' ? '#52c41a' : 
                 status === 'STARTING' ? '#faad14' : 
                 status === 'STOPPED' ? '#ff4d4f' : '#8c8c8c'
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'STOPPED' && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                setSelectedSession(record);
                startSession({ params: { session: record.name } });
              }}
            >
              Start
            </Button>
          )}
          {record.status === 'WORKING' && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => stopSession({ params: { session: record.name } })}
            >
              Stop
            </Button>
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={() => restartSession({ params: { session: record.name } })}
          >
            Restart
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this session?"
            onConfirm={() => deleteSession({ filter: { session: record.name } })}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleCreateSession = async (values) => {
    await createSession({
      data: {
        name: values.name || "default",
        start: true,
        config: {
          debug: "true",
          noweb: {
            store: {
              enabled: true,
              fullSync: true
            }
          }
        }
      }
      }
    );
  };

  return (
    <Card title="WhatsApp Sessions">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Create Session
        </Button>

        <Table
          columns={columns}
          dataSource={sessions}
          loading={loading}
          rowKey="name"
        />

        <Modal
          title="Create New Session"
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleCreateSession}
            layout="vertical"
          >
            <Form.Item
              name="name"
              label="Session Name"
              rules={[{ required: true, message: 'Please input session name!' }]}
            >
              <Input placeholder="Enter session name" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Create
                </Button>
                <Button onClick={() => setIsCreateModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <WhatsAppQRCode
          isVisible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          sessionId={selectedSession?.name}
          onRestart={() => {
            if (selectedSession) {
              restartSession({ data: { session: selectedSession.name }});
            }
          }}
          initialQrCode={qrCode}
        />
      </Space>
    </Card>
  );
};

// Add to plugin.tsx
// const WhatsAppPlugin = () => {
//   return {
//     name: 'wa',
//     async load() {
//       this.addRoutes([
//         {
//           path: '/wa/sessions',
//           Component: WhatsAppSessionManager
//         }
//       ]);
//     }
//   };
// };

 export default WhatsAppSessionManager;