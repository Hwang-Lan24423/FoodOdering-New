import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    Users, 
    ShoppingBag, 
    DollarSign, 
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard/overview');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Tổng quan Quản trị</h1>
                    <p>Chào mừng trở lại! Đây là hiệu suất kinh doanh của Bake n Take.</p>
                </div>

            </header>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                </div>
            ) : !stats ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p style={{ color: 'var(--text-muted)' }}>Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.</p>
                </div>
            ) : (
                <>
                    <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-header">
                        <div className="stat-icon bg-primary-light">
                            <DollarSign className="text-primary" size={24} />
                        </div>
                        <span className={`stat-trend ${stats?.revenue?.isUp ? 'trend-up' : 'trend-down'}`}>
                            {stats?.revenue?.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {stats?.revenue?.change}%
                        </span>
                    </div>
                    <div className="stat-body">
                        <h3>Doanh thu</h3>
                        <p>{formatCurrency(stats?.revenue?.value || 0)}</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-header">
                        <div className="stat-icon bg-secondary-light">
                            <ShoppingBag className="text-secondary" size={24} />
                        </div>
                        <span className={`stat-trend ${stats?.orders?.isUp ? 'trend-up' : 'trend-down'}`}>
                            {stats?.orders?.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {stats?.orders?.change}%
                        </span>
                    </div>
                    <div className="stat-body">
                        <h3>Đơn hàng</h3>
                        <p>{stats?.orders?.value || 0}</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-header">
                        <div className="stat-icon bg-info-light">
                            <Users className="text-info" size={24} />
                        </div>
                        <span className={`stat-trend ${stats?.customers?.isUp ? 'trend-up' : 'trend-down'}`}>
                            {stats?.customers?.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {stats?.customers?.change}%
                        </span>
                    </div>
                    <div className="stat-body">
                        <h3>Khách hàng mới</h3>
                        <p>{stats?.customers?.value || 0}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid-two">
                <div className="charts-area glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Biểu đồ Doanh thu (7 ngày qua)</h3>
                    </div>
                    <div className="chart-container" style={{ height: '300px', width: '100%', flex: 1 }}>
                        {stats?.chart_data?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="var(--primary)" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu biểu đồ</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="recent-activity glass-card">
                    <div className="card-header">
                        <h3>Hoạt động gần đây</h3>
                    </div>
                    <div className="activity-list">
                        {stats?.recent_activities?.length > 0 ? (
                            stats.recent_activities.map((activity) => (
                                <div className="activity-item" key={activity.id}>
                                    <div className={`activity-dot ${activity.dot}`}></div>
                                    <div className="activity-text">
                                        <p dangerouslySetInnerHTML={{ __html: activity.content }}></p>
                                        <span>{activity.time}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="activity-item">
                                <div className="activity-text">
                                    <p>Chưa có hoạt động nào</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
