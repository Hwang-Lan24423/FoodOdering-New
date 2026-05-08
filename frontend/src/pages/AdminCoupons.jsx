import React, { useState, useEffect } from 'react';
import { 
    Ticket, 
    Plus, 
    Search, 
    Loader2, 
    Calendar, 
    Tag, 
    Trash2, 
    Edit, 
    CheckCircle2, 
    XCircle, 
    AlertCircle,
    Info
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'fixed',
        value: '',
        min_order_value: 0,
        usage_limit: '',
        expiry_date: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await api.get('/coupons');
            setCoupons(response.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách mã giảm giá:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                min_order_value: coupon.min_order_value,
                usage_limit: coupon.usage_limit || '',
                expiry_date: coupon.expiry_date.split('T')[0],
                is_active: coupon.is_active
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                code: '',
                type: 'fixed',
                value: '',
                min_order_value: 0,
                usage_limit: '',
                expiry_date: '',
                is_active: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingCoupon) {
                await api.put(`/coupons/${editingCoupon.id}`, formData);
            } else {
                await api.post('/coupons', formData);
            }
            fetchCoupons();
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
        try {
            await api.delete(`/coupons/${id}`);
            setCoupons(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert("Lỗi khi xóa mã!");
        }
    };

    const toggleStatus = async (coupon) => {
        try {
            await api.put(`/coupons/${coupon.id}`, { is_active: !coupon.is_active });
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái!");
        }
    };

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Quản lý mã giảm giá</h1>
                    <p>Tạo và quản lý các chương trình khuyến mãi của bạn.</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Thêm mã mới
                </button>
            </header>

            <div className="dashboard-content">
                <div className="glass-card mb-6" style={{ padding: '1rem' }}>
                    <div className="search-box">
                        <Search size={20} className="text-muted" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm mã (VD: GIAM20K)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="spin text-primary" size={48} />
                    </div>
                ) : (
                    <div className="glass-card overflow-hidden">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Mã giảm giá</th>
                                    <th>Loại</th>
                                    <th>Giá trị</th>
                                    <th>Đơn tối thiểu</th>
                                    <th>Lượt dùng</th>
                                    <th>Hết hạn</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id}>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="icon-box bg-primary-light" style={{ width: '32px', height: '32px' }}>
                                                    <Ticket size={16} className="text-primary" />
                                                </div>
                                                <strong style={{ letterSpacing: '1px' }}>{coupon.code}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge-${coupon.type === 'fixed' ? 'info' : 'secondary'}`}>
                                                {coupon.type === 'fixed' ? 'Giảm tiền' : 'Giảm %'}
                                            </span>
                                        </td>
                                        <td>
                                            <strong className="text-primary">
                                                {coupon.type === 'fixed' ? formatCurrency(coupon.value) : `${coupon.value}%`}
                                            </strong>
                                        </td>
                                        <td>{formatCurrency(coupon.min_order_value)}</td>
                                        <td>
                                            <div className="usage-info">
                                                <span>{coupon.used_count} / {coupon.usage_limit || '∞'}</span>
                                                <div className="usage-bar">
                                                    <div 
                                                        className="usage-progress" 
                                                        style={{ 
                                                            width: coupon.usage_limit ? `${(coupon.used_count / coupon.usage_limit) * 100}%` : '0%' 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
                                                <Calendar size={14} />
                                                {(() => {
                                                    const date = new Date(coupon.expiry_date);
                                                    const d = String(date.getDate()).padStart(2, '0');
                                                    const m = String(date.getMonth() + 1).padStart(2, '0');
                                                    const y = date.getFullYear();
                                                    return `${d}/${m}/${y}`;
                                                })()}
                                            </div>
                                        </td>
                                        <td>
                                            {(() => {
                                                const isExhausted = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => !isExhausted && toggleStatus(coupon)}
                                                            className={`switch-container ${coupon.is_active ? 'active' : ''} ${isExhausted ? 'disabled' : ''}`}
                                                            title={isExhausted ? 'Mã đã hết lượt dùng' : (coupon.is_active ? 'Nhấn để tắt' : 'Nhấn để bật')}
                                                            style={{ cursor: isExhausted ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            <div className="switch-handle"></div>
                                                        </button>
                                                        <span className={`status-label ${coupon.is_active ? 'active' : ''} ${isExhausted ? 'exhausted' : ''}`}>
                                                            {isExhausted ? 'Hết lượt' : (coupon.is_active ? 'Đang bật' : 'Đang tắt')}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', width: '120px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button className="action-btn-edit" title="Chỉnh sửa" onClick={() => handleOpenModal(coupon)}>
                                                    <Edit size={18} />
                                                </button>
                                                <button className="action-btn-delete" title="Xóa mã" onClick={() => handleDelete(coupon.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCoupons.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-muted">
                                            Không tìm thấy mã giảm giá nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content glass-card"
                            style={{ maxWidth: '500px', width: '100%' }}
                        >
                            <div className="modal-header">
                                <h3>{editingCoupon ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-muted"><XCircle /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body p-6">
                                <div className="form-group mb-4">
                                    <label><Tag size={16} /> Mã giảm giá (Viết liền, không dấu)</label>
                                    <input 
                                        type="text" 
                                        placeholder="VD: GIAM20K" 
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        required
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label>Loại giảm giá</label>
                                        <select 
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            className="w-full p-3 border rounded-xl"
                                        >
                                            <option value="fixed">Giảm tiền mặt (đ)</option>
                                            <option value="percent">Giảm phần trăm (%)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Giá trị giảm</label>
                                        <input 
                                            type="number" 
                                            value={formData.value}
                                            onChange={(e) => setFormData({...formData, value: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="form-group">
                                        <label>Đơn tối thiểu</label>
                                        <input 
                                            type="number" 
                                            value={formData.min_order_value}
                                            onChange={(e) => setFormData({...formData, min_order_value: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Giới hạn lượt dùng</label>
                                        <input 
                                            type="number" 
                                            placeholder="Để trống = vô hạn"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="form-group mb-6">
                                    <label><Calendar size={16} /> Ngày hết hạn</label>
                                    <div className="custom-date-input">
                                        <input 
                                            type="date" 
                                            value={formData.expiry_date}
                                            data-date={formData.expiry_date ? (() => {
                                                const [y, m, d] = formData.expiry_date.split('-');
                                                return `${d}/${m}/${y}`;
                                            })() : 'dd/mm/yyyy'}
                                            onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-submit w-full"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="spin" /> : (editingCoupon ? 'Cập nhật ngay' : 'Tạo mã ngay')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .switch-container {
                    width: 48px;
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 50px;
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    border: 2px solid transparent;
                    padding: 0;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }
                .switch-container.active {
                    background: #10b981;
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
                }
                .switch-handle {
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 1px;
                    left: 2px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                .switch-container.active .switch-handle {
                    left: calc(100% - 22px);
                    box-shadow: -2px 2px 5px rgba(0,0,0,0.1);
                }
                .switch-container:active .switch-handle {
                    width: 24px;
                }
                .switch-container:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                .status-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #94a3b8;
                    min-width: 65px;
                    transition: all 0.3s ease;
                }
                .status-label.active {
                    color: #10b981;
                }
                .status-label.exhausted {
                    color: #ef4444;
                }
                .switch-container.disabled {
                    background: #f1f5f9;
                    opacity: 0.5;
                }
                .usage-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    width: 100px;
                }
                .usage-bar {
                    height: 6px;
                    background: #f1f5f9;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .usage-progress {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 10px;
                }
                .custom-date-input {
                    position: relative;
                    width: 100%;
                }
                .custom-date-input input {
                    color: transparent !important;
                    position: relative;
                }
                .custom-date-input input::before {
                    content: attr(data-date);
                    position: absolute;
                    top: 50%;
                    left: 1rem;
                    transform: translateY(-50%);
                    color: var(--text-main);
                    font-family: inherit;
                    pointer-events: none;
                }
                .custom-date-input input:invalid::before {
                    color: #94a3b8;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 3000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                }
                .modal-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .action-btn-edit, .action-btn-delete {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    cursor: pointer;
                }
                .action-btn-edit { 
                    color: var(--primary); 
                    background: var(--primary-light); 
                }
                .action-btn-edit:hover {
                    background: var(--primary);
                    color: white;
                    transform: scale(1.1);
                }
                .action-btn-delete { 
                    color: #ef4444; 
                    background: #fee2e2; 
                }
                .action-btn-delete:hover {
                    background: #ef4444;
                    color: white;
                    transform: scale(1.1);
                }
            `}} />
        </div>
    );
};

export default AdminCoupons;
