import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, updateQuantity, setExactQuantity, removeFromCart, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="empty-cart">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-container"
                >
                    <ShoppingBag size={80} className="empty-icon" />
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <p>Có vẻ như bạn chưa chọn được món ăn nào ưng ý.</p>
                    <Link to="/menu" className="btn-primary">Khám phá thực đơn ngay</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="cart-title">Giỏ hàng của bạn <span className="item-count">({cart.length} món)</span></h1>
                
                <div className="cart-content">
                    <div className="cart-items">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    key={item.id} 
                                    className="cart-item"
                                >
                                    <div className="item-img">
                                        <img src={`/${item.image}`} alt={item.name} />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-price">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                        </p>
                                    </div>
                                    <div className="item-quantity">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="qty-btn"><Minus size={16} /></button>
                                        <input 
                                            type="number" 
                                            value={item.cartQuantity} 
                                            onChange={(e) => setExactQuantity(item.id, e.target.value)}
                                            className="qty-input"
                                            min="1"
                                        />
                                        <button onClick={() => updateQuantity(item.id, 1)} className="qty-btn"><Plus size={16} /></button>
                                    </div>
                                    <div className="item-subtotal">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.cartQuantity)}
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="delete-btn">
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="cart-summary">
                        <div className="summary-card">
                            <h3>Tổng đơn hàng</h3>
                            <div className="summary-row">
                                <span>Tạm tính</span>
                                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí giao hàng</span>
                                <span className="free">Miễn phí</span>
                            </div>
                            <div className="summary-total">
                                <span>Tổng cộng</span>
                                <span className="total-amount">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                            </div>
                            <Link to="/checkout" className="btn-checkout">
                                Thanh toán ngay <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .cart-page { padding: 4rem 0; min-height: calc(100vh - 80px); background: var(--bg-main); }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
                .cart-title { margin-bottom: 3rem; font-size: 2.5rem; }
                .item-count { color: var(--text-muted); font-size: 1.2rem; }
                
                .cart-content { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; }
                .cart-items { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .cart-item { 
                    background: white; padding: 1.5rem; border-radius: var(--radius-lg);
                    display: grid; grid-template-columns: 100px 1fr 120px 120px 50px;
                    align-items: center; gap: 2rem; box-shadow: var(--shadow-sm);
                }
                .item-img img { width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-md); }
                .item-details h3 { font-size: 1.2rem; margin-bottom: 0.5rem; }
                .item-price { color: var(--secondary); font-weight: 700; }
                
                .item-quantity { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-main); padding: 0.5rem; border-radius: var(--radius-md); justify-content: center; }
                .qty-btn { background: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); cursor: pointer; transition: 0.2s; }
                .qty-btn:hover { background: #f1f5f9; }
                .qty-input { width: 40px; text-align: center; font-weight: 700; background: transparent; border: none; font-size: 1rem; color: var(--bg-dark); }
                .qty-input::-webkit-outer-spin-button, .qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                
                .item-subtotal { font-weight: 800; font-size: 1.1rem; color: var(--bg-dark); text-align: right; }
                .delete-btn { color: var(--text-muted); }
                .delete-btn:hover { color: #ef4444; }

                .cart-summary .summary-card { background: white; padding: 2.5rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); position: sticky; top: 120px; }
                .summary-card h3 { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 1.5rem; color: var(--text-muted); }
                .free { color: #10b981; font-weight: 700; }
                .summary-total { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 2px dashed var(--border); }
                .summary-total span { font-size: 1.2rem; font-weight: 700; }
                .total-amount { color: var(--primary); font-size: 1.5rem !important; font-weight: 800 !important; }
                
                .btn-checkout { margin-top: 2.5rem; background: var(--primary); color: white; width: 100%; padding: 1.2rem; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 0.8rem; font-weight: 700; font-size: 1.1rem; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); }
                .btn-checkout:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4); }

                .empty-cart { height: calc(100vh - 150px); display: flex; align-items: center; justify-content: center; text-align: center; }
                .empty-icon { color: var(--primary-light); margin-bottom: 2rem; }
                .empty-cart h2 { font-size: 2rem; margin-bottom: 1rem; }
                .empty-cart p { margin-bottom: 2.5rem; }
            `}</style>
        </div>
    );
};

export default Cart;
