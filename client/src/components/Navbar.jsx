import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  LogOut, 
  Bell,
  Clock,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const clearAll = async () => {
    try {
      await API.delete('notifications/all');
      setNotifications([]);
    } catch (err) { console.error(err); }
  };

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={18} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={18} /> },
    { name: 'Team', path: '/team', icon: <Users size={18} /> },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="glass-card" style={{ 
      position: 'fixed', top: '1rem', left: '1rem', right: '1rem', 
      height: '70px', zIndex: 1000, borderRadius: '20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', border: '1px solid var(--border)',
      background: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(15px)'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ 
          background: 'var(--primary)', color: 'white', width: '36px', height: '36px', 
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '1.2rem'
        }}>E</div>
        <div style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
          Ethara<span style={{ color: 'var(--primary)' }}>.</span>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px' }}>
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '8px 16px',
              borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700',
              color: location.pathname === item.path ? 'white' : 'var(--text-muted)',
              background: location.pathname === item.path ? 'var(--primary)' : 'transparent',
              transition: 'all 0.3s'
            }}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: unreadCount > 0 ? 'var(--primary)' : 'white', cursor: 'pointer', position: 'relative', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--bg-dark)' }}>
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ position: 'absolute', top: '120%', right: 0, width: '320px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', padding: '1.25rem', backdropFilter: 'blur(20px)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: '800' }}>Notifications</h4>
                  <button onClick={clearAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Clear All</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n._id} onClick={() => markAsRead(n._id)} style={{ padding: '0.75rem', borderRadius: '10px', background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem', color: n.isRead ? 'var(--text-muted)' : 'white' }}>{n.message}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )) : <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem', fontSize: '0.85rem' }}>No alerts.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '12px', color: 'white', cursor: 'pointer' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', display: 'none', display: 'block' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: '800', lineHeight: 1 }}>{user.name.split(' ')[0]}</div>
               <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <ChevronDown size={14} style={{ opacity: 0.5 }} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ position: 'absolute', top: '120%', right: 0, width: '200px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}
              >
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                   <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{user.name}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <Link 
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  <UserIcon size={18} /> Profile Settings
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
