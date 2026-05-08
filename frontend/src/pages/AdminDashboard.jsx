import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, 
    Users, 
    MessageSquare, 
    ArrowRight,
    CheckCircle2,
    Clock,
    TrendingUp,
    Loader2,
    Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const response = await api.get('/dashboard/overview');
                setOverview(response.data);
            } catch (error) {
                console.error("Error fetching dashboard overview:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getChartData = () => {
        if (!overview?.chart_data) return null;
        return {
            labels: overview.chart_data.map(d => d.name),
            datasets: [
                {
                    label: 'Doanh thu',
                    data: overview.chart_data.map(d => d.revenue),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 8,
                    hoverBackgroundColor: '#6366f1',
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `Doanh thu: ${formatCurrency(context.raw)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { strokeDasharray: [5, 5], color: '#f1f5f9' },
                ticks: { 
                    callback: (value) => value >= 1000000 ? (value/1000000) + 'M' : (value/1000) + 'k',
                    font: { size: 11 }
                }
            },
            x: { 
                grid: { display: false },
                ticks: { font: { size: 11 } }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Bảng điều khiển</h1>
                    <p>Chào ngày mới, Admin! Đây là những gì đang diễn ra hôm nay.</p>
                </div>
                <div className="header-date">
                    <Calendar size={18} />
                    <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Welcome Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="welcome-card glass-card"
                    style={{ 
                        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                        color: 'white',
                        padding: '2rem',
                        marginBottom: '2rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div className="welcome-text" style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Chào mừng trở lại, Quản trị viên!</h2>
                        <p style={{ opacity: 0.9, maxWidth: '600px' }}>
                            Hệ thống Bake n Take đang hoạt động ổn định. Bạn có {overview?.orders?.value || 0} đơn hàng mới trong 7 ngày qua.
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <Link to="/admin/orders" className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)', border: 'none' }}>
                                Xem đơn hàng <ArrowRight size={18} />
                            </Link>
                            <Link to="/admin/analytics" className="btn-outline">
                                <TrendingUp size={18} /> Xem thống kê
                            </Link>
                        </div>
                    </div>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
                        <TrendingUp size={200} />
                    </div>
                </motion.div>

                {/* Grid Layout Stats */}
                <div className="dashboard-grid-three">
                    <div className="glass-card stat-mini">
                        <div className="icon-box bg-primary-light"><ShoppingBag className="text-primary" /></div>
                        <div className="stat-info">
                            <span>Doanh thu tuần</span>
                            <h3>{formatCurrency(overview?.revenue?.value || 0)}</h3>
                        </div>
                    </div>
                    <div className="glass-card stat-mini">
                        <div className="icon-box bg-secondary-light"><Users className="text-secondary" /></div>
                        <div className="stat-info">
                            <span>Khách hàng mới</span>
                            <h3>+{overview?.customers?.value || 0}</h3>
                        </div>
                    </div>
                    <div className="glass-card stat-mini">
                        <div className="icon-box bg-info-light"><MessageSquare className="text-info" /></div>
                        <div className="stat-info">
                            <span>Yêu cầu hỗ trợ</span>
                            <h3>{overview?.tickets?.value || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart 7 Days */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                    style={{ padding: '1.5rem', marginBottom: '2rem' }}
                >
                    <div className="card-header">
                        <h3><TrendingUp size={20} className="text-primary" /> Doanh thu 7 ngày gần nhất</h3>
                    </div>
                    <div style={{ height: '300px', marginTop: '1rem' }}>
                        {overview && <Bar data={getChartData()} options={chartOptions} />}
                    </div>
                </motion.div>

                <div className="dashboard-grid-two mt-6">
                    {/* Recent Activities */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="card-header">
                            <h3><Clock size={20} className="text-primary" /> Hoạt động gần đây</h3>
                            <Link to="/admin/analytics">Xem tất cả</Link>
                        </div>
                        <div className="activity-list">
                            {overview?.recent_activities?.map((activity) => (
                                <div className="activity-item" key={activity.id}>
                                    <div className={`activity-dot ${activity.dot}`}></div>
                                    <div className="activity-text">
                                        <p dangerouslySetInnerHTML={{ __html: activity.content }}></p>
                                        <span>{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div className="card-header">
                            <h3><TrendingUp size={20} className="text-primary" /> Lối tắt quản lý</h3>
                        </div>
                        <div className="quick-access-grid">
                            <Link to="/admin/staffs" className="access-item">
                                <Users size={24} />
                                <span>Nhân viên</span>
                            </Link>
                            <Link to="/admin/customers" className="access-item">
                                <Users size={24} />
                                <span>Khách hàng</span>
                            </Link>
                            <Link to="/admin/inventory" className="access-item">
                                <Clock size={24} />
                                <span>Kho hàng</span>
                            </Link>
                            <Link to="/admin/tickets" className="access-item">
                                <MessageSquare size={24} />
                                <span>Hỗ trợ</span>
                            </Link>
                        </div>
                        <div className="system-status mt-6 p-4 bg-gray-50 rounded-xl">
                            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>TRẠNG THÁI HỆ THỐNG</h4>
                            <div className="status-row">
                                <div className="status-label">
                                    <CheckCircle2 size={16} className="text-success" /> Server API
                                </div>
                                <span className="badge-success">Ổn định</span>
                            </div>
                            <div className="status-row mt-3">
                                <div className="status-label">
                                    <CheckCircle2 size={16} className="text-success" /> SePay Webhook
                                </div>
                                <span className="badge-success">Sẵn sàng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
