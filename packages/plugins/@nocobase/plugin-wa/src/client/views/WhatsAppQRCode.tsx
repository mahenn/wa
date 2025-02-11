// src/client/WhatsAppQRCode.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Spin, Button, Result } from 'antd';
import { QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';


interface WhatsAppQRCodeProps {
  isVisible: boolean;
  onClose: () => void;
  sessionId: string;
  onRestart: () => void;
  initialQrCode?: string | null;
}

const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({
  isVisible,
  onClose,
  sessionId,
  onRestart,
  initialQrCode
}) => {
  const [qrCode, setQrCode] = useState<string | null>(initialQrCode || null);
  const [loading, setLoading] = useState(!initialQrCode);
  const [error, setError] = useState<string | null>(null);
  //const ws = useRef(useApp()?.ws);

  useEffect(() => {
    setQrCode(initialQrCode);
    if (initialQrCode) {
      setLoading(false);
    }
  }, [initialQrCode]);

  // useEffect(() => {
  //   if (isVisible && sessionId) {
  //     //const ws = window.app.ws;

  //     const messageHandler = (event) => {
  //       const data = JSON.parse(event.data);
  //       console.log("socket event received",event);
  //       switch (data.type) {
  //         case 'qr':
  //           setQrCode(data.qr);
  //           setLoading(false);
  //           setError(null);
  //           break;
  //         case 'ready':
  //           onClose();
  //           break;
  //         case 'error':
  //           setError(data.message);
  //           setLoading(false);
  //           break;
  //       }
  //     };

  //     ws.on('message', messageHandler);
      
  //     // Request QR code
  //     ws.send(JSON.stringify({
  //       type: 'start-session',
  //       sessionId
  //     }));

  //     return () => {
  //       ws.off('message', messageHandler);
  //     };
  //   }
  // }, [isVisible, sessionId]);

  return (
    <Modal
      title="Scan QR Code"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="restart" onClick={onRestart} icon={<ReloadOutlined />}>
          Restart
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={400}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p>Loading QR Code...</p>
        </div>
      ) : error ? (
        <Result
          status="error"
          title="Error"
          subTitle={error}
        />
      ) : qrCode ? (
        <div style={{ textAlign: 'center' }}>
          <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '100%' }} />
          <p>Scan this QR code with WhatsApp on your phone</p>
        </div>
      ) : (
        <Result
          icon={<QrcodeOutlined />}
          title="Waiting for QR Code"
          subTitle="Please wait while we generate your QR code"
        />
      )}
    </Modal>
  );
};

export default WhatsAppQRCode;