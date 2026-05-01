import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
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
            const response = await api.post('/login', { username, password });
            const { access_token, user } = response.data;

            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user_role', user.role);
            localStorage.setItem('user_name', user.name);

            // Chuyển hướng dựa trên role
            if (user.role === 3) navigate('/admin/dashboard');
            else if (user.role === 2) navigate('/staff/dashboard');
            else navigate('/');
            
            window.location.reload(); // Refresh để cập nhật navbar
        } catch (err) {
            if (err.response?.data?.needs_verification) {
                const userEmail = err.response.data.email;
                setError(
                    <span>
                        {err.response.data.message}{' '}
                        <button 
                            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}
                            onClick={async () => {
                                try {
                                    await api.post('/email/verification-notification', { email: userEmail });
                                    alert('Đã gửi lại email xác thực!');
                                } catch (e) {
                                    alert('Không thể gửi lại email. Vui lòng thử lại sau.');
                                }
                            }}
                        >
                            Gửi lại email?
                        </button>
                    </span>
                );
            } else {
                setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="login-container glass-card"
            >
                <div className="login-header">
                    <h2>Chào mừng trở lại!</h2>
                    <p>Đăng nhập để tiếp tục đặt những món ăn tuyệt vời.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên đăng nhập hoặc Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập username của bạn" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-footer">
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <button type="submit" className="login-submit" disabled={loading}>
                        {loading ? 'Đang xử lý...' : (
                            <><span>Đăng nhập</span> <LogIn size={20} /></>
                        )}
                    </button>
                </form>

                <div className="login-signup">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </motion.div>

            <style jsx>{`
                .login-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                }
                .login-container {
                    width: 100%;
                    max-width: 450px;
                    padding: 3rem;
                    border-radius: var(--radius-xl);
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .login-header h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: var(--bg-dark);
                }
                .login-header p {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                }
                .error-alert {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.9rem;
                    font-weight: 500;
                    border: 1px solid #fecaca;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-main);
                }
                .input-wrapper {
                    position: relative;
                }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .input-wrapper input {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 2.8rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    font-family: inherit;
                    font-size: 1rem;
                    transition: var(--transition);
                }
                .input-wrapper input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }
                .form-footer {
                    text-align: right;
                    margin-bottom: 2rem;
                }
                .form-footer a {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--primary);
                }
                .login-submit {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-size: 1rem;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }
                .login-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
                }
                .login-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .login-signup {
                    margin-top: 2.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .login-signup a {
                    color: var(--primary);
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default Login;
