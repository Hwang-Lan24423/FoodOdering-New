import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Filter, Plus, Check, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import ProductModal from '../components/ProductModal';

const Menu = () => {
    const { addToCart } = useCart();
    const [addedId, setAddedId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [category, searchTerm]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/products', { params });
            setProducts(response.data);
        } catch (err) {
            console.error('Lỗi lấy thực đơn:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', 'Cakes', 'Milk Tea'];

    return (
        <div className="menu-page">
            <header className="menu-header">
                <div className="container">
                    <h1>Khám phá <span className="gradient-text">Thực đơn</span></h1>
                    <p>Tìm kiếm những món ngon nhất dành riêng cho bạn.</p>
                </div>
            </header>

            <div className="container">
                <div className="menu-controls-wrapper">
                    <div className="menu-controls">
                        <div className="categories">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`cat-btn ${category === cat ? 'active' : ''}`}
                                >
                                    {cat === 'All' ? 'Tất cả' : cat}
                                </button>
                            ))}
                        </div>

                        <div className="search-box">
                            <Search size={20} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm món ăn..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={40} />
                        <p>Đang tải món ngon...</p>
                    </div>
                ) : (
                    <motion.div layout className="product-grid">
                        <AnimatePresence>
                            {products.length > 0 ? products.map(product => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={product.id} 
                                    className="product-card"
                                    onClick={() => setSelectedProductId(product.id)}
                                >
                                    <div className="product-img">
                                        <img src={`/${product.image}`} alt={product.name} />
                                        <div className="view-overlay">Xem chi tiết</div>
                                        {product.status === 'Sold Out' && (
                                            <div className="sold-out">Hết hàng</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <div className="product-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span className="category-label" style={{ marginBottom: 0 }}>{product.category || 'Món ngon'}</span>
                                            <span className="quantity-label" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Số lượng: {product.quantity}</span>
                                        </div>
                                        <h3 style={{ marginTop: 0 }}>{product.name}</h3>
                                        <div className="product-footer">
                                            <span className="price">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                            </span>
                                            <button 
                                                className={`add-btn ${addedId === product.id ? 'added' : ''}`} 
                                                disabled={product.status === 'Sold Out'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                    setAddedId(product.id);
                                                    setTimeout(() => setAddedId(null), 2000);
                                                }}
                                            >
                                                {addedId === product.id ? <Check size={20} /> : <Plus size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="no-results">Không tìm thấy món nào phù hợp với bộ lọc.</div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {selectedProductId && (
                    <ProductModal 
                        productId={selectedProductId} 
                        onClose={() => setSelectedProductId(null)} 
                    />
                )}
            </AnimatePresence>

            <style jsx>{`
                .menu-controls-wrapper {
                    margin-bottom: 3rem;
                }
                .menu-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .categories {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .cat-btn {
                    background: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    color: var(--text-muted);
                    border: 1px solid var(--border);
                    transition: var(--transition);
                }
                .cat-btn.active {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .search-box {
                    flex: 1;
                    max-width: 400px;
                    position: relative;
                }
                .search-box input {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 3rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    font-family: inherit;
                }
                .search-box svg {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 2rem;
                }
                .product-card {
                    background: white;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow);
                    transition: var(--transition);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }
                .product-card:hover {
                    transform: translateY(-8px);
                    box-shadow: var(--shadow-lg);
                }
                .product-img {
                    height: 180px;
                    position: relative;
                    overflow: hidden;
                }
                .product-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .product-card:hover .product-img img {
                    transform: scale(1.1);
                }
                .view-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(99, 102, 241, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    opacity: 0;
                    transition: var(--transition);
                    backdrop-filter: blur(2px);
                }
                .product-card:hover .view-overlay { opacity: 1; }

                .sold-out {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 800;
                    text-transform: uppercase;
                    z-index: 5;
                }
                .product-info {
                    padding: 1.5rem;
                }
                .category-label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--primary);
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                    display: block;
                }
                .product-info h3 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                    color: var(--bg-dark);
                }
                .product-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .price {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--secondary);
                }
                .add-btn {
                    background: var(--bg-main);
                    color: var(--primary);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--transition);
                }
                .add-btn:hover:not(:disabled) {
                    background: var(--primary);
                    color: white;
                    transform: rotate(90deg);
                }
                .add-btn.added { background: #10b981; color: white; }
                
                .no-results { text-align: center; grid-column: 1 / -1; padding: 5rem 0; color: var(--text-muted); font-size: 1.1rem; }
                .loading-state { text-align: center; padding: 5rem 0; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 1rem; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Menu;
