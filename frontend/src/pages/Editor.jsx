import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Download, Sparkles, ThumbsUp, ThumbsDown,
    MessageSquare, Send, Loader
} from 'lucide-react';
import { apiService } from '../services/api';

export default function Editor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [refinePrompts, setRefinePrompts] = useState({});
    const [comments, setComments] = useState({});
    const [refiningSection, setRefiningSection] = useState(null);

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            const data = await apiService.getProject(id);
            setProject(data);
        } catch (error) {
            alert('Failed to load project');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAll = async () => {
        setGenerating(true);
        try {
            console.log('[Editor] Calling generateContent for project:', id);
            const result = await apiService.generateContent(id);
            console.log('[Editor] Generate content result:', result);
            await loadProject();
        } catch (error) {
            console.error('[Editor] Generate content error:', error);
            alert('Failed to generate content: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleRefine = async (sectionId) => {
        const prompt = refinePrompts[sectionId];
        if (!prompt) return;

        setRefiningSection(sectionId);
        try {
            const response = await apiService.refineContent(sectionId, prompt);
            setProject({
                ...project,
                sections: project.sections.map(s =>
                    s.id === sectionId ? { ...s, content: response.content } : s
                )
            });
            setRefinePrompts({ ...refinePrompts, [sectionId]: '' });
        } catch (error) {
            alert('Failed to refine content');
        } finally {
            setRefiningSection(null);
        }
    };

    const handleFeedback = async (sectionId, feedback) => {
        try {
            const comment = comments[sectionId] || null;
            await apiService.addFeedback(sectionId, feedback, comment);
            if (comment) {
                setComments({ ...comments, [sectionId]: '' });
            }
        } catch (error) {
            console.error('Failed to add feedback');
        }
    };

    const handleExport = async () => {
        try {
            const blob = await apiService.exportDocument(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title}.${project.doc_type}`;
            document.body.appendChild(a);
            a.click();
            window.URL.removeCObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert('Failed to export document');
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size={48} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    const hasContent = project.sections.some(s => s.content);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
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
                        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                            <ArrowLeft size={18} />
                            Back
                        </button>
                        <h3 style={{ margin: 0 }}>{project.title}</h3>
                    </div>
                    <div className="flex gap-sm">
                        {!hasContent && (
                            <motion.button
                                className="btn btn-primary"
                                onClick={handleGenerateAll}
                                disabled={generating}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Sparkles size={18} />
                                {generating ? 'Generating...' : 'Generate All Content'}
                            </motion.button>
                        )}
                        {hasContent && (
                            <motion.button
                                className="btn btn-secondary"
                                onClick={handleExport}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Download size={18} />
                                Export
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
                {project.sections.sort((a, b) => a.order_index - b.order_index).map((section, index) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card"
                        style={{ marginBottom: 'var(--spacing-xl)' }}
                    >
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <h3>{section.title}</h3>
                                <span style={{
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--color-text-muted)',
                                    background: 'var(--color-bg-elevated)',
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)'
                                }}>
                                    {project.doc_type === 'docx' ? 'Section' : 'Slide'} {index + 1}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--color-bg-elevated)',
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)',
                            minHeight: '150px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6
                        }}>
                            {section.content ? (
                                <p style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                                    {section.content}
                                </p>
                            ) : (
                                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                    Content will appear here after generation
                                </p>
                            )}
                        </div>

                        {section.content && (
                            <div>
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: 'var(--spacing-xs)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 500
                                    }}>
                                        Refine this {project.doc_type === 'docx' ? 'section' : 'slide'}
                                    </label>
                                    <div className="flex gap-sm">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Make it shorter, More formal, Add more details..."
                                            value={refinePrompts[section.id] || ''}
                                            onChange={(e) => setRefinePrompts({ ...refinePrompts, [section.id]: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && handleRefine(section.id)}
                                        />
                                        <motion.button
                                            className="btn btn-primary"
                                            onClick={() => handleRefine(section.id)}
                                            disabled={refiningSection === section.id || !refinePrompts[section.id]}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {refiningSection === section.id ? (
                                                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <Send size={18} />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="flex gap-md items-center">
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                                        Feedback:
                                    </span>
                                    <div className="flex gap-sm">
                                        <motion.button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleFeedback(section.id, 'like')}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ThumbsUp size={16} style={{ color: 'var(--color-success)' }} />
                                        </motion.button>
                                        <motion.button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleFeedback(section.id, 'dislike')}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ThumbsDown size={16} style={{ color: 'var(--color-error)' }} />
                                        </motion.button>
                                    </div>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Add a comment..."
                                        value={comments[section.id] || ''}
                                        onChange={(e) => setComments({ ...comments, [section.id]: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleFeedback(section.id, 'none')}
                                        style={{ flex: 1, fontSize: 'var(--text-sm)' }}
                                    />
                                    <motion.button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleFeedback(section.id, 'none')}
                                        disabled={!comments[section.id]}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <MessageSquare size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
