import React, { useEffect, useRef, useState } from 'react';
import { X, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { User } from '../lib/types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, user }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate QR code data from user profile
  const generateQRData = (user: User): string => {
    const qrData = {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      location: user.location || '',
      dateOfBirth: user.dateOfBirth || '',
      avatarUrl: user.avatarUrl || '',
      type: 'user_profile' // Identifier for QR code type
    };

    console.log("QR data being generated:", qrData);
    return JSON.stringify(qrData);
  };

  // Generate QR code on canvas
  const generateQRCode = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const qrData = generateQRData(user);
      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    try {
      const link = document.createElement('a');
      link.download = `${user.fullName.replace(/\s+/g, '_')}_profile_qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    } catch (err) {
      console.error('Error downloading QR code:', err);
      setError('Failed to download QR code');
    }
  };

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && user) {
      generateQRCode();
    }
  }, [isOpen, user]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Profile QR Code</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* User Info */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {user.fullName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            {/* QR Code Container */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg shadow-inner border-2 border-gray-100">
                {isGenerating ? (
                  <div className="w-[300px] h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="w-[300px] h-[300px] flex items-center justify-center text-red-500 text-center">
                    <div>
                      <QrCode className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                ) : (
                  <canvas 
                    ref={canvasRef}
                    className="block"
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                How to use this QR Code:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Scan with any QR code reader to view profile information</li>
                <li>• Share with others to quickly exchange contact details</li>
                <li>• Download and print for business cards or displays</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={downloadQRCode}
                disabled={isGenerating || !!error}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRCodeModal;