import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  X, 
  Loader2,
  Mail,
  Lock,
  MoreVertical,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'member' });
  const [actionLoading, setActionLoading] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await API.get('auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('auth/register', newUser);
      setShowModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'member' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`auth/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await API.delete(`auth/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div className="container">Loading team data...</div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Team Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage roles and permissions for your organization</p>
        </div>
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ width: 'auto', padding: '0.8rem 1.8rem', borderRadius: '12px' }}
          >
            <UserPlus size={20} /> Add Member
          </motion.button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ padding: '0', overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MEMBER</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>EMAIL</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ROLE</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JOINED</th>
                {isAdmin && <th style={{ paddingRight: '2rem', textAlign: 'right' }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', background: user._id === currentUser._id ? 'rgba(99, 102, 241, 0.03)' : 'transparent' }}>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: user.role === 'admin' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-dark)',
                        border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold'
                      }}>
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{user.name} {user._id === currentUser._id && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(You)</span>}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    {isAdmin && user._id !== currentUser._id ? (
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px', fontSize: '0.8rem', color: 'white' }}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`badge badge-${user.role === 'admin' ? 'completed' : 'todo'}`} style={{ fontSize: '0.7rem' }}>
                        {user.role.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                      {user._id !== currentUser._id && (
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                          title="Remove User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '1rem' }}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>Add Team Member</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: '700' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input type="text" style={{ paddingLeft: '2.8rem' }} value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required placeholder="John Doe" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: '700' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input type="email" style={{ paddingLeft: '2.8rem' }} value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required placeholder="john@company.com" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: '700' }}>Initial Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input type="password" style={{ paddingLeft: '2.8rem' }} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} required placeholder="Min. 6 chars" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: '700' }}>Assign Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="nav-link" style={{ flex: 1, border: '1px solid var(--border)', justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={actionLoading} style={{ flex: 1, padding: '1rem' }}>
                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Add Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
