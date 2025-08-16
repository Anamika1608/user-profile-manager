import { useState } from 'react';
import { User } from '../lib/types';

interface UseQRScannerReturn {
  isQRScannerOpen: boolean;
  scannedUserData: Partial<User> | null;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  handleUserDataScanned: (userData: Partial<User>) => void;
  clearScannedData: () => void;
}

export const useQRScanner = (): UseQRScannerReturn => {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedUserData, setScannedUserData] = useState<Partial<User> | null>(null);

  const openQRScanner = () => {
    setIsQRScannerOpen(true);
  };

  const closeQRScanner = () => {
    setIsQRScannerOpen(false);
  };

  const handleUserDataScanned = (userData: Partial<User>) => {
    setScannedUserData(userData);
  };

  const clearScannedData = () => {
    setScannedUserData(null);
  };

  return {
    isQRScannerOpen,
    scannedUserData,
    openQRScanner,
    closeQRScanner,
    handleUserDataScanned,
    clearScannedData
  };
};