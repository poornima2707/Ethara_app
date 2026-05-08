import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // MISSING IMPORT FIXED
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Folder, 
  Plus, 
  X, 
  Loader2, 
  Layers,
  ArrowUpRight,
  Users,
  Check,
  Calendar,
  Trash2,
  Edit,
  User as UserIcon,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', members: [], deadline: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  const { user, isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      setFetching(true);
      const [projectsRes, membersRes] = await Promise.all([
        API.get('projects'),
        API.get('auth/users')
      ]);
      
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      setMembersList(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await API.put(`projects/${isEditing}`, newProject);
      } else {
        await API.post('projects', newProject);
      }
      setNewProject({ name: '', description: '', members: [], deadline: '' });
      setShowModal(false);
      setIsEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setNewProject({
      name: project.name,
      description: project.description,
      members: project.members.map(m => m._id || m),
      deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''
    });
    setIsEditing(project._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete all tasks in this project.')) return;
    try {
      await API.delete(`projects/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected 
          ? prev.members.filter(id => id !== userId)
          : [...prev.members, userId]
      };
    });
  };

  const filteredMembersList = (membersList || []).filter(m => 
    (m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || 
     m.email?.toLowerCase().includes(memberSearch.toLowerCase())) &&
    m._id !== user?._id
  );

  if (fetching && projects.length === 0) return <div className="container">Loading workspaces...</div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>Project Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Manage and organize your team workspaces</p>
        </div>
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setNewProject({ name: '', description: '', members: [], deadline: '' });
              setIsEditing(null);
              setShowModal(true);
            }} 
            className="btn-primary"
            style={{ width: 'auto', padding: '0.8rem 1.8rem', borderRadius: '12px' }}
          >
            <Plus size={20} /> Create Project
          </motion.button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}
      >
        <AnimatePresence>
          {(projects || []).map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
              style={{ 
                position: 'relative', 
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                minHeight: '440px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 8px 20px var(--primary-glow)'
                }}>
                  <Folder size={24} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {isAdmin && (
                     <>
                        <button 
                          onClick={() => handleEdit(project)}
                          style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: 'var(--text-muted)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project._id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                     </>
                   )}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', minHeight: '3rem' }}>
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <UserIcon size={14} /> <span>By: {project.owner?.name || 'Admin'}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: project.deadline && new Date(project.deadline) < new Date() ? 'var(--danger)' : 'var(--text-muted)' }}>
                      <Calendar size={14} /> <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline'}</span>
                   </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', display: 'flex', gap: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TASKS</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{project.taskCounts?.completed || 0} / {project.taskCounts?.total || 0}</span>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border)' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>MEMBERS</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{project.members?.length || 0}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <span>Progress</span>
                  <span>{project.taskCounts?.total > 0 ? Math.round((project.taskCounts.completed / project.taskCounts.total) * 100) : 0}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.taskCounts?.total > 0 ? (project.taskCounts.completed / project.taskCounts.total) * 100 : 0}%` }}
                    transition={{ duration: 1.2 }}
                    style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), var(--secondary))', borderRadius: '10px' }}
                  ></motion.div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1.5rem' }}>
                   {project.members?.slice(0, 5).map((m, i) => (
                      <div key={m._id || m} title={m.name || 'Member'} style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: 'var(--bg-dark)', 
                        border: '1px solid var(--border)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        marginLeft: i > 0 ? '-8px' : '0',
                        zIndex: 10 - i
                      }}>
                        {m.name?.[0].toUpperCase() || 'M'}
                      </div>
                   ))}
                </div>

                <Link 
                  to={`/tasks?project=${project._id}`}
                  className="nav-link" 
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center', 
                    border: '1px solid var(--border)', 
                    background: 'rgba(255,255,255,0.02)',
                    padding: '0.8rem',
                    borderRadius: '12px',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  View Workspace <ArrowUpRight size={18} style={{ marginLeft: '0.5rem' }} />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {projects.length === 0 && !fetching && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}
        >
           <Folder size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
           <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>No Projects Yet</h2>
           <p style={{ marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
             {isAdmin 
               ? "You haven't created any workspaces yet. Start by defining your first project." 
               : "No projects have been assigned to you yet. Contact your administrator."}
           </p>
           {isAdmin && (
             <button 
               onClick={() => {
                 setNewProject({ name: '', description: '', members: [], deadline: '' });
                 setIsEditing(null);
                 setShowModal(true);
               }} 
               className="btn-primary" 
               style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1rem', borderRadius: '14px' }}
             >
               <Plus size={20} style={{ marginRight: '0.5rem' }} /> Create Your First Project
             </button>
           )}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
              padding: '1rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>{isEditing ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                   <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateOrUpdate}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: '700' }}>Project Name</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                    placeholder="e.g. E-Commerce Website"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontWeight: '700' }}>Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '700' }}>Add Team Members ({newProject.members.length} selected)</label>
                  <div style={{ position: 'relative', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Search members..." 
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      style={{ paddingLeft: '2.2rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    maxHeight: '130px', 
                    overflowY: 'auto',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                  }}>
                    {filteredMembersList.length > 0 ? (
                      filteredMembersList.map(member => {
                        const isSelected = newProject.members.includes(member._id);
                        return (
                          <div 
                            key={member._id}
                            onClick={() => toggleMember(member._id)}
                            style={{ 
                              padding: '8px 16px', 
                              borderRadius: '10px', 
                              fontSize: '0.85rem', 
                              cursor: 'pointer',
                              background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                              color: isSelected ? 'white' : 'var(--text-muted)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontWeight: '600'
                            }}
                          >
                            {isSelected && <Check size={14} />}
                            {member.name}
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>No members found.</p>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: '700' }}>Description</label>
                  <textarea
                    rows="3"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe the project goals..."
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="nav-link" style={{ flex: 1, border: '1px solid var(--border)', justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '1rem' }}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : isEditing ? 'Update Project' : 'Create Project'}
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

export default Projects;
