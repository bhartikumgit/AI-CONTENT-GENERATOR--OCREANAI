import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, PlusCircle, LogOut, FileType, Presentation, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await apiService.getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        apiService.logout();
        navigate('/login');
    };

    const handleDeleteProject = async (projectId, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await apiService.deleteProject(projectId);
                setProjects(projects.filter(p => p.id !== projectId));
            } catch (error) {
                alert('Failed to delete project');
            }
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
                padding: 'var(--spacing-lg)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-md">
                        <FileText size={32} style={{ color: 'var(--color-primary)' }} />
                        <h2 style={{ margin: 0 }}>AI DocGen</h2>
                    </div>
                    <motion.button
                        className="btn btn-ghost"
                        onClick={handleLogout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut size={18} />
                        Logout
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
                <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h1>My Projects</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Create and manage your AI-generated documents
                    </p>
                </div>

                {/* New Project Button */}
                <motion.button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/configure')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginBottom: 'var(--spacing-2xl)' }}
                >
                    <PlusCircle size={20} />
                    Create New Project
                </motion.button>

                {/* Projects Grid */}
                {loading ? (
                    <div className="text-center" style={{ padding: 'var(--spacing-3xl)' }}>
                        <p style={{ color: 'var(--color-text-secondary)' }}>Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card text-center"
                        style={{ padding: 'var(--spacing-3xl)' }}
                    >
                        <FileText size={64} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--spacing-lg)' }} />
                        <h3>No projects yet</h3>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            Create your first AI-generated document
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 'var(--spacing-lg)'
                        }}
                    >
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                variants={item}
                                className="card card-hover"
                                onClick={() => navigate(`/editor/${project.id}`)}
                                whileHover={{ scale: 1.02 }}
                                style={{ cursor: 'pointer', position: 'relative' }}
                            >
                                <div className="flex items-center gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    {project.doc_type === 'docx' ? (
                                        <FileType size={24} style={{ color: 'var(--color-primary)' }} />
                                    ) : (
                                        <Presentation size={24} style={{ color: 'var(--color-secondary)' }} />
                                    )}
                                    <span style={{
                                        fontSize: 'var(--text-xs)',
                                        padding: '2px 8px',
                                        background: 'var(--color-bg-elevated)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--color-text-secondary)'
                                    }}>
                                        {project.doc_type.toUpperCase()}
                                    </span>
                                </div>

                                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{project.title}</h3>
                                <p style={{
                                    color: 'var(--color-text-secondary)',
                                    fontSize: 'var(--text-sm)',
                                    marginBottom: 'var(--spacing-md)'
                                }}>
                                    {project.section_count} {project.doc_type === 'docx' ? 'sections' : 'slides'}
                                </p>
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: 'var(--text-xs)'
                                }}>
                                    {new Date(project.created_at).toLocaleDateString()}
                                </p>

                                <motion.button
                                    className="btn btn-ghost btn-sm"
                                    style={{
                                        position: 'absolute',
                                        top: 'var(--spacing-md)',
                                        right: 'var(--spacing-md)'
                                    }}
                                    onClick={(e) => handleDeleteProject(project.id, e)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
