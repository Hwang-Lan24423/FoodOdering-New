import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Mail, Save, Loader2, Camera, Star, Award, History, TrendingUp, ChevronRight } from 'lucide-react';
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
    const [loyalty, setLoyalty] = useState(null);
    const [loyaltyHistory, setLoyaltyHistory] = useState([]);

    useEffect(() => {
        const init = async () => {
            const userData = await fetchProfile();
            if (userData && userData.role === 1) {
                fetchLoyalty();
            }
        };
        init();
    }, []);

    const fetchLoyalty = async () => {
        try {
            const [statusRes, historyRes] = await Promise.all([
                api.get('/loyalty/status'),
                api.get('/loyalty/history')
            ]);
            setLoyalty(statusRes.data);
            setLoyaltyHistory(historyRes.data.data);
        } catch (err) {
            console.error('Lỗi khi tải thông tin loyalty:', err);
        }
    };

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
            return response.data;
        } catch (err) {
            console.error('Lỗi khi tải thông tin hồ sơ:', err);
            return null;
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

                        {/* Membership Card - Only for Customers */}
                        {user?.role === 1 && loyalty && (
                            <div className={`loyalty-card-mini tier-${loyalty.loyalty_level}`}>
                                <div className="card-pattern"></div>
                                <div className="card-content">
                                    <div className="card-header">
                                        <Star className="star-icon" size={20} fill="currentColor" />
                                        <span className="tier-name">{loyalty.loyalty_level.toUpperCase()} MEMBER</span>
                                    </div>
                                    <div className="card-points">
                                        <h3>{loyalty.points.toLocaleString()}</h3>
                                        <p>Điểm khả dụng</p>
                                    </div>
                                    {loyalty.next_level && (
                                        <div className="card-progress">
                                            <div className="progress-info">
                                                <span>Tiến trình lên {loyalty.next_level.name}</span>
                                                <span>{Math.round(loyalty.next_level.progress)}%</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div 
                                                    className="progress-bar-fill" 
                                                    style={{ width: `${loyalty.next_level.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="needed-points">Cần thêm {loyalty.next_level.points_needed} điểm</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="profile-info-brief">
                        <div className="info-item">
                            <Mail size={18} className="info-icon" />
                            <span title={user?.email}>{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <User size={18} className="info-icon" />
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

                {/* Loyalty History Section - Only for Customers */}
                {user?.role === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="loyalty-history-section glass-card full-width-mobile"
                    >
                        <div className="section-header">
                            <div className="header-title-flex">
                                <History size={24} className="text-primary" />
                                <h2>Lịch sử điểm thưởng</h2>
                            </div>
                            <p>Theo dõi các lần tích lũy và sử dụng điểm của bạn</p>
                        </div>

                        <div className="history-list">
                            {loyaltyHistory.length === 0 ? (
                                <div className="no-history">
                                    <Award size={48} className="text-muted" />
                                    <p>Bạn chưa có giao dịch điểm nào.</p>
                                    <span>Mua hàng ngay để bắt đầu tích điểm!</span>
                                </div>
                            ) : (
                                loyaltyHistory.map((item) => (
                                    <div key={item.id} className="history-item">
                                        <div className={`item-icon ${item.points > 0 ? 'icon-earn' : 'icon-redeem'}`}>
                                            {item.points > 0 ? <TrendingUp size={18} /> : <Star size={18} />}
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.description}</h4>
                                            <span className="item-date">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className={`item-points ${item.points > 0 ? 'text-success' : 'text-danger'}`}>
                                            {item.points > 0 ? '+' : ''}{item.points.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
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
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
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
                    margin-bottom: 0.5rem;
                }

                /* Loyalty Card CSS */
                .loyalty-card-mini {
                    position: relative;
                    width: 100%;
                    padding: 1.5rem;
                    border-radius: 1.2rem;
                    text-align: left;
                    color: white;
                    overflow: hidden;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
                    transition: transform 0.3s ease;
                }
                .loyalty-card-mini:hover { transform: translateY(-5px); }
                .card-pattern {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0);
                    background-size: 16px 16px;
                    opacity: 0.4;
                }
                .card-content { position: relative; z-index: 1; }
                
                .tier-bronze { background: linear-gradient(135deg, #a87932 0%, #d4a76a 100%); }
                .tier-silver { background: linear-gradient(135deg, #717171 0%, #c0c0c0 100%); }
                .tier-gold { background: linear-gradient(135deg, #b8860b 0%, #ffd700 100%); color: #4a3b00; }
                .tier-gold .star-icon { color: #4a3b00; }
                .tier-gold .progress-bar-bg { background: rgba(0,0,0,0.1); }
                .tier-gold .progress-bar-fill { background: #4a3b00; }
                .tier-gold .needed-points, .tier-gold .progress-info { color: rgba(74, 59, 0, 0.8); }

                .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
                .tier-name { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; }
                .card-points h3 { font-size: 2.2rem; font-weight: 800; line-height: 1; }
                .card-points p { font-size: 0.85rem; opacity: 0.9; font-weight: 500; }

                .card-progress { margin-top: 1.5rem; }
                .progress-info { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.4rem; opacity: 0.9; }
                .progress-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: white; border-radius: 10px; }
                .needed-points { font-size: 0.65rem; margin-top: 0.4rem; opacity: 0.8; font-style: italic; }

                /* Loyalty History CSS */
                .loyalty-history-section {
                    grid-column: span 2;
                    padding: 2.5rem;
                    margin-top: 1rem;
                }
                .header-title-flex { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.3rem; }
                .header-title-flex h2 { font-size: 1.5rem; color: var(--bg-dark); }
                .section-header { margin-bottom: 2rem; }
                .history-list { display: flex; flex-direction: column; gap: 1rem; }
                .history-item {
                    display: flex;
                    align-items: center;
                    padding: 1.2rem;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    transition: var(--transition);
                }
                .history-item:hover { background: white; transform: translateX(5px); border-color: var(--primary-light); }
                .item-icon {
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    margin-right: 1.2rem;
                }
                .icon-earn { background: #ecfdf5; color: #10b981; }
                .icon-redeem { background: #eff6ff; color: #3b82f6; }
                .item-details h4 { font-size: 0.95rem; margin-bottom: 0.2rem; color: var(--text-main); }
                .item-date { font-size: 0.8rem; color: var(--text-muted); }
                .item-points { margin-left: auto; font-weight: 700; font-size: 1.1rem; }
                
                .no-history {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-muted);
                }
                .no-history p { font-size: 1.1rem; margin-top: 1rem; color: var(--text-main); font-weight: 600; }
                .no-history span { font-size: 0.9rem; }
                
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
                    width: 100%;
                }
                .info-item span {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .info-icon {
                    color: var(--primary);
                    flex-shrink: 0;
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
