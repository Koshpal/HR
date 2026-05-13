import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings as SettingsIcon, Save, Camera, Building2, Phone, Mail, Briefcase, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HrService } from '../../services/hr.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    companyName: 'Koshpal Corporation', // Fallback
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem('hr_notifications') !== 'false'
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await HrService.getHrProfile();
      
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        designation: profile.designation || 'HR Manager',
        companyName: profile.companyId || 'Koshpal Corporation', // Backend might return company name in companyId or a separate field
      });

      if (profile.profilePhoto) setProfilePicture(profile.profilePhoto);
      
    } catch (err) {
      console.error('Error loading HR profile:', err);
      // Fallback to auth user if profile fetch fails
      if (authUser) {
        setFormData(prev => ({
          ...prev,
          fullName: authUser.name || '',
          email: authUser.email || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        designation: formData.designation,
      };
      
      await HrService.updateHrProfile(updateData);
      
      // Update local storage if needed
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...savedUser,
        name: formData.fullName,
      }));
      
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG or WebP images are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB.', 'error');
      return;
    }
    setPhotoUploading(true);
    try {
      const result = await HrService.uploadProfilePhoto(file);
      if (result.profilePhoto) {
        setProfilePicture(result.profilePhoto);
        showToast('Profile photo updated!', 'success');
      } else {
        throw new Error('No profile photo URL returned from server');
      }
    } catch (error: any) {
      console.error('Photo upload error:', error);
      const errorMsg = error?.message || 'Failed to upload photo.';
      showToast(errorMsg, 'error');
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    try {
      await HrService.removeProfilePhoto();
      setProfilePicture(null);
      showToast('Profile photo removed.', 'success');
    } catch (error: any) {
      console.error('Photo removal error:', error);
      const errorMsg = error?.message || 'Failed to remove photo.';
      showToast(errorMsg, 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] font-heading">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Manage your HR profile and organization preferences.</p>
      </header>

      {/* Profile Section */}
      <Card className="overflow-hidden border-none shadow-xl bg-[var(--color-bg-card)]">
        <div className="p-6 md:p-8 border-b border-[var(--color-border-primary)] flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent">
          <div className="relative group">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="w-28 h-28 rounded-[2rem] bg-[var(--color-primary)] text-white flex items-center justify-center text-4xl font-bold overflow-hidden shadow-2xl shadow-[var(--color-primary)]/20 border-4 border-white dark:border-slate-800">
              {photoUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{(formData.fullName[0] || 'H').toUpperCase()}</span>
              )}
            </div>
            <button
              type="button"
              disabled={photoUploading}
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 border border-[var(--color-border-primary)] rounded-2xl shadow-xl text-[var(--color-primary)] hover:scale-110 transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            {profilePicture && !photoUploading && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition-all"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] font-heading">{formData.fullName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full">
                <Briefcase className="w-3 h-3" /> {formData.designation}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full">
                <Building2 className="w-3 h-3" /> {formData.companyName}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium text-[var(--color-text-primary)]"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium text-[var(--color-text-primary)]"
                placeholder="e.g. Senior HR Manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-5 py-3.5 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded-2xl text-[var(--color-text-secondary)] cursor-not-allowed font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-medium text-[var(--color-text-primary)]"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" className="px-8 rounded-2xl" onClick={loadProfile}>
              Reset
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-2 px-10 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences & Appearance */}
      <Card className="p-8 border-none shadow-xl bg-[var(--color-bg-card)] space-y-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] font-heading flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-[var(--color-primary)]" />
          Preferences & Appearance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-5 bg-[var(--color-bg-secondary)] rounded-[1.5rem] border border-[var(--color-border-primary)]/50">
            <div>
              <p className="font-bold text-[var(--color-text-primary)]">Theme Mode</p>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">Switch between light and dark themes</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-[var(--color-bg-secondary)] rounded-[1.5rem] border border-[var(--color-border-primary)]/50">
            <div className="flex-1">
              <p className="font-bold text-[var(--color-text-primary)]">Notifications</p>
              <p className="text-xs text-[var(--color-text-secondary)] font-medium">Email alerts for employee milestones</p>
            </div>
            <button
              onClick={() => {
                const next = !notificationsEnabled;
                setNotificationsEnabled(next);
                localStorage.setItem('hr_notifications', String(next));
              }}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${notificationsEnabled ? 'bg-[var(--color-primary)]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-8 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-red-600 font-heading">Account Actions</h2>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium">Logging out will securely end your current HR session.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-10 py-3.5 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </Card>
    </div>
  );
};

export default Settings;
