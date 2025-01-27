import React, { useState, useEffect } from 'react';
import { Modal, Spin, Typography, Button } from 'antd';

const { Title, Text, Link } = Typography;

const WhatsAppQRCodeModal = ({ isVisible, qrCode, isLoading, onRestart }) => {
  const [qrInitialized, setQrInitialized] = useState(false);

  useEffect(() => {
    if (qrCode) {
      setQrInitialized(true);
    }
  }, [qrCode]);

  return (
    <Modal
      title="Link your WhatsApp to Hallow"
      open={isVisible}
      footer={null}
      centered
      closable={false}
      width={600}
    >
      <div style={{ padding: '20px' }}>
        <Title level={4}>Open your WhatsApp app with the number you want to connect</Title>
        <Text>
          This can be a WhatsApp personal or business number (NOT an API number).
        </Text>

        <Title level={4} style={{ marginTop: '20px' }}>Scan the QR code to connect your phone</Title>
        <Text>1. Click on Menu (three dots) in Android or Settings in iOS</Text>
        <br />
        <Text>2. Tap on Linked Devices &gt; Link a Device</Text>
        <br />
        <Text>3. Scan the QR code. Your phone may take a few seconds to connect.</Text>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          {isLoading && (
            <div>
              <Spin size="large" />
              <Text style={{ display: 'block', marginTop: '10px' }}>
                Initializing your phone server...
              </Text>
            </div>
          )}
          {!isLoading && qrCode && (
            <img
              src={qrCode}
              alt="WhatsApp QR Code"
              style={{ width: '250px', height: '250px', margin: '20px auto' }}
            />
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link onClick={onRestart} style={{ color: 'red' }}>
            Facing issues? Click to restart phone
          </Link>
          <br />
          <Button type="primary" style={{ marginTop: '10px' }}>Contact us</Button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppQRCodeModal;