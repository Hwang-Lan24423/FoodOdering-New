import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ChefHat, 
    Search, 
    Filter,
    ExternalLink,
    MoreVertical,
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '../api/axios';

const StaffOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
        // Refresh orders every 30 seconds for "real-time" feel
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newStatus });
            // Update local state instead of full fetch for smoothness
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            alert('Cập nhật trạng thái thất bại!');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        const matchesSearch = order.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             order.id.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Paid': return 'status-completed'; // Dùng màu xanh của completed cho Paid
            case 'Preparing': return 'status-preparing';
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} />;
            case 'Paid': return <CheckCircle2 size={16} />;
            case 'Preparing': return <ChefHat size={16} />;
            case 'Completed': return <CheckCircle2 size={16} />;
            case 'Cancelled': return <XCircle size={16} />;
            default: return null;
        }
    };

    if (loading) return (
        <div className="dashboard-loading">
            <Loader2 className="spin" size={40} />
            <p>Đang tải danh sách đơn hàng...</p>
        </div>
    );

    return (
        <div className="staff-orders">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Quản lý Vận hành</h1>
                    <p>Chào ngày mới! Bạn có {orders.filter(o => o.status === 'Pending' || o.status === 'Paid').length} đơn hàng mới cần xử lý.</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card glass-card">
                        <Clock className="text-pending" />
                        <div>
                            <span>{orders.filter(o => o.status === 'Pending' || o.status === 'Paid').length}</span>
                            <p>Chờ xử lý</p>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <ChefHat className="text-preparing" />
                        <div>
                            <span>{orders.filter(o => o.status === 'Preparing').length}</span>
                            <p>Đang chuẩn bị</p>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <CheckCircle2 className="text-completed" />
                        <div>
                            <span>{orders.filter(o => o.status === 'Completed').length}</span>
                            <p>Hoàn thành</p>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <XCircle className="text-cancelled" />
                        <div>
                            <span>{orders.filter(o => o.status === 'Cancelled').length}</span>
                            <p>Đã hủy</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="dashboard-controls glass-card">
                <div className="search-bar">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên khách hàng hoặc mã đơn..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {[
                        { id: 'All', label: 'Tất cả' },
                        { id: 'Pending', label: 'Chờ xử lý' },
                        { id: 'Preparing', label: 'Đang chuẩn bị' },
                        { id: 'Completed', label: 'Đã hoàn thành' },
                        { id: 'Cancelled', label: 'Đã hủy' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`filter-btn ${filterStatus === tab.id ? 'active' : ''}`}
                            onClick={() => setFilterStatus(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="orders-table-wrapper glass-card">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Mã Đơn</th>
                            <th>Khách hàng</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode='popLayout'>
                            {filteredOrders.map(order => (
                                <motion.tr 
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td className="order-id">#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <strong>{order.name}</strong>
                                            <span>{order.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="order-items-brief">
                                            {order.items?.map((item, idx) => (
                                                <span key={idx}>
                                                    {item.product?.name} (x{item.quantity})
                                                    {idx < order.items.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="price">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount_paid)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status === 'Pending' ? 'Chờ xử lý' : 
                                             order.status === 'Preparing' ? 'Đang chuẩn bị' : 
                                             order.status === 'Completed' ? 'Đã hoàn thành' : 
                                             order.status === 'Cancelled' ? 'Đã hủy' : 
                                             order.status === 'Paid' ? 'Đã thanh toán' : order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {order.status === 'Paid' && (
                                                <button 
                                                    className="btn-action btn-prepare"
                                                    onClick={() => updateStatus(order.id, 'Preparing')}
                                                    disabled={updatingId === order.id}
                                                >
                                                    Chế biến
                                                </button>
                                            )}
                                            {order.status === 'Preparing' && (
                                                <button 
                                                    className="btn-action btn-complete"
                                                    onClick={() => updateStatus(order.id, 'Completed')}
                                                    disabled={updatingId === order.id}
                                                >
                                                    Hoàn thành
                                                </button>
                                            )}
                                            {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                                <button 
                                                    className="btn-icon btn-cancel"
                                                    onClick={() => updateStatus(order.id, 'Cancelled')}
                                                    disabled={updatingId === order.id}
                                                    title="Hủy đơn"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                            {updatingId === order.id && <Loader2 className="spin" size={16} />}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="no-data">
                        <ShoppingBag size={48} />
                        <p>Không tìm thấy đơn hàng nào phù hợp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffOrders;
