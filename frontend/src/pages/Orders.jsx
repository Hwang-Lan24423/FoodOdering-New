import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle2, ChevronRight, Search, Filter } from 'lucide-react';
import api from '../api/axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data);
            } catch (err) {
                console.error('Loi lay lich su don hang:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Shipping', 'Completed'];
    
    const getStatusIndex = (status) => {
        if (status === 'Paid') return 1; // Paid means Confirmed in this context
        return statusSteps.indexOf(status);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': case 'Confirmed': return 'status-paid';
            case 'Pending': return 'status-pending';
            case 'Preparing': return 'status-preparing';
            case 'Shipping': return 'status-shipping';
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Paid': return 'Đã thanh toán';
            case 'Confirmed': return 'Đã xác nhận';
            case 'Pending': return 'Chờ xử lý';
            case 'Preparing': return 'Đang chuẩn bị';
            case 'Shipping': return 'Đang giao hàng';
            case 'Completed': return 'Đã hoàn thành';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    if (loading) {
        return <div className="loading-state">Đang tải lịch sử đơn hàng...</div>;
    }

    return (
        <div className="orders-page">
            <div className="container">
                <header className="orders-header">
                    <h1>Lịch sử <span className="gradient-text">Đơn hàng</span></h1>
                    <p>Theo dõi trạng thái và chi tiết các món ăn bạn đã đặt.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <Package size={60} />
                        <h3>Bạn chưa có đơn hàng nào</h3>
                        <p>Hãy khám phá thực đơn và đặt món ngay nhé!</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={order.id} 
                                className={`order-card ${selectedOrder === order.id ? 'expanded' : ''}`}
                            >
                                <div className="order-main">
                                    <div className="order-id">
                                        <span className="label">Mã đơn hàng</span>
                                        <span className="value">#{order.id}</span>
                                    </div>
                                    <div className="order-date">
                                        <Clock size={16} />
                                        <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="order-items-count">
                                        {order.items?.length || 0} món ăn
                                    </div>
                                    <div className="order-total">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount_paid)}
                                    </div>
                                    <div className={`order-status ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </div>
                                    <button 
                                        className="view-detail-btn"
                                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                    >
                                        {selectedOrder === order.id ? 'Thu gọn' : 'Chi tiết'} 
                                        <ChevronRight size={18} className={selectedOrder === order.id ? 'rotate-90' : ''} />
                                    </button>
                                </div>
                                
                                <AnimatePresence>
                                    {selectedOrder === order.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="order-expanded-details"
                                        >
                                            <div className="order-timeline">
                                                {statusSteps.map((step, idx) => {
                                                    const currentIndex = getStatusIndex(order.status);
                                                    const isCompleted = idx <= currentIndex && order.status !== 'Cancelled';
                                                    const isCurrent = idx === currentIndex;
                                                    
                                                    return (
                                                        <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                                            <div className="step-dot">
                                                                {isCompleted ? <CheckCircle2 size={16} /> : <div className="dot" />}
                                                            </div>
                                                            <div className="step-label">{getStatusText(step)}</div>
                                                            {idx < statusSteps.length - 1 && <div className="step-line" />}
                                                        </div>
                                                    );
                                                })}
                                                {order.status === 'Cancelled' && (
                                                    <div className="timeline-step cancelled">
                                                        <div className="step-dot"><div className="dot" /></div>
                                                        <div className="step-label">Đã hủy</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="expanded-info-grid">
                                                <div className="delivery-info">
                                                    <h4>Thông tin giao hàng</h4>
                                                    <p><strong>Người nhận:</strong> {order.name}</p>
                                                    <p><strong>SĐT:</strong> {order.phone}</p>
                                                    <p><strong>Địa chỉ:</strong> {order.address}</p>
                                                    {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                                                </div>
                                                <div className="items-detail">
                                                    <h4>Chi tiết món ăn</h4>
                                                    <div className="detail-items-list">
                                                        {order.items?.map(item => (
                                                            <div key={item.id} className="detail-item">
                                                                <img src={`/${item.product?.image}`} alt="" />
                                                                <div className="item-info">
                                                                    <div className="item-name">{item.product?.name}</div>
                                                                    <div className="item-qty">x{item.quantity}</div>
                                                                </div>
                                                                <div className="item-subtotal">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {selectedOrder !== order.id && (
                                    <div className="order-items-preview">
                                        {order.items?.slice(0, 3).map(item => (
                                            <div key={item.id} className="preview-item">
                                                <img src={`/${item.product?.image}`} alt="" />
                                                <span>{item.product?.name} x{item.quantity}</span>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <div className="more-items">+{order.items.length - 3} món khác</div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
