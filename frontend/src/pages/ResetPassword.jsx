import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || !email) {
            setError('Thiếu thông tin xác thực. Vui lòng kiểm tra lại liên kết trong email.');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await api.post('/reset-password', {
                ...formData,
                token,
                email
            });
            setMessage(response.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
            >
                <div className="auth-header">
                    <div className="auth-icon">
                        <RefreshCw size={32} />
                    </div>
                    <h1>Đặt lại mật khẩu</h1>
                    <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
                </div>

                {message ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <p>{message}</p>
                        <p>Đang chuyển hướng về trang đăng nhập...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-alert">{error}</div>}
                        
                        <div className="form-group">
                            <label><Lock size={18} /> Mật khẩu mới</label>
                            <input 
                                type="password" 
                                required 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="form-group">
                            <label><Lock size={18} /> Xác nhận mật khẩu</label>
                            <input 
                                type="password" 
                                required 
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? <Loader2 className="spin" /> : (
                                <>Cập nhật mật khẩu <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>

            <style jsx>{`
                /* Tương tự như ForgotPassword */
                .auth-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-main);
                    padding: 2rem;
                }
                .auth-card {
                    background: white;
                    padding: 3rem;
                    border-radius: var(--radius-xl);
                    width: 100%;
                    max-width: 450px;
                    box-shadow: var(--shadow-lg);
                }
                .auth-header { text-align: center; margin-bottom: 2.5rem; }
                .auth-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--primary-light);
                    color: var(--primary);
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .auth-header h1 { font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--bg-dark); }
                .auth-header p { color: var(--text-muted); font-size: 0.95rem; }

                .form-group { margin-bottom: 1.5rem; }
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.6rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text-main);
                }
                .form-group input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    font-family: inherit;
                }
                .form-group input:focus { border-color: var(--primary); outline: none; }

                .auth-btn {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    margin-top: 2rem;
                }

                .error-alert {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 0.8rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .success-message { text-align: center; }
                .success-icon {
                    width: 50px;
                    height: 50px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    font-size: 1.5rem;
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ResetPassword;
