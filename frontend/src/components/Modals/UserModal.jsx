import React, { useState, useEffect } from 'react';
import { X, Loader2, Mail, User, Phone, MapPin, Key, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

const UserModal = ({ isOpen, onClose, user, type, onSuccess, readOnly = false }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        contact: '',
        address: '',
        gender: 'Khác',
        password: '',
        points: 0,
        role: type === 'staff' ? 2 : 1
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                name: user.name || '',
                email: user.email || '',
                contact: user.contact || '',
                address: user.address || '',
                gender: user.gender || 'Khác',
                password: '', // Không điền mật khẩu cũ
                points: user.points || 0,
                role: user.role
            });
        } else {
            setFormData({
                username: '',
                name: '',
                email: '',
                contact: '',
                address: '',
                gender: 'Khác',
                password: '',
                points: 0,
                role: type === 'staff' ? 2 : 1
            });
        }
    }, [user, type, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (user) {
                // Update
                await api.put(`/admin/users/${user.id}`, formData);
                alert("Cập nhật thông tin thành công!");
            } else {
                // Create
                await api.post('/admin/users', formData);
                alert(`Thêm ${type === 'staff' ? 'nhân viên' : 'khách hàng'} mới thành công!`);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi lưu người dùng:", error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div 
                    className="modal-content glass-card"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className="modal-header">
                        <h2>{readOnly ? `Chi tiết ${type === 'staff' ? 'Nhân viên' : 'Khách hàng'}` : user ? 'Cập nhật thông tin' : `Thêm ${type === 'staff' ? 'Nhân viên' : 'Khách hàng'} mới`}</h2>
                        <button className="close-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-body">
                        <div className="form-grid">
                            {!user && (
                                <div className="form-group">
                                    <label><User size={16}/> Tên đăng nhập</label>
                                    <input 
                                        type="text" 
                                        name="username" 
                                        value={formData.username} 
                                        onChange={handleChange} 
                                        placeholder="Nhập tên đăng nhập viết liền không dấu"
                                        required 
                                        disabled={!!user} // Không cho sửa username
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label><User size={16}/> Họ và tên</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="Nguyễn Văn A"
                                    required 
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="form-group">
                                <label><Mail size={16}/> Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="example@gmail.com"
                                    required 
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="form-group">
                                <label><Phone size={16}/> Số điện thoại</label>
                                <input 
                                    type="text" 
                                    name="contact" 
                                    value={formData.contact} 
                                    onChange={handleChange} 
                                    placeholder="0912345678"
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label><MapPin size={16}/> Địa chỉ</label>
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    placeholder="Nhập địa chỉ chi tiết"
                                    rows="2"
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="form-group">
                                <label>Giới tính</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} disabled={readOnly}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>

                            {!readOnly && (
                                <div className="form-group">
                                    <label><Key size={16}/> Mật khẩu {user && <span className="text-xs text-muted-foreground ml-1">(Bỏ trống nếu không đổi)</span>}</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        placeholder={user ? "Nhập mật khẩu mới..." : "Mật khẩu cho tài khoản"}
                                        required={!user}
                                        minLength={6}
                                    />
                                </div>
                            )}

                            {type === 'customer' && (
                                <div className="form-group">
                                    <label><Star size={16}/> Điểm tích lũy</label>
                                    <input 
                                        type="number" 
                                        name="points" 
                                        value={formData.points} 
                                        onChange={handleChange} 
                                        placeholder="0"
                                        min="0"
                                        disabled={readOnly}
                                    />
                                </div>
                            )}
                        </div>

                        {type === 'staff' && !user && !readOnly && (
                            <div className="warning-alert mt-4">
                                <p><strong>Lưu ý:</strong> Tài khoản này sẽ có quyền truy cập vào Đơn hàng, Quản lý Kho và Báo cáo của hệ thống.</p>
                            </div>
                        )}

                        <div className="modal-footer mt-6">
                            {readOnly ? (
                                <button type="button" className="btn-primary" onClick={onClose}>Đóng</button>
                            ) : (
                                <>
                                    <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? <Loader2 className="spin" size={18} /> : (user ? 'Cập nhật' : 'Thêm mới')}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 1rem;
                }
                .modal-content {
                    background: white;
                    border-radius: var(--radius-xl);
                    width: 100%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-lg);
                }
                .modal-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h2 {
                    font-size: 1.25rem;
                    color: var(--bg-dark);
                    margin: 0;
                }
                .close-btn {
                    background: #f1f5f9;
                    color: #64748b;
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                }
                .close-btn:hover { background: #fee2e2; color: #ef4444; }
                .modal-body { padding: 2rem; }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label {
                    display: flex; align-items: center; gap: 0.4rem;
                    font-size: 0.85rem; font-weight: 600; color: #475569;
                    margin-bottom: 0.5rem;
                }
                .form-group input, .form-group select, .form-group textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #cbd5e1;
                    border-radius: var(--radius-md);
                    font-family: inherit; font-size: 0.95rem;
                    transition: var(--transition);
                    background: #f8fafc;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    background: white;
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                .form-group input:disabled, .form-group select:disabled, .form-group textarea:disabled { 
                    opacity: 1; 
                    cursor: default; 
                    background: #f1f5f9;
                    color: #334155;
                    font-weight: 500;
                    border-color: transparent;
                }
                .warning-alert {
                    background: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    padding: 1rem;
                    border-radius: 0 0.5rem 0.5rem 0;
                    color: #92400e;
                    font-size: 0.9rem;
                }
                .modal-footer {
                    display: flex; justify-content: flex-end; gap: 1rem;
                    padding-top: 1.5rem; border-top: 1px solid var(--border);
                }
            `}</style>
        </AnimatePresence>
    );
};

export default UserModal;
