import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, MapPin, Phone, User, CheckCircle2, Loader2, Star, Ticket } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [orderData, setOrderData] = useState(null); 
    const [isPaid, setIsPaid] = useState(false); 
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: ''
    });

    // Coupon States
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    
    // Loyalty States
    const [userPoints, setUserPoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [redemptionRate, setRedemptionRate] = useState(100);
    const [usePoints, setUsePoints] = useState(false);

    // Coupon Selection States
    const [activeCoupons, setActiveCoupons] = useState([]);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [fetchingCoupons, setFetchingCoupons] = useState(false);

    // Lay thong tin nguoi dung de tu dong dien vao form
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const [userRes, loyaltyRes, couponsRes] = await Promise.all([
                    api.get('/user'),
                    api.get('/loyalty/status'),
                    api.get('/coupons/active')
                ]);
                setFormData(prev => ({
                    ...prev,
                    name: userRes.data.name || '',
                    phone: userRes.data.contact || '',
                    address: userRes.data.address || ''
                }));
                setUserPoints(loyaltyRes.data.points);
                setRedemptionRate(loyaltyRes.data.redemption_rate || 100);
                setActiveCoupons(couponsRes.data);
            } catch (err) {
                console.error('Loi khi lay thong tin:', err);
            } finally {
                setFetchingUser(false);
            }
        };
        fetchUserData();
    }, []);

    // Tu dong kiem tra trang thai don hang moi 3 giay
    useEffect(() => {
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

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        
        setApplyingCoupon(true);
        setCouponError('');
        try {
            const response = await api.post('/coupons/validate', {
                code: couponCode,
                order_amount: cartTotal
            });
            setAppliedCoupon(response.data);
            setCouponCode(''); // Clear input after success
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ!');
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponError('');
    };

    const pointDiscount = usePoints ? pointsToUse * redemptionRate : 0;

    const finalTotal = Math.max(0, (appliedCoupon 
        ? cartTotal - appliedCoupon.discount_amount 
        : cartTotal) - pointDiscount);

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
                total_amount: cartTotal, // Send original total, backend will recalculate based on coupon
                coupon_code: appliedCoupon?.code, // Send coupon code if exists
                points_to_redeem: usePoints ? pointsToUse : 0,
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
        const qrUrl = `https://qr.sepay.vn/img?acc=0934938806&bank=MB&amount=${orderData.amount_paid}&des=${transferContent}`;

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
                            <p>Số tiền: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.amount_paid)}</strong></p>
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
                            <div className="qr-row"><span>Số tài khoản:</span> <strong>0934938806</strong></div>
                            <div className="qr-row"><span>Ngân hàng:</span> <strong>MBBank (Quân Đội)</strong></div>
                            <div className="qr-row"><span>Số tiền:</span> <strong className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.amount_paid)}</strong></div>
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
        <div className="checkout-root">
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-grid">
                    <div className="checkout-form">
                        <div className="card">
                            <h2><Truck /> Thông tin giao hàng</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label><User size={18} /> Họ tên người nhận</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={fetchingUser ? "Đang tải..." : "Nhập họ tên..."} disabled={fetchingUser} />
                                </div>
                                <div className="form-group">
                                    <label><Phone size={18} /> Số điện thoại</label>
                                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder={fetchingUser ? "Đang tải..." : "Nhập số điện thoại..."} disabled={fetchingUser} />
                                </div>
                                <div className="form-group">
                                    <label><MapPin size={18} /> Địa chỉ nhận hàng</label>
                                    <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder={fetchingUser ? "Đang tải..." : "Số nhà, tên đường, phường/xã..."} disabled={fetchingUser}></textarea>
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

                            <div className="coupon-section">
                                <label>Mã giảm giá</label>
                                    {!appliedCoupon ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="coupon-input-group">
                                                <input 
                                                    type="text" 
                                                    placeholder="Nhập mã ưu đãi..." 
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                />
                                                <button 
                                                    type="button" 
                                                    className="btn-apply" 
                                                    onClick={handleApplyCoupon}
                                                    disabled={applyingCoupon || !couponCode}
                                                >
                                                    {applyingCoupon ? <Loader2 className="spin" size={16} /> : 'Áp dụng'}
                                                </button>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="btn-browse-list"
                                                onClick={() => setShowCouponModal(true)}
                                            >
                                                <Ticket size={14} /> Chọn mã giảm giá có sẵn
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="applied-coupon-box">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={18} className="text-success" />
                                                <span>Đã áp dụng: <strong>{appliedCoupon.code}</strong></span>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="btn-remove-link" 
                                                onClick={removeCoupon}
                                            >
                                                Gỡ bỏ
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {couponError && <p className="coupon-error">{couponError}</p>}

                            {/* Loyalty Points Section */}
                            <div className="loyalty-redeem-section">
                                <div className="redeem-header">
                                    <div className="redeem-info">
                                        <Star size={18} className="text-secondary" />
                                        <span>Điểm tích lũy: <strong>{userPoints.toLocaleString()}</strong></span>
                                    </div>
                                    <div className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            id="use-points-toggle" 
                                            checked={usePoints}
                                            onChange={(e) => {
                                                setUsePoints(e.target.checked);
                                                if(e.target.checked) setPointsToUse(userPoints);
                                            }}
                                            disabled={userPoints <= 0}
                                        />
                                        <label htmlFor="use-points-toggle"></label>
                                    </div>
                                </div>
                                
                                {usePoints && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="points-input-area">
                                        <p className="points-hint">Bạn có thể dùng tối đa {userPoints.toLocaleString()} điểm để giảm { (userPoints * redemptionRate).toLocaleString() }đ</p>
                                        <div className="points-control">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max={userPoints}
                                                value={pointsToUse}
                                                onChange={(e) => {
                                                    const val = Math.min(userPoints, Math.max(0, parseInt(e.target.value) || 0));
                                                    setPointsToUse(val);
                                                }}
                                            />
                                            <span className="equals">=</span>
                                            <span className="discount-preview">-{ (pointsToUse * redemptionRate).toLocaleString() }đ</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="summary-footer">
                                <div className="total-row">
                                    <span>Tạm tính</span>
                                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="total-row discount">
                                        <span>Giảm giá mã</span>
                                        <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appliedCoupon.discount_amount)}</span>
                                    </div>
                                )}
                                {usePoints && pointDiscount > 0 && (
                                    <div className="total-row loyalty-discount">
                                        <span>Điểm thưởng</span>
                                        <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pointDiscount)}</span>
                                    </div>
                                )}
                                <div className="total-row main">
                                    <span>Tổng thanh toán</span>
                                    <span className="total">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}</span>
                                </div>
                            </div>

                            <div className="payment-notice">
                                <CreditCard size={18} />
                                <span>Thanh toán tự động qua chuyển khoản ngân hàng SePay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupon Modal */}
            <AnimatePresence>
                {showCouponModal && (
                    <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
                        <motion.div 
                            className="coupon-modal"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Chọn mã giảm giá</h3>
                                <button className="close-btn" onClick={() => setShowCouponModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                {activeCoupons.length === 0 ? (
                                    <div className="no-coupons">
                                        <Star size={40} className="text-muted mb-2" />
                                        <p>Hiện không có mã giảm giá nào khả dụng.</p>
                                    </div>
                                ) : (
                                    <div className="coupon-list">
                                        {activeCoupons.map(coupon => {
                                            const isEligible = cartTotal >= coupon.min_order_value;
                                            return (
                                                <div key={coupon.id} className={`coupon-card ${!isEligible ? 'disabled' : ''}`}>
                                                    <div className="coupon-left">
                                                        <div className="coupon-badge">{coupon.type === 'percent' ? `${coupon.value}%` : `${(coupon.value/1000)}K`}</div>
                                                    </div>
                                                    <div className="coupon-right">
                                                        <div className="coupon-info">
                                                            <h4>{coupon.code}</h4>
                                                            <p>{coupon.type === 'percent' ? `Giảm ${coupon.value}% tổng đơn` : `Giảm ${coupon.value.toLocaleString()}đ`}</p>
                                                            <span className="min-order">Đơn tối thiểu: {coupon.min_order_value.toLocaleString()}đ</span>
                                                        </div>
                                                        <button 
                                                            className="btn-select"
                                                            disabled={!isEligible}
                                                            onClick={() => {
                                                                setCouponCode(coupon.code);
                                                                setShowCouponModal(false);
                                                            }}
                                                        >
                                                            {isEligible ? 'Dùng ngay' : 'Chưa đủ ĐK'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
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
                .total-row { display: flex; justify-content: space-between; padding-top: 1rem; color: var(--text-muted); font-size: 0.95rem; }
                .total-row.discount { color: #10b981; font-weight: 600; }
                .total-row.main { padding-top: 1.5rem; border-top: 2px dashed var(--border); margin-top: 1rem; color: var(--text-main); }
                .total { font-size: 1.4rem; font-weight: 800; color: var(--primary); }

                .coupon-section { margin-bottom: 2rem; padding: 1.5rem 0; border-top: 1px solid var(--border); }
                .coupon-section label { display: block; font-size: 0.8rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; letter-spacing: 0.5px; }
                
                .coupon-input-group { display: flex; gap: 0.5rem; width: 100%; box-sizing: border-box; }
                .coupon-input-group input { flex: 1; min-width: 0; padding: 0.8rem 1rem; border-radius: var(--radius-lg); border: 1.5px solid var(--border); background: #f8fafc; font-weight: 700; font-size: 0.9rem; letter-spacing: 0.5px; outline: none; transition: var(--transition); }
                .coupon-input-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); background: white; }
                .coupon-input-group input::placeholder { color: #94a3b8; font-weight: 500; letter-spacing: 0; font-size: 0.85rem; }
                
                .btn-apply { padding: 0 1rem; background: linear-gradient(135deg, var(--primary), #4f46e5); color: white; border-radius: var(--radius-lg); font-weight: 700; font-size: 0.85rem; transition: var(--transition); box-shadow: var(--shadow-sm); white-space: nowrap; flex-shrink: 0; }
                .btn-apply:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); filter: brightness(1.1); }
                .btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .btn-browse-list { margin-top: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.6rem; background: white; color: var(--primary); padding: 0.75rem; border-radius: var(--radius-lg); font-size: 0.85rem; font-weight: 700; border: 1.5px solid var(--primary-light); transition: all 0.3s ease; width: 100%; cursor: pointer; }
                .btn-browse-list:hover { background: var(--primary-light); color: var(--primary); transform: translateY(-1px); border-color: var(--primary); }
                
                .applied-coupon-box { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, #ecfdf5, #f0fdf4); padding: 1rem 1.2rem; border-radius: var(--radius-lg); border: 1.5px solid #10b981; width: 100%; color: #065f46; font-size: 0.9rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .btn-remove-link { color: #ef4444; font-weight: 800; text-decoration: none; background: #fee2e2; padding: 0.4rem 0.8rem; border-radius: var(--radius-md); font-size: 0.75rem; transition: var(--transition); }
                .btn-remove-link:hover { background: #fecaca; }
                
                .coupon-error { color: #ef4444; font-size: 0.8rem; margin-top: 0.6rem; font-weight: 600; padding-left: 0.5rem; border-left: 3px solid #ef4444; }
                .coupon-success { color: #10b981; font-size: 0.8rem; margin-top: 0.6rem; font-weight: 600; }

                /* Coupon Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
                .coupon-modal { background: white; width: 95%; max-width: 450px; border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg); }
                .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
                .modal-header h3 { font-size: 1.1rem; margin: 0; }
                .close-btn { font-size: 1.5rem; background: none; color: var(--text-muted); }
                .modal-body { padding: 1.5rem; max-height: 400px; overflow-y: auto; }
                .no-coupons { text-align: center; padding: 2rem 0; color: var(--text-muted); }
                .coupon-list { display: flex; flex-direction: column; gap: 1rem; }
                .coupon-card { display: flex; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: var(--transition); }
                .coupon-card:hover:not(.disabled) { border-color: var(--primary); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
                .coupon-card.disabled { opacity: 0.6; background: #f8fafc; }
                .coupon-left { width: 80px; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 1.2rem; position: relative; }
                .coupon-left::after { content: ''; position: absolute; right: -5px; top: 0; bottom: 0; width: 10px; background-image: radial-gradient(circle at 10px 10px, transparent 0, transparent 5px, white 5px, white 10px); background-size: 10px 20px; }
                .coupon-right { flex: 1; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
                .coupon-info h4 { margin: 0 0 0.2rem 0; color: var(--text-main); font-size: 1rem; letter-spacing: 1px; }
                .coupon-info p { margin: 0; font-size: 0.85rem; color: var(--text-muted); }
                .min-order { font-size: 0.75rem; color: var(--primary); font-weight: 600; margin-top: 0.4rem; display: block; }
                .btn-select { padding: 0.5rem 1rem; background: var(--primary); color: white; border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 700; }
                .btn-select:disabled { background: #cbd5e1; cursor: not-allowed; }

                .loyalty-redeem-section { margin-bottom: 2rem; padding: 1.5rem 0; border-top: 1px solid var(--border); }
                .redeem-header { display: flex; justify-content: space-between; align-items: center; }
                .redeem-info { display: flex; align-items: center; gap: 0.6rem; font-size: 0.95rem; }
                
                .toggle-switch { position: relative; width: 44px; height: 22px; }
                .toggle-switch input { opacity: 0; width: 0; height: 0; }
                .toggle-switch label { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
                .toggle-switch label:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                .toggle-switch input:checked + label { background-color: var(--secondary); }
                .toggle-switch input:checked + label:before { transform: translateX(22px); }
                .toggle-switch input:disabled + label { opacity: 0.5; cursor: not-allowed; }

                .points-input-area { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border); overflow: hidden; }
                .points-hint { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.8rem; }
                .points-control { display: flex; align-items: center; gap: 1rem; }
                .points-control input { width: 100px; padding: 0.5rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-weight: 700; text-align: center; }
                .equals { font-weight: 700; color: var(--text-muted); }
                .discount-preview { font-weight: 800; color: var(--secondary); font-size: 1.1rem; }

                .total-row.loyalty-discount { color: var(--secondary); font-weight: 600; }
                
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
            `}} />
        </div>
        </div>
    );
};

export default Checkout;
