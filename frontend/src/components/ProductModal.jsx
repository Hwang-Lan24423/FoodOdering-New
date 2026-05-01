import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, ShoppingCart, Loader2, MessageSquare, Send } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const ProductModal = ({ productId, onClose }) => {
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/products/${productId}`);
            setProduct(response.data);
        } catch (err) {
            console.error('Lỗi khi tải chi tiết sản phẩm:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        setMessage('');
        try {
            await api.post('/reviews', {
                product_id: productId,
                rating: newReview.rating,
                comment: newReview.comment
            });
            setMessage('Đánh giá của bạn đã được gửi!');
            setNewReview({ rating: 5, comment: '' });
            fetchProduct(); 
        } catch (err) {
            setMessage(err.response?.data?.message || 'Gửi đánh giá thất bại.');
        } finally {
            setReviewLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="modal-content glass-card"
                onClick={e => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose} aria-label="Close modal"><X size={24} /></button>
                
                {loading ? (
                    <div className="modal-loading">
                        <Loader2 className="spin" size={48} color="var(--primary)" />
                        <p>Đang tải món ngon...</p>
                    </div>
                ) : !product ? (
                    <div className="modal-error">
                        <p>Không tìm thấy thông tin sản phẩm.</p>
                        <button onClick={onClose}>Đóng</button>
                    </div>
                ) : (
                    <div className="modal-body">
                        <div className="product-visuals">
                            <img src={product.image ? `/${product.image}` : '/placeholder.png'} alt={product.name || 'Product'} />
                        </div>
                        
                        <div className="product-details">
                            <div className="product-main-info">
                                <span className="category-tag">{product.category || 'Món ngon'}</span>
                                <h1>{product.name || 'Tên sản phẩm'}</h1>
                                <p className="price">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                                </p>
                                <p className="description">{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                                
                                <button 
                                    className="add-to-cart-btn"
                                    onClick={() => {
                                        addToCart(product);
                                        onClose();
                                    }}
                                    disabled={product.status === 'Sold Out'}
                                >
                                    <ShoppingCart size={20} />
                                    {product.status === 'Sold Out' ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                                </button>
                            </div>

                            <div className="reviews-section">
                                <h3><MessageSquare size={18} /> Đánh giá từ khách hàng ({product.reviews?.length || 0})</h3>
                                
                                <div className="reviews-list">
                                    {product.reviews && product.reviews.length > 0 ? product.reviews.map((rev, idx) => (
                                        <div key={idx} className="review-card">
                                            <div className="review-header">
                                                <div className="user-info">
                                                    <img src={`https://ui-avatars.com/api/?name=${rev.user?.name || 'User'}&background=random`} alt="" />
                                                    <strong>{rev.user?.name || 'Khách hàng'}</strong>
                                                </div>
                                                <div className="stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < (rev.rating || 0) ? '#f59e0b' : 'none'} color={i < (rev.rating || 0) ? '#f59e0b' : '#cbd5e1'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p>{rev.comment || 'Không có bình luận.'}</p>
                                            <span className="date">{rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : ''}</span>
                                        </div>
                                    )) : <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>}
                                </div>

                                {product.is_eligible ? (
                                    <form className="add-review-form" onSubmit={handleAddReview}>
                                        <h4>Gửi đánh giá của bạn</h4>
                                        <div className="rating-select">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <Star 
                                                    key={num} 
                                                    size={24} 
                                                    className="star-input"
                                                    fill={num <= newReview.rating ? '#f59e0b' : 'none'} 
                                                    color={num <= newReview.rating ? '#f59e0b' : '#cbd5e1'}
                                                    onClick={() => setNewReview({...newReview, rating: num})}
                                                />
                                            ))}
                                        </div>
                                        <textarea 
                                            placeholder="Nhận xét của bạn..."
                                            value={newReview.comment}
                                            onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                            required
                                        />
                                        <button type="submit" disabled={reviewLoading}>
                                            {reviewLoading ? <Loader2 className="spin" size={18} /> : <><Send size={18} /> Gửi</>}
                                        </button>
                                        {message && <p className="review-msg">{message}</p>}
                                    </form>
                                ) : (
                                    <div className="review-restriction">
                                        <MessageSquare size={20} />
                                        <p>Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và hoàn thành đơn hàng.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .modal-content {
                    background: white;
                    width: 100%;
                    max-width: 1000px;
                    height: 85vh;
                    border-radius: var(--radius-xl);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .modal-loading, .modal-error {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    color: var(--text-muted);
                }
                .close-btn {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: white;
                    border: none;
                    border-radius: 50%;
                    padding: 0.5rem;
                    box-shadow: var(--shadow-md);
                    z-index: 100;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .close-btn:hover { background: #f1f5f9; transform: rotate(90deg); }
                
                .modal-body {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    width: 100%;
                    height: 100%;
                }
                .product-visuals { height: 100%; background: #f8fafc; }
                .product-visuals img { width: 100%; height: 100%; object-fit: cover; }
                .product-details { padding: 3rem; background: #fcfcfd; overflow-y: auto; height: 100%; }
                
                .category-tag {
                    display: inline-block;
                    background: var(--primary-light);
                    color: var(--primary);
                    padding: 0.3rem 1rem;
                    border-radius: 2rem;
                    font-size: 0.8rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                .product-main-info h1 { font-size: 2.5rem; color: var(--bg-dark); margin-bottom: 1rem; }
                .price { font-size: 1.8rem; font-weight: 800; color: var(--secondary); margin-bottom: 1.5rem; }
                .description { color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem; }
                
                .add-to-cart-btn {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    padding: 1.2rem;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .add-to-cart-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

                .reviews-section { margin-top: 4rem; border-top: 1px solid var(--border); padding-top: 3rem; }
                .reviews-list { margin-bottom: 3rem; }
                .review-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    margin-bottom: 1.5rem;
                    border: 1px solid var(--border);
                }
                .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .user-info { display: flex; align-items: center; gap: 0.8rem; }
                .user-info img { width: 32px; height: 32px; border-radius: 50%; }
                
                .add-review-form { background: #f1f5f9; padding: 2rem; border-radius: var(--radius-lg); }
                .rating-select { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
                .star-input { cursor: pointer; transition: transform 0.2s; }
                .star-input:hover { transform: scale(1.2); }
                .add-review-form textarea {
                    width: 100%;
                    padding: 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    margin-bottom: 1.5rem;
                    font-family: inherit;
                    resize: none;
                }
                .add-review-form button {
                    background: var(--bg-dark);
                    color: white;
                    padding: 0.8rem 2rem;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                }
                .review-restriction {
                    background: #f1f5f9;
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    color: var(--text-muted);
                    border: 1px dashed var(--border);
                }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .modal-body { grid-template-columns: 1fr; }
                    .product-visuals { height: 250px; }
                }
            `}</style>
        </div>
    );
};

export default ProductModal;
