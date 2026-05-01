import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Mail, Save, Loader2, Camera } from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        contact: '',
        address: '',
        gender: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
            setFormData({
                name: response.data.name || '',
                email: response.data.email || '',
                username: response.data.username || '',
                contact: response.data.contact || '',
                address: response.data.address || '',
                gender: response.data.gender || ''
            });
        } catch (err) {
            console.error('Lỗi khi tải thông tin hồ sơ:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/user/profile', formData);
            setUser(response.data.user);
            localStorage.setItem('user_name', response.data.user.name);
            alert('Cập nhật hồ sơ thành công!');
            window.location.reload(); // Refresh to update navbar
        } catch (err) {
            alert('Cập nhật thất bại. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Loại bỏ early return của loading để tránh phá vỡ CSS và layout

    return (
        <div className="profile-page">
            {loading ? (
                <div className="loading-screen">
                    <Loader2 className="spin" size={48} />
                    <p>Đang tải thông tin hồ sơ...</p>
                </div>
            ) : (
            <div className="profile-container">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="profile-sidebar"
                >
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=128`} 
                                alt={user?.name} 
                            />
                            <button className="change-avatar">
                                <Camera size={20} />
                            </button>
                        </div>
                        <h2>{user?.name}</h2>
                        <p className="role-badge">
                            {user?.role === 3 ? 'Quản trị viên' : user?.role === 2 ? 'Nhân viên' : 'Khách hàng'}
                        </p>
                    </div>

                    <div className="profile-info-brief">
                        <div className="info-item">
                            <Mail size={18} />
                            <span>{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <User size={18} />
                            <span>@{user?.username}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="profile-content glass-card"
                >
                    <div className="content-header">
                        <h1>Cài đặt hồ sơ</h1>
                        <p>Quản lý thông tin cá nhân của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label><User size={18} /> Họ và tên</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Mail size={18} /> Email</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><User size={18} /> Tên người dùng (Username)</label>
                                <input 
                                    type="text" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Phone size={18} /> Số điện thoại</label>
                                <input 
                                    type="text" 
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                    placeholder="Ví dụ: 0912345678"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label><MapPin size={18} /> Địa chỉ giao hàng</label>
                                <textarea 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    placeholder="Số nhà, tên đường, phường/xã..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label><User size={18} /> Giới tính</label>
                                <select 
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? <Loader2 className="spin" /> : (
                                    <>
                                        <Save size={20} />
                                        <span>Lưu thay đổi</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
            )}

            <style jsx>{`
                .profile-page {
                    min-height: calc(100vh - 80px);
                    padding: 3rem 2rem;
                    background: var(--bg-main);
                }
                .profile-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 2.5rem;
                }
                
                .profile-sidebar {
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-md);
                    text-align: center;
                    height: fit-content;
                }
                
                .avatar-wrapper {
                    position: relative;
                    width: 128px;
                    height: 128px;
                    margin: 0 auto 1.5rem;
                }
                .avatar-wrapper img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid var(--primary-light);
                }
                .change-avatar {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: var(--primary);
                    color: white;
                    padding: 0.6rem;
                    border-radius: 50%;
                    box-shadow: var(--shadow-md);
                    transition: var(--transition);
                }
                .change-avatar:hover { transform: scale(1.1); }
                
                .profile-sidebar h2 { margin-bottom: 0.5rem; font-size: 1.5rem; color: var(--bg-dark); }
                .role-badge {
                    display: inline-block;
                    padding: 0.3rem 1rem;
                    background: var(--primary-light);
                    color: var(--primary);
                    border-radius: 2rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 2rem;
                }
                
                .profile-info-brief {
                    text-align: left;
                    border-top: 1px solid var(--border);
                    padding-top: 2rem;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 1rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                
                .profile-content {
                    padding: 3rem;
                }
                .content-header { margin-bottom: 3rem; }
                .content-header h1 { font-size: 2rem; color: var(--bg-dark); margin-bottom: 0.5rem; }
                .content-header p { color: var(--text-muted); }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .full-width { grid-column: span 2; }
                
                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-bottom: 0.6rem;
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.9rem;
                }
                .form-group input, .form-group textarea, .form-group select {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    font-family: inherit;
                    font-size: 1rem;
                    transition: var(--transition);
                }
                .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px var(--primary-light);
                    outline: none;
                }
                
                .form-actions { margin-top: 3rem; text-align: right; }
                .save-btn {
                    background: var(--primary);
                    color: white;
                    padding: 1rem 2.5rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.8rem;
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
                }
                .save-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.4); }
                
                .loading-screen {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-muted);
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 768px) {
                    .profile-container { grid-template-columns: 1fr; }
                    .form-grid { grid-template-columns: 1fr; }
                    .full-width { grid-column: span 1; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
