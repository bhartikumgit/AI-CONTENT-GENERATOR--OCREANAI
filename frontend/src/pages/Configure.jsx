import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileType, Presentation, ArrowLeft, ArrowRight, Sparkles, Plus, Minus, GripVertical } from 'lucide-react';
import { apiService } from '../services/api';

export default function Configure() {
    const [step, setStep] = useState(1);
    const [docType, setDocType] = useState('');
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDocTypeSelect = (type) => {
        setDocType(type);
        setStep(2);
    };

    const handleAISuggest = async () => {
        if (!topic) {
            alert('Please enter a topic first');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.generateOutline(topic, docType, 5);
            setSections(response.headings.map((heading, index) => ({
                title: heading,
                order_index: index
            })));
        } catch (error) {
            alert('Failed to generate outline');
        } finally {
            setLoading(false);
        }
    };

    const addSection = () => {
        setSections([...sections, { title: '', order_index: sections.length }]);
    };

    const removeSection = (index) => {
        setSections(sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order_index: i })));
    };

    const updateSection = (index, title) => {
        const updated = [...sections];
        updated[index] = { ...updated[index], title };
        setSections(updated);
    };

    const handleCreateProject = async () => {
        if (!title || sections.length === 0) {
            alert('Please fill in all fields');
            return;
        }

        if (sections.some(s => !s.title)) {
            alert('All sections must have a title');
            return;
        }

        setLoading(true);
        try {
            const project = await apiService.createProject({
                title,
                topic,
                doc_type: docType,
                sections: sections.map((s, i) => ({ title: s.title, order_index: i }))
            });
            navigate(`/editor/${project.id}`);
        } catch (error) {
            alert('Failed to create project');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 'var(--spacing-2xl)' }}
                >
                    <button className="btn btn-ghost" onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="container-sm"
                        >
                            <h1 className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                Choose Document Type
                            </h1>
                            <p className="text-center" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2xl)' }}>
                                What would you like to create?
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                                <motion.div
                                    className="card card-hover text-center"
                                    onClick={() => handleDocTypeSelect('docx')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ cursor: 'pointer', padding: 'var(--spacing-3xl)' }}
                                >
                                    <FileType size={64} style={{ color: 'var(--color-primary)', margin: '0 auto var(--spacing-lg)' }} />
                                    <h3>Word Document</h3>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>Create a structured .docx document</p>
                                </motion.div>

                                <motion.div
                                    className="card card-hover text-center"
                                    onClick={() => handleDocTypeSelect('pptx')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ cursor: 'pointer', padding: 'var(--spacing-3xl)' }}
                                >
                                    <Presentation size={64} style={{ color: 'var(--color-secondary)', margin: '0 auto var(--spacing-lg)' }} />
                                    <h3>PowerPoint</h3>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>Create a .pptx presentation</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="container-lg"
                        >
                            <div className="card">
                                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    Configure Your {docType === 'docx' ? 'Document' : 'Presentation'}
                                </h2>

                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: 'var(--spacing-sm)',
                                        fontWeight: 500
                                    }}>
                                        Project Title
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., EV Market Analysis 2025"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: 'var(--spacing-sm)',
                                        fontWeight: 500
                                    }}>
                                        Topic / Main Prompt
                                    </label>
                                    <textarea
                                        className="textarea"
                                        placeholder="Describe what your document should be about..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        style={{ minHeight: '100px' }}
                                    />
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <label style={{ fontWeight: 500 }}>
                                            {docType === 'docx' ? 'Sections' : 'Slides'}
                                        </label>
                                        <motion.button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleAISuggest}
                                            disabled={loading}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Sparkles size={16} />
                                            {loading ? 'Generating...' : 'AI Suggest'}
                                        </motion.button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        {sections.map((section, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-sm"
                                            >
                                                <GripVertical size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder={`${docType === 'docx' ? 'Section' : 'Slide'} ${index + 1} title`}
                                                    value={section.title}
                                                    onChange={(e) => updateSection(index, e.target.value)}
                                                />
                                                <motion.button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => removeSection(index)}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Minus size={16} style={{ color: 'var(--color-error)' }} />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <motion.button
                                        className="btn btn-ghost"
                                        onClick={addSection}
                                        style={{ marginTop: 'var(--spacing-md)', width: '100%' }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Plus size={18} />
                                        Add {docType === 'docx' ? 'Section' : 'Slide'}
                                    </motion.button>
                                </div>

                                <motion.button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleCreateProject}
                                    disabled={loading}
                                    style={{ width: '100%' }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ArrowRight size={20} />
                                    {loading ? 'Creating...' : 'Create Project'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
