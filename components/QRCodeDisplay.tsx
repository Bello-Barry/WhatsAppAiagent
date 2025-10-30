
import React, { useState, useEffect } from 'react';
import { api } from '../services/mockApi';

interface QRCodeDisplayProps {
  agentId: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ agentId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await api.getQRCode(agentId);
      setQrCodeUrl(url);
    } catch (err) {
      setError('Failed to load QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-dark-text-primary mb-4">Link WhatsApp Account</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center">
                {loading && <div className="w-10 h-10 border-4 border-t-brand-primary border-gray-700 rounded-full animate-spin"></div>}
                {error && <p className="text-red-500 text-sm text-center px-4">{error}</p>}
                {qrCodeUrl && !loading && <img src={qrCodeUrl} alt="WhatsApp QR Code" className="rounded-lg" />}
            </div>
            <div>
                <p className="text-dark-text-secondary">To activate this agent, please scan the QR code with your WhatsApp application.</p>
                <ol className="list-decimal list-inside text-sm text-gray-400 mt-2 space-y-1">
                    <li>Open WhatsApp on your phone.</li>
                    <li>Go to Settings > Linked Devices.</li>
                    <li>Tap 'Link a Device' and scan the code.</li>
                </ol>
                <button 
                    onClick={fetchQRCode}
                    disabled={loading}
                    className="mt-4 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-600"
                >
                    {loading ? 'Generating...' : 'Regenerate Code'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default QRCodeDisplay;
