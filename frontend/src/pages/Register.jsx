import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/register', formData);
            setIsRegistered(true);
        } catch (err) {
            const message = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
            alert(message);
            console.error(err);
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
                        <UserPlus size={32} />
                    </div>
                    <h1>{isRegistered ? 'Kiểm tra Email' : 'Tạo tài khoản mới'}</h1>
                    <p>
                        {isRegistered 
                            ? 'Chúng tôi đã gửi một liên kết xác thực đến email của bạn. Vui lòng xác thực để tiếp tục.' 
                            : 'Khám phá thiên đường bánh ngọt ngay hôm nay'}
                    </p>
                </div>

                {isRegistered ? (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <p>Một email xác nhận đã được gửi tới <strong>{formData.email}</strong></p>
                        <button className="auth-btn" onClick={() => navigate('/login')}>
                            Quay lại Đăng nhập
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><User size={18} /> Tên đăng nhập</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="Ví dụ: hoanglan123"
                            />
                        </div>

                        <div className="form-group">
                            <label><User size={18} /> Họ và tên</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Nhập họ tên của bạn..."
                            />
                        </div>

                        <div className="form-group">
                            <label><Mail size={18} /> Email</label>
                            <input 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="yourname@gmail.com"
                            />
                        </div>

                        <div className="form-group">
                            <label><Lock size={18} /> Mật khẩu</label>
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
                                <>Tham gia ngay <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                )}

                {!isRegistered && (
                    <div className="auth-footer">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                )}
            </motion.div>

            <style jsx>{`
                .success-message {
                    text-align: center;
                    padding: 1rem 0;
                }
                .success-icon {
                    width: 60px;
                    height: 60px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    margin: 0 auto 1.5rem;
                }
                .success-message p {
                    margin-bottom: 2rem;
                    color: var(--text-main);
                    line-height: 1.6;
                }
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
                .auth-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
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
                    transition: var(--transition);
                }
                .form-group input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px var(--primary-light);
                    outline: none;
                }

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
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
                }
                .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.4); }
                .auth-footer { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted); }
                .auth-footer a { color: var(--primary); font-weight: 700; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Register;
