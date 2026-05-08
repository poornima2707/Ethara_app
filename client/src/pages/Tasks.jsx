import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  X, 
  Loader2, 
  Search,
  ChevronDown,
  MoreHorizontal,
  Calendar,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    project: '', 
    priority: 'medium', 
    status: 'todo',
    assignedTo: '',
    dueDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectFilter = queryParams.get('project');

  const fetchData = async () => {
    try {
      setFetching(true);
      const [tasksRes, projectsRes, membersRes] = await Promise.all([
        API.get('tasks'),
        API.get('projects'),
        API.get('auth/users')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Extra safety for members
    if (!newTask.title || !newTask.project) return;
    setLoading(true);
    try {
      if (isEditing) {
        await API.put(`tasks/${isEditing}`, newTask);
      } else {
        await API.post('tasks', newTask);
      }
      setNewTask({ 
        title: '', 
        description: '', 
        project: '', 
        priority: 'medium', 
        status: 'todo',
        assignedTo: '',
        dueDate: ''
      });
      setShowModal(false);
      setIsEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setNewTask({
      title: task.title,
      description: task.description || '',
      project: task.project?._id || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setIsEditing(task._id);
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = task.title?.toLowerCase().includes(query) || 
                         task.project?.name?.toLowerCase().includes(query);
    const matchesProject = projectFilter ? task.project?._id === projectFilter : true;
    return matchesSearch && matchesProject;
  });

  if (fetching && tasks.length === 0) return <div className="container">Loading tasks...</div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
            {projectFilter ? 'Project Workspace' : 'Task Central'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            {projectFilter ? `Viewing tasks for project: ${projects.find(p => p._id === projectFilter)?.name || '...'}` : (isAdmin ? 'Manage organization workflow' : 'View your assigned work items')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '240px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.9rem' }} 
            />
          </div>
          {isAdmin && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNewTask(prev => ({ ...prev, project: projectFilter || '' }));
                setIsEditing(null);
                setShowModal(true);
              }} 
              className="btn-primary"
              style={{ width: 'auto', padding: '0.8rem 1.5rem', borderRadius: '10px' }}
            >
              <Plus size={18} /> Add Task
            </motion.button>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card" 
        style={{ padding: '0', overflow: 'visible', border: '1px solid var(--border)' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Task Name</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Project</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assignee</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Deadline</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Priority</th>
                <th style={{ paddingRight: '2rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <motion.tr 
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{task.title}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                      {task.project?.name || 'General'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {task.assignedTo?.name?.[0].toUpperCase() || '?'}
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}
                    </span>
                  </td>
                  <td>
                    <div style={{ position: 'relative', width: '130px' }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`badge badge-${task.status}`}
                        style={{ width: '100%', border: 'none', appearance: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge-priority-${task.priority}`} style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      padding: '4px 8px', 
                      borderRadius: '6px',
                      background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: task.priority === 'high' ? 'var(--danger)' : 'var(--success)',
                      textTransform: 'uppercase'
                    }}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ paddingRight: '2rem', textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'inline-block' }}>
                      <button 
                        onClick={() => setActiveMenu(activeMenu === task._id ? null : task._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === task._id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            ref={menuRef}
                            style={{ 
                              position: 'absolute', right: '2rem', top: '100%', zIndex: 50,
                              background: 'var(--bg-card)', border: '1px solid var(--border)',
                              borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                              minWidth: '160px', overflow: 'hidden', backdropFilter: 'blur(20px)'
                            }}
                          >
                            {isAdmin ? (
                              <>
                                <button 
                                  onClick={() => handleEdit(task)}
                                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left' }}
                                >
                                  <Edit size={16} className="text-primary" /> Edit Task
                                </button>
                                <button 
                                  onClick={() => handleDelete(task._id)}
                                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', borderTop: '1px solid var(--border)' }}
                                >
                                  <Trash2 size={16} /> Delete Task
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleEdit(task)}
                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left' }}
                              >
                                <Search size={16} style={{ color: 'var(--primary)' }} /> View Details
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <p>No tasks found.</p>
          </div>
        )}
      </motion.div>

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
              style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>
                   {isAdmin ? (isEditing ? 'Edit Task' : 'Add Task') : 'Task Details'}
                </h2>
                <button onClick={() => { setShowModal(false); setIsEditing(null); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                   <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateOrUpdate}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                    disabled={!isAdmin}
                    style={{ background: !isAdmin ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.6)', cursor: !isAdmin ? 'default' : 'text' }}
                    placeholder="Task name"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Project</label>
                    <select
                      value={newTask.project}
                      onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                      required
                      disabled={!isAdmin}
                      style={{ background: !isAdmin ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.6)', cursor: !isAdmin ? 'default' : 'pointer' }}
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Assign To</label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      disabled={!isAdmin}
                      style={{ background: !isAdmin ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.6)', cursor: !isAdmin ? 'default' : 'pointer' }}
                    >
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      disabled={!isAdmin}
                      style={{ background: !isAdmin ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.6)', cursor: !isAdmin ? 'default' : 'pointer' }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      disabled={!isAdmin}
                      style={{ background: !isAdmin ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.6)', cursor: !isAdmin ? 'default' : 'text' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Description</label>
                  <textarea
                    rows="2"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    disabled={!isAdmin}
                    style={{ background: !isAdmin ? 'rgba(255,255,255,0.02)' : 'rgba(15, 23, 42, 0.6)', cursor: !isAdmin ? 'default' : 'text' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => { setShowModal(false); setIsEditing(null); }} className="nav-link" style={{ flex: 1, border: '1px solid var(--border)', justifyContent: 'center' }}>
                     {isAdmin ? 'Cancel' : 'Close'}
                  </button>
                  {isAdmin && (
                    <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, padding: '0.8rem' }}>
                      {loading ? <Loader2 className="animate-spin" size={20} /> : isEditing ? 'Update Task' : 'Create Task'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
