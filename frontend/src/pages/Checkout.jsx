import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Truck, MapPin, Phone, User, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null); 
    const [isPaid, setIsPaid] = useState(false); 
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: ''
    });

    // Tu dong kiem tra trang thai don hang moi 3 giay
    React.useEffect(() => {
        let interval;
        if (orderData && !isPaid) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/orders/${orderData.id}`);
                    if (res.data.status === 'Paid') {
                        setIsPaid(true);
                        clearInterval(interval);
                        clearCart();
                    }
                } catch (err) {
                    console.error('Loi kiem tra don hang:', err);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [orderData, isPaid]);

    const handleSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        try {
            // 1. Tao don hang tren Backend
            const response = await api.post('/orders', {
                ...formData,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.cartQuantity,
                    price: item.price
                })),
                total_amount: cartTotal,
                payment_method: 'Bank Transfer'
            });

            // 2. Lay Order ID va hien thi QR Code
            setOrderData(response.data);
            // clearCart(); // Khong clear ngay de user con thay thong tin thanh toan
        } catch (err) {
            alert('Co loi xay ra khi dat hang. Vui long thu lai!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Neu da dat hang thanh cong, hien thi QR Code
    if (orderData) {
        // Noi dung chuyen khoan duy nhat: BNT + ID don hang
        const transferContent = `BNT${orderData.id}`;
        const qrUrl = `https://qr.sepay.vn/img?acc=5601780121&bank=BIDV&amount=${cartTotal}&des=${transferContent}`;

        if (isPaid) {
            return (
                <div className="checkout-success">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="qr-container">
                        <div className="success-badge">
                            <CheckCircle2 size={80} className="success-icon" />
                        </div>
                        <h2>Thanh toán thành công!</h2>
                        <p>Cảm ơn bạn đã ủng hộ <strong>Bake n Take</strong>. Đơn hàng của bạn đang được chuẩn bị.</p>
                        <div className="order-info-final">
                            <p>Mã đơn hàng: <strong>#{orderData.id}</strong></p>
                            <p>Thời gian: <strong>{new Date().toLocaleString()}</strong></p>
                        </div>
                        <button onClick={() => navigate('/menu')} className="btn-submit">Tiếp tục mua sắm</button>
                    </motion.div>
                </div>
            );
        }

        return (

            <div className="checkout-success">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="qr-container">
                    <CheckCircle2 size={60} className="success-icon" />
                    <h2>Đặt hàng thành công!</h2>
                    <p className="order-msg">Vui lòng quét mã QR bên dưới để thanh toán cho đơn hàng <strong>#{orderData.id}</strong></p>
                    
                    <div className="qr-wrapper">
                        <img src={qrUrl} alt="SePay QR Code" className="qr-code" />
                        <div className="qr-details">
                            <div className="qr-row"><span>Chủ tài khoản:</span> <strong>LE NGUYEN HOANG LAN</strong></div>
                            <div className="qr-row"><span>Số tiền:</span> <strong className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</strong></div>
                            <div className="qr-row"><span>Nội dung:</span> <strong className="accent">{transferContent}</strong></div>
                        </div>
                    </div>

                    <div className="waiting-payment">
                        <Loader2 className="spin" />
                        <span>Hệ thống đang chờ nhận tiền tự động...</span>
                    </div>

                    <button onClick={() => { clearCart(); navigate('/orders'); }} className="btn-secondary">Xem lịch sử đơn hàng</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-grid">
                    <div className="checkout-form">
                        <div className="card">
                            <h2><Truck /> Thông tin giao hàng</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label><User size={18} /> Họ tên người nhận</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập họ tên..." />
                                </div>
                                <div className="form-group">
                                    <label><Phone size={18} /> Số điện thoại</label>
                                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Nhập số điện thoại..." />
                                </div>
                                <div className="form-group">
                                    <label><MapPin size={18} /> Địa chỉ nhận hàng</label>
                                    <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Số nhà, tên đường, phường/xã..."></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Ghi chú (tùy chọn)</label>
                                    <input type="text" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Lời nhắn cho quán hoặc shipper..." />
                                </div>
                                <button type="submit" className="btn-submit" disabled={loading}>
                                    {loading ? <Loader2 className="spin" /> : 'Xác nhận đặt hàng'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="order-summary">
                        <div className="card summary-card">
                            <h3>Tóm tắt đơn hàng</h3>
                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <span>{item.name} x{item.cartQuantity}</span>
                                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.cartQuantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="total-row">
                                <span>Tổng thanh toán</span>
                                <span className="total">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                            </div>
                            <div className="payment-notice">
                                <CreditCard size={18} />
                                <span>Thanh toán tự động qua chuyển khoản ngân hàng SePay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .checkout-page { padding: 4rem 0; background: var(--bg-main); min-height: calc(100vh - 80px); }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
                .checkout-grid { display: grid; grid-template-columns: 1fr 400px; gap: 3rem; }
                .card { background: white; padding: 2.5rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
                h2 { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; font-size: 1.5rem; }
                
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; font-weight: 600; color: var(--text-main); }
                .form-group input, .form-group textarea { width: 100%; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius-md); font-family: inherit; font-size: 1rem; }
                .form-group textarea { height: 100px; resize: none; }
                
                .btn-submit { width: 100%; background: var(--primary); color: white; padding: 1.2rem; border-radius: var(--radius-lg); font-weight: 700; font-size: 1.1rem; margin-top: 1rem; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .summary-card h3 { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
                .summary-items { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                .summary-item { display: flex; justify-content: space-between; font-size: 0.95rem; color: var(--text-muted); }
                .total-row { display: flex; justify-content: space-between; padding-top: 1.5rem; border-top: 2px dashed var(--border); }
                .total { font-size: 1.4rem; font-weight: 800; color: var(--primary); }
                .payment-notice { margin-top: 2rem; display: flex; align-items: center; gap: 0.8rem; padding: 1rem; background: #eef2ff; color: var(--primary); border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; }

                /* Success QR Style */
                .checkout-success { padding: 4rem 2rem; min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; background: var(--bg-main); }
                .qr-container { background: white; padding: 4rem; border-radius: var(--radius-xl); text-align: center; max-width: 500px; box-shadow: var(--shadow-lg); }
                .success-icon { color: #10b981; margin-bottom: 1.5rem; }
                .order-msg { margin-bottom: 2.5rem; color: var(--text-muted); }
                .qr-wrapper { background: var(--bg-main); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; }
                .qr-code { width: 250px; height: 250px; margin-bottom: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); }
                .qr-details { text-align: left; background: white; padding: 1.5rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.8rem; }
                .qr-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
                .price { color: var(--secondary); }
                .accent { color: var(--primary); }
                .waiting-payment { display: flex; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; padding: 1rem; background: #f8fafc; border-radius: 1rem; }
                .btn-secondary { color: var(--primary); font-weight: 700; text-decoration: underline; background: none; }
            `}</style>
        </div>
    );
};

export default Checkout;
