import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lock, 
  Save, 
  Key,
  Loader2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Bell,
  Monitor,
  Moon,
  Sun,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    settings: user?.settings || {
      theme: 'dark',
      notifications: {
        taskAssigned: true,
        statusUpdated: true,
        projectUpdates: true
      }
    }
  });
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('auth/profile', profileData);
      setUser(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await API.put('auth/change-password', passwordData);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const toggleNotification = (key) => {
    setProfileData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings.notifications,
          [key]: !prev.settings.notifications[key]
        }
      }
    }));
  };

  const setTheme = (theme) => {
    setProfileData(prev => ({
      ...prev,
      settings: { ...prev.settings, theme }
    }));
  };

  return (
    <div className="container" style={{ maxWidth: '1200px' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal info, notifications, and app preferences</p>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
              padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              fontWeight: '600'
            }}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Profile & Appearance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <UserIcon size={20} className="text-primary" /> Profile Details
            </h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Full Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Email Address</label>
                <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.8rem' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Monitor size={20} className="text-primary" /> Appearance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {[
                { id: 'dark', icon: <Moon size={18} />, label: 'Dark' },
                { id: 'light', icon: <Sun size={18} />, label: 'Light' },
                { id: 'system', icon: <Monitor size={18} />, label: 'System' }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem',
                    borderRadius: '12px', background: profileData.settings.theme === theme.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)', color: profileData.settings.theme === theme.id ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                >
                  {theme.icon}
                  <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{theme.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Notifications & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={20} className="text-primary" /> Notifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 'taskAssigned', label: 'New Task Assigned', desc: 'Alert when a task is assigned to you' },
                { id: 'statusUpdated', label: 'Task Status Updates', desc: 'Alert when a member updates a task' },
                { id: 'projectUpdates', label: 'Project Milestones', desc: 'Notifications for project changes' }
              ].map(notif => (
                <div key={notif.id} onClick={() => toggleNotification(notif.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{notif.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{notif.desc}</div>
                  </div>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: profileData.settings.notifications[notif.id] ? 'var(--success)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profileData.settings.notifications[notif.id] && <Check size={16} color="white" />}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleUpdateProfile} className="btn-primary" style={{ marginTop: '1.5rem', padding: '0.8rem' }}>Save Preferences</button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={20} className="text-primary" /> Change Password
            </h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <input type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <input type="password" placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.8rem' }}>
                Update Security
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
