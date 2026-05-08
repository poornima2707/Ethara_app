import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Folder
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('tasks/dashboard');
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchStats();
  }, []);

  if (!stats) return <div className="container">Loading Dashboard...</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Cards as per checklist: Total Projects, Total Tasks, Completed Tasks, Overdue Tasks
  const dashboardCards = [
    { label: 'Total Projects', value: stats.projectCount || 0, icon: <Folder size={24} />, color: 'var(--primary)', glow: 'rgba(99, 102, 241, 0.1)' },
    { label: 'Total Tasks', value: stats.totalTasks || 0, icon: <Target size={24} />, color: 'var(--secondary)', glow: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Completed Tasks', value: stats.completedTasks || 0, icon: <CheckCircle2 size={24} />, color: 'var(--success)', glow: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Overdue Tasks', value: stats.overdueTasks || 0, icon: <AlertCircle size={24} />, color: 'var(--danger)', glow: 'rgba(239, 68, 68, 0.1)' }
  ];

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <motion.header
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '3rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
            Workplace Insight
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          {greeting}, <span style={{ background: 'linear-gradient(to right, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
          <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid"
        style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}
      >
        {dashboardCards.map((card, i) => (
          <motion.div key={i} variants={itemVariants} className="glass-card stat-card" style={{ borderLeft: `4px solid ${card.color}`, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ color: card.color, background: card.glow, padding: '10px', borderRadius: '12px', alignSelf: 'flex-start' }}>
              {card.icon}
            </div>
            <div style={{ textAlign: 'left' }}>
              <span className="stat-value" style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.25rem' }}>{card.value}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: '2rem' }}
        >
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp size={22} color="var(--primary)" /> Activity Analysis
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { label: 'Overall Completion', val: stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0, color: 'var(--success)' },
              { label: 'In-Progress Projects', val: stats.projectCount > 0 ? 100 : 0, color: 'var(--primary)' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '700' }}>
                  <span>{item.label}</span>
                  <span>{item.val}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    transition={{ delay: 0.8, duration: 1 }}
                    style={{ height: '100%', background: item.color, borderRadius: '10px' }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent)' }}
        >
          <Users size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>Team Collaboration</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>You are logged in as <strong style={{ color: 'white' }}>{user.name}</strong> ({user.role})</p>
          <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
            Manage Profile
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
