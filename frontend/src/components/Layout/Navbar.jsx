import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Utensils, Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const { cartCount, clearCart } = useCart();
    const navigate = useNavigate();
    const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('user_role');

    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [showNotifications, setShowNotifications] = React.useState(false);

    React.useEffect(() => {
        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (err) {
            console.error('Lỗi tải thông báo:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Lỗi đánh dấu đã đọc:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Lỗi đánh dấu tất cả đã đọc:', err);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) return;
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('Lỗi xóa tất cả thông báo:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        clearCart();
        navigate('/login');
    };


    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="logo">
                    <Utensils className="logo-icon" />
                    <span>Bake<span className="text-primary">n</span>Take</span>
                </Link>

                <div className="nav-links">
                    <Link to="/menu" className="nav-link">Thực đơn</Link>
                    <Link to="/orders" className="nav-link">Lịch sử</Link>
                    <Link to="/support" className="nav-link">Hỗ trợ</Link>
                    {(userRole === '2' || userRole === '3') && (
                        <Link to="/staff/dashboard" className="nav-link" style={{ color: 'var(--primary)' }}>Quản lý</Link>
                    )}
                </div>

                <div className="nav-actions">
                    <Link to="/cart" className="cart-btn">
                        <ShoppingCart size={20} />
                        <span className="cart-badge">{cartCount}</span>
                    </Link>

                    {token && (
                        <div className="notification-wrapper">
                            <button 
                                className="notification-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="notification-dropdown glass-card"
                                    >
                                        <div className="notification-header">
                                            <h3>Thông báo</h3>
                                            <div className="notification-header-actions">
                                                {notifications.length > 0 && (
                                                    <>
                                                        <button 
                                                            className="action-btn" 
                                                            onClick={handleMarkAllAsRead}
                                                            title="Đọc tất cả"
                                                        >
                                                            <CheckCheck size={16} />
                                                        </button>
                                                        <button 
                                                            className="action-btn delete" 
                                                            onClick={handleDeleteAll}
                                                            title="Xóa tất cả"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <div className="no-notifications">
                                                    <div className="bell-icon-wrapper">
                                                        <Bell size={32} />
                                                    </div>
                                                    <p>Bạn không có thông báo mới nào</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div 
                                                        key={n.id} 
                                                        className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                                                        onClick={() => {
                                                            if (!n.is_read) markAsRead(n.id);
                                                            if (n.link) navigate(n.link);
                                                            setShowNotifications(false);
                                                        }}
                                                    >
                                                        <div className="notification-dot"></div>
                                                        <div className="notification-content">
                                                            <strong>{n.title}</strong>
                                                            <p>{n.message}</p>
                                                            <span>{new Date(n.created_at).toLocaleString('vi-VN')}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    
                    {token ? (
                        <div className="user-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/profile" className="nav-link">
                                <User size={20} />
                            </Link>
                            <button onClick={handleLogout} className="logout-btn">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">
                            <User size={20} />
                            <span>Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
