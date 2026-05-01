import React, { useState, useEffect } from 'react';
import { Search, Package, Archive, Loader2, Image as ImageIcon, Plus, Minus, Edit2, Trash2, Eye, PlusCircle, X, Tag, DollarSign, Layers, Hash, Info } from 'lucide-react';
import api from '../api/axios';

const StaffInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [updatingId, setUpdatingId] = useState(null);
    const [updatingQtyId, setUpdatingQtyId] = useState(null);
    
    // Admin features state
    const role = localStorage.getItem('user_role');
    const isAdmin = role === '3';
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', category: '', price: '', description: '', quantity: 0, image: '', code: '', status: 'Available'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await api.get('/products?all=true');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Available' ? 'Sold Out' : 'Available';
        setUpdatingId(id);
        try {
            await api.patch(`/products/${id}/status`, { status: newStatus });
            setProducts(products.map(p => 
                p.id === id ? { ...p, status: newStatus } : p
            ));
        } catch (error) {
            alert('Không thể cập nhật trạng thái sản phẩm.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleQuantityChange = async (id, newQty) => {
        if (newQty < 0) return;
        setUpdatingQtyId(id);
        try {
            await api.put(`/products/${id}`, { quantity: newQty });
            setProducts(products.map(p => 
                p.id === id ? { ...p, quantity: newQty } : p
            ));
        } catch (error) {
            alert('Không thể cập nhật số lượng.');
        } finally {
            setUpdatingQtyId(null);
        }
    };

    const handleOpenModal = (type, product = null) => {
        setModalType(type);
        if (product) {
            setSelectedProduct(product);
            setFormData({ ...product });
        } else {
            setSelectedProduct(null);
            setFormData({
                name: '', category: '', price: '', description: '', quantity: 0, image: '', code: `PROD-${Date.now()}`, status: 'Available'
            });
        }
        setShowModal(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
            alert('Đã xóa sản phẩm thành công!');
        } catch (error) {
            alert('Không thể xóa sản phẩm.');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (modalType === 'add') {
                const res = await api.post('/products', formData);
                setProducts([res.data, ...products]);
                alert('Đã thêm sản phẩm mới thành công!');
            } else if (modalType === 'edit') {
                const res = await api.put(`/products/${selectedProduct.id}`, formData);
                setProducts(products.map(p => p.id === selectedProduct.id ? res.data : p));
                alert('Đã cập nhật sản phẩm thành công!');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || product.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="staff-inventory">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Kho thực phẩm</h1>
                    <p>Quản lý và điều chỉnh thông tin sản phẩm trong hệ thống.</p>
                </div>
                {isAdmin && (
                    <button className="btn-primary-glow" onClick={() => handleOpenModal('add')}>
                        <PlusCircle size={20} /> Thêm món mới
                    </button>
                )}
            </header>

            <div className="dashboard-controls glass-card">
                <div className="search-bar">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm sản phẩm theo tên..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {['All', 'Available', 'Sold Out'].map(status => (
                        <button 
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'All' ? 'Tất cả' : status === 'Available' ? 'Còn hàng' : 'Hết hàng'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="inventory-table-wrapper glass-card">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th className="text-center">Số lượng kho</th>
                            <th className="text-center">Trạng thái</th>
                            {isAdmin && <th className="text-right">Hành động</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8"><Loader2 className="spin inline" size={24}/> Đang tải...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="no-data">
                                    <Archive size={40} className="mb-2 opacity-50" />
                                    <p>Không tìm thấy sản phẩm nào.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td className="product-image-cell">
                                        {product.image ? (
                                            <img src={`/${product.image}`} alt={product.name} className="inv-thumb" />
                                        ) : (
                                            <div className="inv-thumb-placeholder"><ImageIcon size={20} /></div>
                                        )}
                                    </td>
                                    <td><strong>{product.name}</strong></td>
                                    <td><span className="category-badge">{product.category || 'Mặc định'}</span></td>
                                    <td className="text-center">
                                        <div className="quantity-adjust">
                                            <button 
                                                className="qty-btn-mini minus" 
                                                onClick={() => handleQuantityChange(product.id, (product.quantity || 0) - 1)}
                                                disabled={updatingQtyId === product.id || (product.quantity || 0) <= 0}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input 
                                                type="number"
                                                className={`qty-input-direct ${product.quantity > 0 ? 'qty-good' : 'qty-empty'}`}
                                                defaultValue={product.quantity}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val) && val !== product.quantity) {
                                                        handleQuantityChange(product.id, val);
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = parseInt(e.target.value);
                                                        if (!isNaN(val) && val !== product.quantity) {
                                                            handleQuantityChange(product.id, val);
                                                        }
                                                        e.target.blur();
                                                    }
                                                }}
                                                disabled={updatingQtyId === product.id}
                                            />
                                            <button 
                                                className="qty-btn-mini plus" 
                                                onClick={() => handleQuantityChange(product.id, (product.quantity || 0) + 1)}
                                                disabled={updatingQtyId === product.id}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="toggle-wrapper">
                                            <label className={`status-toggle ${product.status === 'Available' ? 'is-active' : ''} ${updatingId === product.id ? 'is-loading' : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={product.status === 'Available'}
                                                    onChange={() => toggleStatus(product.id, product.status)}
                                                    disabled={updatingId === product.id}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                            <span className={`status-label ${product.status === 'Available' ? 'text-success' : 'text-danger'}`}>
                                                {updatingId === product.id ? <Loader2 size={14} className="spin" /> : (product.status === 'Available' ? 'Còn hàng' : 'Hết hàng')}
                                            </span>
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td className="text-right">
                                            <div className="action-buttons">
                                                <button className="btn-icon view" title="Xem chi tiết" onClick={() => handleOpenModal('view', product)}>
                                                    <Eye size={18} />
                                                </button>
                                                <button className="btn-icon edit" title="Chỉnh sửa" onClick={() => handleOpenModal('edit', product)}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="btn-icon delete" title="Xóa món" onClick={() => handleDeleteProduct(product.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Admin Product Modal - Premium Redesign */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !isSubmitting && setShowModal(false)}>
                    <div className="modal-content product-premium-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-banner">
                            <div className="banner-content">
                                <Package size={32} className="banner-icon" />
                                <div>
                                    <h3>{modalType === 'add' ? 'Thêm món mới' : modalType === 'edit' ? 'Chỉnh sửa món' : 'Chi tiết món ăn'}</h3>
                                    <p>{modalType === 'add' ? 'Nhập thông tin sản phẩm mới vào hệ thống' : `Sản phẩm: ${formData.name}`}</p>
                                </div>
                            </div>
                            <button className="banner-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div className="modal-body-content">
                                <div className="form-grid-premium">
                                    <div className="form-group-premium full-width">
                                        <label><Tag size={14}/> TÊN SẢN PHẨM</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ví dụ: Trà sữa Trân châu đường đen"
                                            value={formData.name} 
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group-premium">
                                        <label><Layers size={14}/> DANH MỤC</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ví dụ: Milk Tea"
                                            value={formData.category} 
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="form-group-premium">
                                        <label><Hash size={14}/> MÃ SẢN PHẨM (CODE)</label>
                                        <input 
                                            type="text" 
                                            placeholder="M01, M02..."
                                            value={formData.code} 
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="form-group-premium">
                                        <label><DollarSign size={14}/> GIÁ BÁN (VNĐ)</label>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={formData.price} 
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="form-group-premium">
                                        <label><Package size={14}/> SỐ LƯỢNG KHO</label>
                                        <input 
                                            type="number" 
                                            placeholder="0"
                                            value={formData.quantity} 
                                            onChange={e => setFormData({...formData, quantity: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                            required
                                        />
                                    </div>

                                    <div className="form-group-premium full-width">
                                        <label><ImageIcon size={14}/> ĐƯỜNG DẪN ẢNH</label>
                                        <input 
                                            type="text" 
                                            placeholder="assets/img/products/product-name.jpg"
                                            value={formData.image} 
                                            onChange={e => setFormData({...formData, image: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                        />
                                    </div>

                                    <div className="form-group-premium full-width">
                                        <label><Info size={14}/> MÔ TẢ SẢN PHẨM</label>
                                        <textarea 
                                            rows="4"
                                            placeholder="Mô tả ngắn gọn về món ăn này..."
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            disabled={modalType === 'view' || isSubmitting}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-action-footer">
                                <div className="footer-left">
                                    <button type="button" className="btn-secondary-flat" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                </div>
                                <div className="footer-right">
                                    {modalType !== 'view' && (
                                        <button type="submit" className="btn-primary-flat" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 size={18} className="spin" /> : (modalType === 'add' ? 'Thêm mới ngay' : 'Lưu thay đổi')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000; padding: 2rem;
                }

                .product-premium-modal {
                    max-width: 750px;
                    width: 95%;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: modalSlideUp 0.3s ease-out;
                }

                @keyframes modalSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-banner {
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    padding: 1.5rem 2rem;
                    display: flex; justify-content: space-between; align-items: center;
                    color: white;
                }

                .banner-content { display: flex; align-items: center; gap: 1.2rem; }
                .banner-icon { color: rgba(255, 255, 255, 0.2); }
                .banner-content h3 { margin: 0; font-size: 1.3rem; font-weight: 800; }
                .banner-content p { margin: 0; font-size: 0.8rem; color: #94a3b8; }
                .banner-close { background: none; border: none; color: white; font-size: 2rem; cursor: pointer; opacity: 0.5; transition: 0.2s; }
                .banner-close:hover { opacity: 1; }

                .modal-body-content { padding: 2rem; max-height: 70vh; overflow-y: auto; }
                
                .form-grid-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .full-width { grid-column: span 2; }
                
                .form-group-premium { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group-premium label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
                
                .form-group-premium input, .form-group-premium textarea {
                    padding: 0.85rem 1.2rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    background: #f8fafc;
                    transition: all 0.2s;
                    outline: none;
                }

                .form-group-premium input:focus, .form-group-premium textarea:focus {
                    background: white;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }

                .form-group-premium input:disabled, .form-group-premium textarea:disabled {
                    background: #f1f5f9;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .modal-action-footer { padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                
                .btn-primary-flat {
                    background: #6366f1; color: white; border: none; padding: 0.8rem 2rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
                }
                .btn-primary-flat:hover { background: #4f46e5; transform: translateY(-2px); }
                .btn-primary-flat:disabled { opacity: 0.5; transform: none; cursor: wait; }

                .btn-secondary-flat { background: transparent; border: none; color: #64748b; font-weight: 700; cursor: pointer; }
                .btn-secondary-flat:hover { color: #1e293b; }

                .btn-primary-glow {
                    display: flex; align-items: center; gap: 8px; background: var(--primary); color: white; padding: 0.7rem 1.2rem; border-radius: 10px; font-weight: 600; transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                }
                .btn-primary-glow:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(var(--primary-rgb), 0.4); }

                .action-buttons { display: flex; gap: 8px; justify-content: flex-end; }
                .btn-icon {
                    width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
                    border: 1px solid #e2e8f0; background: white; color: #64748b; transition: all 0.2s;
                }
                .btn-icon:hover { transform: translateY(-2px); }
                .btn-icon.view:hover { color: var(--primary); border-color: var(--primary); }
                .btn-icon.edit:hover { color: #2563eb; border-color: #2563eb; }
                .btn-icon.delete:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
            `}</style>
        </div>
    );
};

export default StaffInventory;
