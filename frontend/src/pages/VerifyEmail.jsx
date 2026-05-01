import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const VerifyEmail = () => {
    const { id, hash } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Đang xác thực email của bạn...');

    useEffect(() => {
        const verify = async () => {
            try {
                const expires = searchParams.get('expires');
                const signature = searchParams.get('signature');
                
                const response = await api.get(`/email/verify/${id}/${hash}`, {
                    params: { expires, signature }
                });
                
                setStatus('success');
                setMessage(response.data.message || 'Xác thực email thành công!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Xác thực thất bại hoặc liên kết đã hết hạn.');
            }
        };

        verify();
    }, [id, hash, searchParams]);

    return (
        <div className="verify-page">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="verify-card"
            >
                <div className="verify-content">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="verify-icon spin" size={64} />
                            <h1>Đang xác thực</h1>
                            <p>{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="verify-icon success">
                                <CheckCircle size={64} />
                            </div>
                            <h1>Thành công!</h1>
                            <p>{message}</p>
                            <button className="auth-btn" onClick={() => navigate('/login')}>
                                Đăng nhập ngay <ArrowRight size={20} />
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="verify-icon error">
                                <XCircle size={64} />
                            </div>
                            <h1>Thất bại</h1>
                            <p>{message}</p>
                            <button className="auth-btn secondary" onClick={() => navigate('/register')}>
                                Thử đăng ký lại
                            </button>
                        </>
                    )}
                </div>
            </motion.div>

            <style jsx>{`
                .verify-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-main);
                    padding: 2rem;
                }
                .verify-card {
                    background: white;
                    padding: 4rem 3rem;
                    border-radius: var(--radius-xl);
                    width: 100%;
                    max-width: 500px;
                    box-shadow: var(--shadow-xl);
                    text-align: center;
                }
                .verify-icon {
                    margin: 0 auto 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .verify-icon.spin { color: var(--primary); animation: spin 1s linear infinite; }
                .verify-icon.success { color: #10b981; }
                .verify-icon.error { color: #ef4444; }

                h1 { font-size: 2rem; margin-bottom: 1rem; color: var(--bg-dark); }
                p { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2.5rem; line-height: 1.6; }

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
                    transition: var(--transition);
                }
                .auth-btn:hover { transform: translateY(-2px); opacity: 0.9; }
                .auth-btn.secondary { background: var(--text-muted); }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
