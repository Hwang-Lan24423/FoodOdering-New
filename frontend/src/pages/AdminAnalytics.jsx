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
    Calendar,
    BarChart3
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../api/axios';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const AdminAnalytics = () => {
    const [overview, setOverview] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [overviewRes, statsRes] = await Promise.all([
                    api.get('/dashboard/overview'),
                    api.get('/orders/dashboard-stats')
                ]);
                setOverview(overviewRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Prepare Revenue Chart Data
    const getRevenueChartData = () => {
        if (!stats) return null;

        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        
        // Helper to map DB dates to day index (0-6)
        const mapToDays = (data) => {
            const result = new Array(7).fill(0);
            data.forEach(item => {
                const dayIndex = (new Date(item.date).getDay() + 6) % 7; // Map Sun(0)-Sat(6) to Mon(0)-Sun(6)
                result[dayIndex] = parseFloat(item.total);
            });
            return result;
        };

        const thisWeek = mapToDays(stats.revenue.this_week);
        const lastWeek = mapToDays(stats.revenue.last_week);

        return {
            labels: days,
            datasets: [
                {
                    label: 'Tuần này',
                    data: thisWeek,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#6366f1'
                },
                {
                    label: 'Tuần trước',
                    data: lastWeek,
                    borderColor: '#94a3b8',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0
                }
            ]
        };
    };

    // Prepare Top Products Data
    const getTopProductsData = () => {
        if (!stats) return null;

        return {
            labels: stats.top_products.map(p => p.name),
            datasets: [
                {
                    data: stats.top_products.map(p => p.total_quantity),
                    backgroundColor: [
                        '#6366f1',
                        '#8b5cf6',
                        '#ec4899',
                        '#f59e0b',
                        '#10b981'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: '500' }
                }
            },
            tooltip: {
                padding: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                    label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { strokeDasharray: [5, 5], color: '#f1f5f9' },
                ticks: { 
                    callback: (value) => `${value / 1000}k`,
                    font: { size: 11 }
                }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            }
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Phân tích Thống kê</h1>
                    <p>Dữ liệu chuyên sâu về tình hình kinh doanh của bạn.</p>
                </div>
                <div className="header-date">
                    <Calendar size={18} />
                    <span>Tháng {new Date().getMonth() + 1}, {new Date().getFullYear()}</span>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                </div>
            ) : (
                <div className="dashboard-content">
                    {/* Stats Summary */}
                    <div className="stats-grid">
                        <div className="stat-card glass-card">
                            <div className="stat-header">
                                <div className="stat-icon bg-primary-light">
                                    <DollarSign className="text-primary" size={24} />
                                </div>
                                <span className={`stat-trend ${overview?.revenue?.isUp ? 'trend-up' : 'trend-down'}`}>
                                    {overview?.revenue?.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} 
                                    {overview?.revenue?.change}%
                                </span>
                            </div>
                            <div className="stat-body">
                                <h3>Doanh thu</h3>
                                <p>{formatCurrency(overview?.revenue?.value || 0)}</p>
                            </div>
                        </div>

                        <div className="stat-card glass-card">
                            <div className="stat-header">
                                <div className="stat-icon bg-secondary-light">
                                    <ShoppingBag className="text-secondary" size={24} />
                                </div>
                                <span className={`stat-trend ${overview?.orders?.isUp ? 'trend-up' : 'trend-down'}`}>
                                    {overview?.orders?.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} 
                                    {overview?.orders?.change}%
                                </span>
                            </div>
                            <div className="stat-body">
                                <h3>Đơn hàng</h3>
                                <p>{overview?.orders?.value || 0}</p>
                            </div>
                        </div>

                        <div className="stat-card glass-card">
                            <div className="stat-header">
                                <div className="stat-icon bg-info-light">
                                    <Users className="text-info" size={24} />
                                </div>
                                <span className={`stat-trend ${overview?.customers?.isUp ? 'trend-up' : 'trend-down'}`}>
                                    {overview?.customers?.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} 
                                    {overview?.customers?.change}%
                                </span>
                            </div>
                            <div className="stat-body">
                                <h3>Khách hàng mới</h3>
                                <p>{overview?.customers?.value || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="dashboard-grid-two">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="charts-area glass-card"
                        >
                            <div className="card-header">
                                <h3><TrendingUp size={20} /> So sánh doanh thu hàng tuần</h3>
                                <p>Tuần này vs Tuần trước</p>
                            </div>
                            <div className="chart-container" style={{ height: '350px', marginTop: '1rem' }}>
                                {stats && <Line data={getRevenueChartData()} options={chartOptions} />}
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="recent-activity glass-card"
                        >
                            <div className="card-header">
                                <h3><BarChart3 size={20} /> Top 5 món bán chạy</h3>
                                <p>Tính theo số lượng đã bán</p>
                            </div>
                            <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
                                {stats && (
                                    <Doughnut 
                                        data={getTopProductsData()} 
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
                                            }
                                        }} 
                                    />
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Activity & Recent Orders */}
                    <div className="dashboard-grid-two mt-6">
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Hoạt động gần đây</h3>
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
                        
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <div className="card-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Lời khuyên kinh doanh</h3>
                            </div>
                            <div className="business-tips">
                                <div className="tip-item">
                                    <div className="tip-icon bg-warning-light">💡</div>
                                    <div className="tip-content">
                                        <h4>Tăng doanh số ngày cuối tuần</h4>
                                        <p>Số liệu cho thấy Thứ 7 thường có doanh thu thấp hơn. Hãy thử tạo mã giảm giá "Weekend" để kích cầu.</p>
                                    </div>
                                </div>
                                <div className="tip-item">
                                    <div className="tip-icon bg-success-light">🚀</div>
                                    <div className="tip-content">
                                        <h4>Món ăn tiềm năng</h4>
                                        <p>Món <strong>{stats?.top_products[0]?.name}</strong> đang dẫn đầu. Hãy cân nhắc tạo thêm các Combo đi kèm món này.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
