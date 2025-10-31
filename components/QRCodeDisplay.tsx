import React, { useState, useEffect, useRef } from 'react';
import { Agent } from '../types';

interface QRCodeDisplayProps {
  agent: Agent;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ agent }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(agent.qr_code_url);
  
  useEffect(() => {
      setQrCodeUrl(agent.qr_code_url);
  }, [agent.qr_code_url]);

  const renderContent = () => {
    switch (agent.connection_status) {
        case 'CONNECTING':
        case 'DISCONNECTED':
            if (qrCodeUrl) {
                return <img src={qrCodeUrl} alt="WhatsApp QR Code" className="rounded-lg w-full h-full" />;
            }
            return (
                <div className="text-center p-4">
                    <div className="w-10 h-10 border-4 border-t-brand-primary border-gray-700 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-dark-text-secondary text-sm">Waiting for QR code from server...</p>
                </div>
            );
        case 'CONNECTED':
            return (
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="mt-4 font-semibold text-green-400">Agent Connected!</p>
                </div>
            );
        case 'LOGGED_OUT':
            return <p className="text-red-500 text-sm text-center px-4">This agent was logged out. Please try to connect again.</p>;
        default:
            return null;
    }
  };


  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Link WhatsApp Account</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center p-2">
                {renderContent()}
            </div>
            <div>
                <p className="text-dark-text-secondary">To activate this agent, please scan the QR code with your WhatsApp application.</p>
                <ol className="list-decimal list-inside text-sm text-gray-400 mt-2 space-y-1">
                    <li>Open WhatsApp on your phone.</li>
                    <li>Go to Settings &gt; Linked Devices.</li>
                    <li>Tap 'Link a Device' and scan the code.</li>
                </ol>
            </div>
        </div>
    </div>
  );
};

export default QRCodeDisplay;