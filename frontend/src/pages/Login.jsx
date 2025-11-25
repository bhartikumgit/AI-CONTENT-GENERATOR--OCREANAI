import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, LogIn } from 'lucide-react';
import { apiService } from '../services/api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiService.login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: 'linear-gradient(135deg, hsl(220, 18%, 8%) 0%, hsl(220, 18%, 12%) 100%)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container-sm"
            >
                <div className="card">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="inline-flex items-center gap-2 mb-4"
                        >
                            <FileText size={40} style={{ color: 'var(--color-primary)' }} />
                            <h1 style={{ marginBottom: 0 }}>AI DocGen</h1>
                        </motion.div>
                        <p className="text-secondary">Login to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                        <div>
                            <label htmlFor="username" style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-xs)',
                                color: 'var(--color-text-secondary)',
                                fontSize: 'var(--text-sm)'
                            }}>
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="password" style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-xs)',
                                color: 'var(--color-text-secondary)',
                                fontSize: 'var(--text-sm)'
                            }}>
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    padding: 'var(--spacing-sm)',
                                    background: 'hsla(0, 70%, 60%, 0.1)',
                                    border: '1px solid var(--color-error)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-error)',
                                    fontSize: 'var(--text-sm)'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogIn size={20} />
                            {loading ? 'Logging in...' : 'Login'}
                        </motion.button>

                        <p className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
