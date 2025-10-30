import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/mockApi';

interface QRCodeDisplayProps {
  agentId: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ agentId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'LOADING' | 'WAITING' | 'QR_CODE' | 'CONNECTED' | 'ERROR'>('LOADING');
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef<number | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await api.getQRCode(agentId);
      switch (response.status) {
        case 'CONNECTED':
          setStatus('CONNECTED');
          setQrCodeUrl(null);
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Reload to reflect the new active status of the agent
          setTimeout(() => window.location.reload(), 1500);
          break;
        case 'QR_CODE':
          setStatus('QR_CODE');
          setQrCodeUrl(response.qr || null);
          break;
        case 'WAITING':
          setStatus('WAITING');
          setQrCodeUrl(null);
          break;
        default:
          setStatus('ERROR');
          setErrorMessage('Received an unknown status from server.');
      }
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage('Failed to connect to the server. Please try again later.');
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };
  
  useEffect(() => {
    fetchStatus(); // Initial fetch
    intervalRef.current = window.setInterval(fetchStatus, 5000); // Poll every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const renderContent = () => {
    switch (status) {
        case 'LOADING':
        case 'WAITING':
            return (
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-t-brand-primary border-gray-700 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-dark-text-secondary">Waiting for QR code from server...</p>
                </div>
            );
        case 'QR_CODE':
            return qrCodeUrl ? <img src={qrCodeUrl} alt="WhatsApp QR Code" className="rounded-lg w-full h-full" /> : <p className="text-red-500">Error: QR data is missing.</p>;
        case 'CONNECTED':
            return (
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="mt-4 font-semibold text-green-400">Agent Connected!</p>
                    <p className="text-sm text-dark-text-secondary">The page will now reload.</p>
                </div>
            );
        case 'ERROR':
            return <p className="text-red-500 text-sm text-center px-4">{errorMessage}</p>;
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