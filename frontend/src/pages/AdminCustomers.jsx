import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Calendar, Loader2, AlertCircle, Eye, Star } from 'lucide-react';
import api from '../api/axios';
import UserModal from '../components/Modals/UserModal';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users?type=customer');
            setCustomers(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.contact && customer.contact.includes(searchTerm))
    );

    const handleAdd = () => {
        setEditingUser(null);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleEdit = (customer) => {
        setEditingUser(customer);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (customer) => {
        setEditingUser(customer);
        setIsReadOnly(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này? (Xóa mềm - Tài khoản sẽ bị khóa)")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchCustomers();
            } catch (error) {
                alert("Lỗi khi xóa: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    return (
        <div className="admin-users-page">
            <header className="page-header mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Khách hàng</h1>
                    <p className="text-gray-500">Xem và quản lý tất cả khách hàng đăng ký trên hệ thống.</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={handleAdd}>
                    <Plus size={18} /> Thêm Khách hàng
                </button>
            </header>

            <div className="glass-card table-container">
                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên, email, sđt..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="spin text-primary mb-4" size={40} />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Liên hệ</th>
                                    <th>Giới tính</th>
                                    <th>Ngày tham gia</th>
                                    <th>Loyalty</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td className="font-medium text-gray-500">#{customer.id}</td>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="avatar">{customer.name.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{customer.name}</p>
                                                    <p className="text-xs text-gray-500">@{customer.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="contact-item"><Mail size={14}/> {customer.email}</div>
                                                {customer.contact && <div className="contact-item"><Phone size={14}/> {customer.contact}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`gender-badge ${customer.gender === 'Nam' ? 'male' : customer.gender === 'Nữ' ? 'female' : 'other'}`}>
                                                {customer.gender || 'Khác'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                <Calendar size={14} /> {formatDate(customer.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="loyalty-cell">
                                                <div className={`level-tag ${customer.loyalty_level}`}>
                                                    <Star size={12} fill="currentColor" />
                                                    {customer.loyalty_level.toUpperCase()}
                                                </div>
                                                <p className="points-text"><strong>{(customer.points || 0).toLocaleString()}</strong> điểm</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" onClick={() => handleView(customer)} title="Xem chi tiết">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="action-btn edit" onClick={() => handleEdit(customer)} title="Sửa">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(customer.id)} title="Khóa/Xóa">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <AlertCircle size={48} className="text-gray-300 mb-4" />
                        <h3>Không tìm thấy khách hàng</h3>
                        <p>Không có dữ liệu khách hàng nào khớp với tìm kiếm của bạn.</p>
                    </div>
                )}
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                type="customer"
                onSuccess={fetchCustomers}
                readOnly={isReadOnly}
            />

            <style jsx>{`
                .admin-users-page { padding: 1.5rem 2rem; }
                .page-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-end; 
                    margin-bottom: 2.5rem; 
                }
                .table-container { padding: 1.5rem; }
                .table-toolbar { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
                .search-box {
                    position: relative; width: 320px;
                }
                .search-icon {
                    position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
                    color: #94a3b8; pointer-events: none;
                }
                .search-box input {
                    width: 100%; padding: 0.6rem 1rem 0.6rem 2.8rem;
                    border: 1px solid #e2e8f0; border-radius: 20px;
                    background: #f8fafc; transition: all 0.2s; font-size: 0.9rem;
                }
                .search-box input:focus {
                    background: white; border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px var(--primary-light);
                }
                
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th {
                    text-align: left; padding: 1rem; color: #64748b; font-size: 0.85rem; font-weight: 600;
                    text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;
                }
                .modern-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                .modern-table tbody tr:hover { background: #f8fafc; }
                
                .user-info-cell { display: flex; align-items: center; gap: 1rem; }
                .avatar {
                    width: 36px; height: 36px; border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #4f46e5);
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 1.1rem;
                }
                
                .contact-cell { display: flex; flex-direction: column; gap: 0.25rem; }
                .contact-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #475569; }
                
                .gender-badge {
                    padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500;
                }
                .gender-badge.male { background: #e0f2fe; color: #0284c7; }
                .gender-badge.female { background: #fce7f3; color: #db2777; }
                .gender-badge.other { background: #f3f4f6; color: #4b5563; }
                
                .action-buttons { display: flex; gap: 0.5rem; }
                .action-btn {
                    width: 32px; height: 32px; border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s; background: transparent; border: none; cursor: pointer;
                }
                .action-btn.view { color: #64748b; }
                .action-btn.view:hover { background: #f1f5f9; color: #0f172a; }
                .action-btn.edit { color: #0284c7; }
                .action-btn.edit:hover { background: #e0f2fe; }
                .action-btn.delete { color: #ef4444; }
                .action-btn.delete:hover { background: #fee2e2; }

                .empty-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 4rem 0; text-align: center;
                }
                .empty-state h3 { font-size: 1.1rem; color: #1e293b; margin-bottom: 0.5rem; }
                .empty-state p { color: #64748b; font-size: 0.95rem; }

                .loyalty-cell { display: flex; flex-direction: column; gap: 0.3rem; }
                .level-tag {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    padding: 0.2rem 0.6rem; border-radius: 4px;
                    font-size: 0.65rem; font-weight: 800; width: fit-content;
                }
                .level-tag.bronze { background: #fef3c7; color: #92400e; }
                .level-tag.silver { background: #f1f5f9; color: #475569; }
                .level-tag.gold { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
                .points-text { font-size: 0.8rem; color: #64748b; }
                .points-text strong { color: var(--secondary); }
            `}</style>
        </div>
    );
};

export default AdminCustomers;
