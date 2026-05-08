import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Calendar, Loader2, AlertCircle, ShieldCheck, Eye } from 'lucide-react';
import api from '../api/axios';
import UserModal from '../components/Modals/UserModal';

const AdminStaffs = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users?type=staff');
            setStaffs(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffs();
    }, []);

    const filteredStaffs = staffs.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.contact && staff.contact.includes(searchTerm))
    );

    const handleAdd = () => {
        setEditingUser(null);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleEdit = (staff) => {
        setEditingUser(staff);
        setIsReadOnly(false);
        setIsModalOpen(true);
    };

    const handleView = (staff) => {
        setEditingUser(staff);
        setIsReadOnly(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("CẢNH BÁO: Bạn đang xóa nhân viên của hệ thống. Tài khoản này sẽ bị khóa và mất quyền truy cập. Bạn có chắc chắn?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchStaffs();
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Nhân viên</h1>
                    <p className="text-gray-500">Quản lý đội ngũ nhân viên và phân quyền truy cập hệ thống.</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={handleAdd}>
                    <Plus size={18} /> Thêm Nhân viên
                </button>
            </header>

            <div className="glass-card table-container">
                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nhân viên..." 
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
                ) : filteredStaffs.length > 0 ? (
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Nhân viên</th>
                                    <th>Liên hệ</th>
                                    <th>Chức vụ</th>
                                    <th>Ngày vào làm</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.map(staff => (
                                    <tr key={staff.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="avatar staff-avatar">{staff.name.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{staff.name}</p>
                                                    <p className="text-xs text-gray-500">@{staff.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-cell">
                                                <div className="contact-item"><Mail size={14}/> {staff.email}</div>
                                                {staff.contact && <div className="contact-item"><Phone size={14}/> {staff.contact}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="role-badge">
                                                <ShieldCheck size={14} /> Nhân viên
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                <Calendar size={14} /> {formatDate(staff.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" onClick={() => handleView(staff)} title="Xem chi tiết">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="action-btn edit" onClick={() => handleEdit(staff)} title="Sửa">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(staff.id)} title="Khóa/Xóa">
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
                        <h3>Không tìm thấy nhân viên</h3>
                        <p>Không có dữ liệu nhân viên nào khớp với tìm kiếm của bạn.</p>
                    </div>
                )}
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                type="staff"
                onSuccess={fetchStaffs}
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
                .search-box { position: relative; width: 320px; }
                .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
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
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 1.1rem;
                }
                .staff-avatar { background: linear-gradient(135deg, #10b981, #059669); }
                
                .contact-cell { display: flex; flex-direction: column; gap: 0.25rem; }
                .contact-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #475569; }
                
                .role-badge {
                    display: inline-flex; align-items: center; gap: 0.3rem;
                    padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500;
                    background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;
                }
                
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
            `}</style>
        </div>
    );
};

export default AdminStaffs;
