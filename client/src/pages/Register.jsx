import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Decor */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card auth-card"
        style={{ maxWidth: '440px', zIndex: 10, padding: '1.25rem !important' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ 
              background: 'linear-gradient(135deg, var(--secondary), var(--primary))', 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)'
            }}
          >
            <UserPlus size={24} color="white" />
          </motion.div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '0.15rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Join the team today</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontWeight: '600', fontSize: '0.8rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User className="input-icon" size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required style={{ paddingLeft: '2.5rem', padding: '0.75rem' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontWeight: '600', fontSize: '0.8rem' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail className="input-icon" size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@company.com" required style={{ paddingLeft: '2.5rem', padding: '0.75rem' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontWeight: '600', fontSize: '0.8rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock className="input-icon" size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••" required minLength="6" style={{ paddingLeft: '2.5rem', padding: '0.75rem' }} />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontWeight: '600', fontSize: '0.8rem' }}>Role</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck className="input-icon" size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ paddingLeft: '2.5rem', width: '100%', padding: '0.75rem', appearance: 'none' }}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary" 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.85rem', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Register <ArrowRight size={18} /></>}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
