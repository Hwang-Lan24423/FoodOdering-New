import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, 
    Clock, 
    CheckCircle2, 
    ChefHat, 
    TrendingUp,
    Calendar,
    Activity
} from 'lucide-react';
import api from '../api/axios';

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        pending: 0,
        preparing: 0,
        completed: 0,
        todayOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            const response = await api.get('/orders');
            const orders = response.data;
            const today = new Date().toISOString().split('T')[0];
            
            const todayOrders = orders.filter(o => o.created_at.startsWith(today));
            
            setStats({
                pending: orders.filter(o => o.status === 'Pending').length,
                preparing: orders.filter(o => o.status === 'Preparing').length,
                completed: todayOrders.filter(o => o.status === 'Completed').length,
                todayOrders: todayOrders.length
            });
        } catch (error) {
            console.error('Error fetching overview stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('vi-VN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const userName = localStorage.getItem('user_role') === '3' ? 'Quản trị viên' : 'Nhân viên';

    return (
        <div className="staff-overview">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Tổng quan hệ thống</h1>
                    <p>Chào mừng {userName} quay trở lại! Hôm nay là {currentDate}.</p>
                </div>
            </header>

            <div className="overview-grid">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="overview-card glass-card primary-gradient"
                >
                    <div className="card-icon"><ShoppingBag size={24} color="white" /></div>
                    <div className="card-content">
                        <h3>{stats.todayOrders}</h3>
                        <p>Đơn hàng hôm nay</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overview-card glass-card warning-gradient"
                >
                    <div className="card-icon"><Clock size={24} color="white" /></div>
                    <div className="card-content">
                        <h3>{stats.pending}</h3>
                        <p>Đang chờ xử lý</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="overview-card glass-card info-gradient"
                >
                    <div className="card-icon"><ChefHat size={24} color="white" /></div>
                    <div className="card-content">
                        <h3>{stats.preparing}</h3>
                        <p>Đang chế biến</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="overview-card glass-card success-gradient"
                >
                    <div className="card-icon"><CheckCircle2 size={24} color="white" /></div>
                    <div className="card-content">
                        <h3>{stats.completed}</h3>
                        <p>Hoàn thành (Hôm nay)</p>
                    </div>
                </motion.div>
            </div>

            <div className="overview-sections">
                <div className="glass-card welcome-banner">
                    <div className="banner-content">
                        <h2>Sẵn sàng phục vụ!</h2>
                        <p>Bạn hiện có <strong>{stats.pending}</strong> đơn hàng đang chờ phản hồi. Hãy kiểm tra mục Quản lý Vận hành để bắt đầu xử lý nhé.</p>
                        <a href="/staff/orders" className="btn-action btn-prepare" style={{ display: 'inline-flex', marginTop: '1rem' }}>
                            <Activity size={18} /> Đi tới Đơn hàng
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
