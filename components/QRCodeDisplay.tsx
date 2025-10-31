import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

interface QRCodeDisplayProps {
  agentId: string;
  onConnected: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ agentId, onConnected }) => {
  const [status, setStatus] = useState<'LOADING' | 'WAITING' | 'QR_CODE' | 'CONNECTED' | 'ERROR'>('LOADING');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.getQRCodeStatus(agentId);
        setError(null);
        
        switch (response.status) {
          case 'CONNECTED':
            setStatus('CONNECTED');
            setQrCodeUrl(null);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(onConnected, 1500); // Give user time to see the connected message
            break;
          case 'QR_CODE':
            setStatus('QR_CODE');
            setQrCodeUrl(response.qr || null);
            break;
          case 'WAITING':
          default:
            setStatus('WAITING');
            setQrCodeUrl(null);
            break;
        }
      } catch (err: any) {
        console.error('Failed to fetch QR status:', err);
        setError('Failed to get connection status. Retrying...');
        setStatus('ERROR');
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    fetchStatus(); // Initial fetch
    intervalRef.current = window.setInterval(fetchStatus, 3000); // Poll every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [agentId, onConnected]);

  const renderContent = () => {
    switch (status) {
      case 'CONNECTED':
        return (
          <div className="text-center text-green-400 flex flex-col items-center">
            <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p className="text-lg font-semibold">Agent Connected!</p>
            <p className="text-sm">The page will refresh shortly.</p>
          </div>
        );
      case 'QR_CODE':
        return (
          <div className="text-center">
            <p className="font-semibold mb-4 text-dark-text-primary">Scan this QR code with your WhatsApp app</p>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="WhatsApp QR Code" className="mx-auto rounded-lg border-4 border-white shadow-lg" />
            ) : (
                <div className="w-64 h-64 bg-dark-card rounded-lg flex items-center justify-center mx-auto animate-pulse">
                    <p className="text-dark-text-secondary">Loading QR...</p>
                </div>
            )}
          </div>
        );
      case 'ERROR':
        return (
          <div className="text-center text-red-400 flex flex-col items-center">
            <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>
            <p className="font-semibold">Connection Error</p>
            {error && <p className="text-sm mt-2">{error}</p>}
          </div>
        );
      case 'LOADING':
      case 'WAITING':
      default:
        return (
          <div className="text-center text-dark-text-secondary flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-t-brand-primary border-gray-700 rounded-full animate-spin mr-4"></div>
            <div>
              <p className="font-semibold text-lg text-dark-text-primary">{status === 'LOADING' ? 'Initializing Connection...' : 'Waiting for QR Code...'}</p>
              <p className="text-sm">Please keep this window open.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Connect Agent to WhatsApp</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${status === 'CONNECTED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
            <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
            <span>{status.replace('_', ' ')}</span>
        </div>
      </div>
      <div className="bg-gray-900/50 p-8 rounded-lg min-h-[300px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
