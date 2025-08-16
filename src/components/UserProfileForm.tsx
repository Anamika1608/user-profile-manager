import React, { useState, useRef, useEffect } from 'react';
import { User, UserFormData, FormErrors } from '../lib/types';
import { Upload, User as UserIcon, X } from 'lucide-react';

interface UserProfileFormProps {
  user?: User | null;
  qrData?: Partial<User> | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  user,
  qrData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {

  const [errors, setErrors] = useState<FormErrors>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : '',
        location: user.location || '',
      });
    }
  }, [user]);

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) return null; // Phone is optional

    // Clean phone number - remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // More flexible phone validation
    // Allows: +1234567890, 1234567890, +12 345 678 90, etc.
    const phoneRegex = /^(\+\d{1,3})?\d{7,15}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid phone number (7-15 digits)';
    }

    return null;
  };

  const getInitialFormData = (): UserFormData => {
    if (user) {
      // Editing existing user
      return {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        location: user.location || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : '',
        avatarUrl: user.avatarUrl || ''
      };
    } else if (qrData) {
      // Creating new user from QR data
      return {
        fullName: qrData.fullName || '',
        email: qrData.email || '',
        phoneNumber: qrData.phoneNumber || '',
        bio: qrData.bio || '',
        location: qrData.location || '',
        dateOfBirth: qrData.dateOfBirth ? qrData.dateOfBirth.split("T")[0] : '',
        avatarUrl: qrData.avatarUrl || ''
      };
    } else {
      // Creating new user with empty form
      return {
        fullName: '',
        email: '',
        phoneNumber: '',
        bio: '',
        location: '',
        dateOfBirth: '',
        avatarUrl: ''
      };
    }
  };

  const [formData, setFormData] = useState<UserFormData>(getInitialFormData());

  // Update form data when props change
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [user, qrData]);

  // Show QR indicator if form was populated from QR scan
  const isFromQRScan = !user && qrData && (qrData.fullName || qrData.email);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Phone number validation
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }

    // Date of birth validation (optional)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation on blur
  const handleFieldBlur = (field: keyof UserFormData, value: string) => {
    // Skip validation if form is read-only (from QR scan)
    if (isFromQRScan) return;

    let error: string | null = null;

    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;
      case 'dateOfBirth':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            error = 'Date of birth cannot be in the future';
          }
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    // Prevent changes if form is read-only (from QR scan)
    if (isFromQRScan) return;

    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (file: File) => {
    // Prevent file upload if form is read-only (from QR scan)
    if (isFromQRScan) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image size should be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, avatarUrl: e.target?.result as string }));
      setErrors(prev => ({ ...prev, avatar: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    // Prevent drag operations if form is read-only (from QR scan)
    if (isFromQRScan) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    // Prevent drop operations if form is read-only (from QR scan)
    if (isFromQRScan) return;

    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Helper function to clean form data before submission
  const cleanFormData = (data: UserFormData): Partial<UserFormData> => {
    const cleaned: Partial<UserFormData> = {};

    // Always include required fields (even if empty, they'll be validated)
    cleaned.fullName = data.fullName.trim();
    cleaned.email = data.email.trim();

    // Only include optional fields if they have values
    if (data.phoneNumber && data.phoneNumber.trim()) {
      // Clean phone number for backend
      cleaned.phoneNumber = data.phoneNumber.replace(/[^\d+]/g, '');
    }

    if (data.bio && data.bio.trim()) {
      cleaned.bio = data.bio.trim();
    }

    if (data.avatarUrl && data.avatarUrl.trim()) {
      cleaned.avatarUrl = data.avatarUrl.trim();
    }

    if (data.dateOfBirth && data.dateOfBirth.trim()) {
      cleaned.dateOfBirth = data.dateOfBirth.trim();
    }

    if (data.location && data.location.trim()) {
      cleaned.location = data.location.trim();
    }

    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission triggered');
    console.log('Form data:', formData);

    if (validateForm()) {
      console.log('Validation passed');
      // Clean the form data before submitting
      const cleanedData = cleanFormData(formData);
      console.log('Cleaned data being sent:', cleanedData);
      onSubmit(cleanedData as UserFormData);
    } else {
      console.log('Validation failed:', errors);
    }
  };

  const getPlaceholder = (defaultPlaceholder: string): string => {
    return isFromQRScan ? 'Not Provided' : defaultPlaceholder;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isFromQRScan ? 'Profile Information from QR Code' : (user ? 'Edit Profile' : 'Create New Profile')}
            </h2>

            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isFromQRScan && (
          <div className="m-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Viewing profile information from QR code scan
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This information is read-only and cannot be modified
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
              {formData.avatarUrl && !isFromQRScan && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {!isFromQRScan && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Drag and drop an image, or <span className="text-blue-600">click to browse</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
            {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={(e) => handleFieldBlur('fullName', e.target.value)}
                readOnly={!!isFromQRScan}
                className={`w-full px-4 py-3 border rounded-lg transition-all ${isFromQRScan
                    ? 'bg-gray-50 border-gray-200 cursor-default'
                    : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  } ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={getPlaceholder("Enter your full name")}
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={(e) => handleFieldBlur('email', e.target.value)}
                readOnly={!!isFromQRScan}
                className={`w-full px-4 py-3 border rounded-lg transition-all ${isFromQRScan
                    ? 'bg-gray-50 border-gray-200 cursor-default'
                    : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={getPlaceholder("Enter your email address")}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={(e) => handleFieldBlur('phoneNumber', e.target.value)}
                readOnly={!!isFromQRScan}
                className={`w-full px-4 py-3 border rounded-lg transition-all ${isFromQRScan
                    ? 'bg-gray-50 border-gray-200 cursor-default'
                    : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  } ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={getPlaceholder("Enter your phone number")}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                onBlur={(e) => handleFieldBlur('dateOfBirth', e.target.value)}
                readOnly={!!isFromQRScan}
                className={`w-full px-4 py-3 border rounded-lg transition-all ${isFromQRScan
                    ? 'bg-gray-50 border-gray-200 cursor-default'
                    : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  } ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              readOnly={!!isFromQRScan}
              className={`w-full px-4 py-3 border rounded-lg transition-all ${isFromQRScan
                  ? 'bg-gray-50 border-gray-200 cursor-default'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300'
                }`}
              placeholder={getPlaceholder("Enter your location")}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              readOnly={!!isFromQRScan}
              className={`w-full px-4 py-3 border rounded-lg transition-all ${isFromQRScan
                  ? 'bg-gray-50 border-gray-200 cursor-default resize-none'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300'
                }`}
              placeholder={getPlaceholder("Tell us about yourself...")}
            />
          </div>

          {/* Form Actions */}
          {!isFromQRScan && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isLoading ? 'Saving...' : (user ? 'Update Profile' : 'Create Profile')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {/* QR Scan Actions */}
          {isFromQRScan && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
              >
                Close
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;