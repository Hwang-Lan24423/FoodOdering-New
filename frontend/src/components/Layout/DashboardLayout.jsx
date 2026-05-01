import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const DashboardLayout = ({ children }) => {
    const role = localStorage.getItem('user_role');
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);
    const [ticketCount, setTicketCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleSysNotif = (e) => {
            setNotifications(prev => [e.detail, ...prev]);
        };
        window.addEventListener('system-notification', handleSysNotif);
        
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener('system-notification', handleSysNotif);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Chỉ chạy cho Staff/Admin
        if (!['2', '3'].includes(role)) return;

        const fetchCounts = async () => {
            try {
                // Fetch Order Count
                const orderRes = await api.get('/orders/pending-count');
                setPendingCount(orderRes.data.count || 0);

                // Fetch Ticket Count (Only for Admin)
                if (role === '3') {
                    const ticketRes = await api.get('/tickets/pending-count');
                    setTicketCount(ticketRes.data.count || 0);
                }
            } catch (error) {
                console.error("Lỗi lấy số lượng thông báo:", error);
            }
        };

        // Lấy lần đầu tiên
        fetchCounts();

        // Cập nhật mỗi 15 giây
        const interval = setInterval(fetchCounts, 15000);
        
        return () => clearInterval(interval);
    }, [role]);

    return (
        <div className="dashboard-layout">
            <Sidebar pendingCount={pendingCount} ticketCount={ticketCount} />
            
            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="topbar-brand">
                        <h2>Bake n Take System </h2>
                    </div>
                    
                    <div className="topbar-actions">
                        <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative' }}>
                            <button 
                                className="topbar-btn" 
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (showNotifications) setNotifications([]); // Clear on close
                                }}
                            >
                                <Bell size={20} />
                                {(pendingCount + ticketCount + notifications.length > 0) && (
                                    <span className="btn-badge">
                                        {(pendingCount + ticketCount + notifications.length) > 99 ? '99+' : (pendingCount + ticketCount + notifications.length)}
                                    </span>
                                )}
                            </button>
                            
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="dropdown-header">
                                        <h4>Thông báo</h4>
                                        <span className="clear-btn" onClick={() => setNotifications([])}>Xóa tất cả</span>
                                    </div>
                                    <div className="dropdown-body">
                                        {pendingCount === 0 && ticketCount === 0 && notifications.length === 0 ? (
                                            <div className="no-notif">Chưa có thông báo mới</div>
                                        ) : (
                                            <>
                                                {pendingCount > 0 && (
                                                    <div className="notif-item clickable" onClick={() => navigate('/staff/orders')}>
                                                        <div className="notif-icon">📦</div>
                                                        <div className="notif-content">
                                                            <p>Bạn có <strong>{pendingCount}</strong> đơn hàng mới đang chờ xử lý.</p>
                                                            <span className="notif-time">Nhấn để xem ngay</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {ticketCount > 0 && (
                                                    <div className="notif-item clickable" onClick={() => navigate('/admin/tickets')}>
                                                        <div className="notif-icon">🎫</div>
                                                        <div className="notif-content">
                                                            <p>Có <strong>{ticketCount}</strong> yêu cầu hỗ trợ mới từ khách hàng.</p>
                                                            <span className="notif-time">Nhấn để xem ngay</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {notifications.map(notif => (
                                                    <div key={notif.id} className="notif-item">
                                                        <div className="notif-icon">🔔</div>
                                                        <div className="notif-content">
                                                            <p>{notif.message}</p>
                                                            <span className="notif-time">{notif.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="topbar-user" onClick={() => navigate('/profile')}>
                            <div className="user-avatar">
                                <User size={18} />
                            </div>
                            <div className="user-text">
                                <p>{role === '3' ? 'Admin User' : 'Staff Member'}</p>
                                <span>{role === '3' ? 'Quản trị viên' : 'Nhân viên'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
