import React, { useRef, useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import { User } from '../lib/types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDataScanned: (userData: Partial<User>) => void;
}

interface ScannedUserData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  type?: string;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ 
  isOpen, 
  onClose, 
  onUserDataScanned 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Parse QR code data
  const parseQRData = (data: string): ScannedUserData | null => {
    try {
      console.log("parseQRData here", data)
      const parsed = JSON.parse(data);
      
      // Validate that it's a user profile QR code
      if (parsed.type === 'user_profile' && parsed.fullName && parsed.email) {
        return {
          fullName: parsed.fullName,
          email: parsed.email,
          phoneNumber: parsed.phoneNumber || '',
          bio: parsed.bio || '',
          location: parsed.location || '',
          dateOfBirth: parsed.dateOfBirth || '',
          avatarUrl: parsed.avatarUrl || '',
          type: parsed.type
        };
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Handle successful QR code scan
  const handleSuccessfulScan = (userData: ScannedUserData) => {
    setError(null);
    
    // Pass data back to parent component
    onUserDataScanned({
      fullName: userData.fullName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      bio: userData.bio,
      location: userData.location,
      dateOfBirth: userData.dateOfBirth,
      avatarUrl: userData.avatarUrl
    });

    // Close modal after a brief delay
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Process image for QR code
  const processImage = (imageData: ImageData) => {
    console.log("imageData", imageData)
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    console.log("code", code)
    
    if (code) {
      const userData = parseQRData(code.data);
      if (userData) {
        handleSuccessfulScan(userData);
      } else {
        setError('Invalid QR code format. Please scan a user profile QR code.');
      }
    } else {
      console.log("parseQRData(code.data)", parseQRData(code.data))
      console.log("No QR code found")
      setError('No QR code found in the image. Please try another image.');
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("file here", file)

    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processImage(imageData);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Cleanup on close
  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Upload className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Upload QR Code</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* File Upload Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select QR Code Image</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors border-2 border-blue-300 flex items-center justify-center space-x-3"
              >
                <Upload className="w-6 h-6" />
                <span className="text-lg">Choose Image File</span>
              </button>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Supports JPG, PNG, and other image formats
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Tips for best results:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use a clear, high-quality image of the QR code</li>
                <li>• Ensure the entire QR code is visible in the image</li>
                <li>• Only user profile QR codes will be accepted</li>
                <li>• Avoid blurry or distorted images</li>
              </ul>
            </div>
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </>
  );
};

export default QRScannerModal;