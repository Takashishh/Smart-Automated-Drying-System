import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { Lock, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
export function AccountSettingsPage() {
  const {
    user,
    updateProfile,
    changePassword
  } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (!user) return;
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
    });
  }, [user]);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = useState(false);
  const [pendingProfileUpdate, setPendingProfileUpdate] = useState<any>(null);
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // If user starts with single 9 (not 09), prepend 0
    if (value.startsWith('9') && !value.startsWith('09')) {
      value = '0' + value;
    }
    // If it's just 0, allow it
    // Otherwise, only numbers starting with 09 are allowed
    
    // Limit to 11 digits (Philippine number: 09 + 9 digits)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    setProfileData({
      ...profileData,
      phoneNumber: value
    });
  };

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str: string): string => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to sanitize name (only letters and spaces)
  const sanitizeName = (str: string): string => {
    return str.replace(/[^a-zA-Z\s]/g, '');
  };

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    const sanitized = sanitizeName(value);
    const capitalized = capitalizeWords(sanitized);
    setProfileData({
      ...profileData,
      [field]: capitalized
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build update payload
    const updatePayload: any = {};
    if (profileData.firstName.trim()) updatePayload.firstName = profileData.firstName;
    if (profileData.lastName.trim()) updatePayload.lastName = profileData.lastName;
    if (profileData.phoneNumber.trim()) updatePayload.phoneNumber = profileData.phoneNumber;
    if (profileData.address.trim()) updatePayload.address = profileData.address;
    
    // Store pending update and show confirmation dialog
    setPendingProfileUpdate(updatePayload);
    setShowConfirmDialog(true);
  };

  const handleConfirmProfileUpdate = async () => {
    if (!pendingProfileUpdate) return;
    
    setShowConfirmDialog(false);
    setIsProfileSaving(true);
    try {
      await updateProfile(pendingProfileUpdate);
      toast.success('Your profile has been updated!');
      setPendingProfileUpdate(null);
    } catch (error: any) {
      toast.error('Couldn\'t update your profile. Please try again.');
    } finally {
      setIsProfileSaving(false);
    }
  };
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Your password confirmation doesn\'t match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Your password must be at least 8 characters');
      return;
    }
    
    // Show confirmation dialog
    setShowPasswordConfirmDialog(true);
  };

  const handleConfirmPasswordUpdate = async () => {
    setShowPasswordConfirmDialog(false);
    setIsPasswordSaving(true);
    try {
      await changePassword(passwords.current, passwords.new);
      toast.success('Your password has been changed!');
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error: any) {
      toast.error('Couldn\'t change your password. Please try again.');
    } finally {
      setIsPasswordSaving(false);
    }
  };
  return <AdminLayout title="Account Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Profile Information">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user?.firstName?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="First Name" 
                value={profileData.firstName} 
                onChange={e => handleNameChange('firstName', e.target.value)} 
              />
              <Input 
                label="Last Name" 
                value={profileData.lastName} 
                onChange={e => handleNameChange('lastName', e.target.value)} 
              />
            </div>
            <Input label="Email" value={user?.email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 -mt-2">
              Email cannot be changed for security reasons
            </p>
            <Input label="Phone Numbers" value={profileData.phoneNumber} onChange={handlePhoneNumberChange} placeholder="09XX XXX XXXX" />
            <Input label="Address" value={profileData.address} onChange={e => setProfileData({
            ...profileData,
            address: e.target.value
          })} placeholder="123 Main St, City, State" />
            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isProfileSaving} leftIcon={<Save className="h-4 w-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Security">
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-800 mb-4">
              <strong>Password Requirements:</strong>
              <ul className="list-disc list-inside mt-1 text-xs">
                <li>At least 8 characters long</li>
                <li>Mix of uppercase and lowercase letters recommended</li>
                <li>
                  Include numbers and special characters for stronger security
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswordFields.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPasswordFields({ ...showPasswordFields, current: !showPasswordFields.current });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordFields.current ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showPasswordFields.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  required
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPasswordFields({ ...showPasswordFields, new: !showPasswordFields.new });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordFields.new ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswordFields.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  required
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPasswordFields({ ...showPasswordFields, confirm: !showPasswordFields.confirm });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordFields.confirm ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={isPasswordSaving} leftIcon={<Lock className="h-4 w-4" />}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingProfileUpdate(null);
        }}
        onConfirm={handleConfirmProfileUpdate}
        title="Confirm Profile Changes"
        message={`Are you sure you want to update the following information?\n\n${
          Object.entries(pendingProfileUpdate || {})
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
            .join('\n')
        }`}
        confirmText="Confirm Changes"
        cancelText="Cancel"
        variant="primary"
        isLoading={isProfileSaving}
      />

      <ConfirmDialog
        isOpen={showPasswordConfirmDialog}
        onClose={() => setShowPasswordConfirmDialog(false)}
        onConfirm={handleConfirmPasswordUpdate}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use your new password to log in next time."
        confirmText="Change Password"
        cancelText="Cancel"
        variant="warning"
        isLoading={isPasswordSaving}
      />
    </AdminLayout>;
}