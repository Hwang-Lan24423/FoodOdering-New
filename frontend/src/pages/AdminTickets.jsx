import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Loader2, CheckCircle2, Clock, PlayCircle, Eye, XCircle, Mail, User, Tag, Calendar } from 'lucide-react';
import api from '../api/axios';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTicketStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await api.patch(`/tickets/${id}/status`, { status: newStatus });
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
            alert(`Đã chuyển yêu cầu sang trạng thái: ${newStatus}`);
        } catch (error) {
            alert('Không thể cập nhật trạng thái yêu cầu.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = 
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'open' || s === 'pending') {
            return <span className="status-badge pending"><Clock size={12}/> Đang chờ</span>;
        }
        if (s === 'processing') {
            return <span className="status-badge processing"><PlayCircle size={12}/> Đang xử lý</span>;
        }
        if (s === 'resolved') {
            return <span className="status-badge resolved"><CheckCircle2 size={12}/> Đã giải quyết</span>;
        }
        if (s === 'rejected' || s === 'cancelled') {
            return <span className="status-badge rejected"><XCircle size={12}/> Đã từ chối</span>;
        }
        return <span className="status-badge">{status}</span>;
    };

    return (
        <div className="admin-tickets-page">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Yêu cầu hỗ trợ</h1>
                    <p>Quản lý và phản hồi các yêu cầu từ khách hàng gửi đến hệ thống.</p>
                </div>
            </header>

            <div className="dashboard-controls glass-card">
                <div className="search-bar">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo chủ đề, tên khách hàng..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {['All', 'Pending', 'Processing', 'Resolved', 'Rejected'].map(status => (
                        <button 
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'All' ? 'Tất cả' : status === 'Pending' ? 'Đang chờ' : status === 'Processing' ? 'Đang xử lý' : status === 'Resolved' ? 'Đã giải quyết' : 'Đã từ chối'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="inventory-table-wrapper glass-card">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Khách hàng</th>
                            <th>Chủ đề</th>
                            <th>Ngày gửi</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-8"><Loader2 className="spin inline" size={24}/> Đang tải...</td></tr>
                        ) : filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    <MessageSquare size={40} className="mb-2 opacity-50" />
                                    <p>Không tìm thấy yêu cầu nào.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredTickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>
                                        <div className="customer-info">
                                            <strong>{ticket.fullname}</strong>
                                            <span className="text-muted text-xs block">{ticket.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="subject-line">
                                            <span className="font-semibold">{ticket.subject}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td className="text-center">
                                        {getStatusBadge(ticket.status)}
                                    </td>
                                    <td className="text-right">
                                        <div className="action-buttons">
                                            <button className="btn-icon view" title="Xem chi tiết" onClick={() => setSelectedTicket(ticket)}>
                                                <Eye size={18} />
                                            </button>
                                            {(ticket.status?.toLowerCase() === 'pending' || ticket.status?.toLowerCase() === 'open') && (
                                                <button 
                                                    className="btn-icon process" 
                                                    title="Tiếp nhận xử lý"
                                                    onClick={() => updateTicketStatus(ticket.id, 'Processing')}
                                                    disabled={updatingId === ticket.id}
                                                >
                                                    <PlayCircle size={18} />
                                                </button>
                                            )}
                                            {ticket.status?.toLowerCase() === 'processing' && (
                                                <button 
                                                    className="btn-icon resolve" 
                                                    title="Hoàn tất giải quyết"
                                                    onClick={() => updateTicketStatus(ticket.id, 'Resolved')}
                                                    disabled={updatingId === ticket.id}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {(ticket.status?.toLowerCase() !== 'resolved' && ticket.status?.toLowerCase() !== 'rejected') && (
                                                <button 
                                                    className="btn-icon reject" 
                                                    title="Từ chối/Hủy yêu cầu"
                                                    onClick={() => {
                                                        if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
                                                            updateTicketStatus(ticket.id, 'Rejected');
                                                        }
                                                    }}
                                                    disabled={updatingId === ticket.id}
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="modal-content ticket-premium-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-banner">
                            <div className="banner-content">
                                <MessageSquare size={32} className="banner-icon" />
                                <div>
                                    <h3>Chi tiết yêu cầu</h3>
                                    <p>Mã yêu cầu: #{selectedTicket.id.toString().padStart(5, '0')}</p>
                                </div>
                            </div>
                            <button className="banner-close" onClick={() => setSelectedTicket(null)}>&times;</button>
                        </div>
                        
                        <div className="modal-body-content">
                            <div className="info-grid">
                                <div className="info-card">
                                    <div className="info-item">
                                        <div className="item-label"><User size={14}/> KHÁCH HÀNG</div>
                                        <div className="item-value"><strong>{selectedTicket.fullname}</strong></div>
                                    </div>
                                    <div className="info-item">
                                        <div className="item-label"><Mail size={14}/> EMAIL</div>
                                        <div className="item-value">{selectedTicket.email}</div>
                                    </div>
                                </div>
                                
                                <div className="info-card">
                                    <div className="info-item">
                                        <div className="item-label"><Calendar size={14}/> NGÀY GỬI</div>
                                        <div className="item-value">{new Date(selectedTicket.created_at).toLocaleString('vi-VN')}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="item-label"><Tag size={14}/> TRẠNG THÁI</div>
                                        <div className="item-value">{getStatusBadge(selectedTicket.status)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="subject-section">
                                <label>CHỦ ĐỀ:</label>
                                <h4>{selectedTicket.subject}</h4>
                            </div>

                            <div className="message-section">
                                <label>NỘI DUNG CHI TIẾT:</label>
                                <div className="message-paper">
                                    <div className="paper-header">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                    <div className="paper-content">
                                        {selectedTicket.message}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-action-footer">
                            <div className="footer-left">
                                <button className="btn-secondary-flat" onClick={() => setSelectedTicket(null)}>Đóng lại</button>
                            </div>
                            <div className="footer-right">
                                {(selectedTicket.status?.toLowerCase() !== 'resolved' && selectedTicket.status?.toLowerCase() !== 'rejected') && (
                                    <button className="btn-reject-flat" onClick={() => {
                                        if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
                                            updateTicketStatus(selectedTicket.id, 'Rejected');
                                        }
                                    }}>
                                        <XCircle size={18} /> Từ chối
                                    </button>
                                )}
                                {(selectedTicket.status?.toLowerCase() === 'pending' || selectedTicket.status?.toLowerCase() === 'open') && (
                                    <button className="btn-process-flat" onClick={() => updateTicketStatus(selectedTicket.id, 'Processing')}>
                                        <PlayCircle size={18} /> Tiếp nhận ngay
                                    </button>
                                )}
                                {selectedTicket.status?.toLowerCase() === 'processing' && (
                                    <button className="btn-resolve-flat" onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved')}>
                                        <CheckCircle2 size={18} /> Hoàn tất giải quyết
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-tickets-page { padding: 1.5rem 2rem; }
                .dashboard-header { margin-bottom: 2.5rem; }
                
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .status-badge.pending { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
                .status-badge.processing { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
                .status-badge.resolved { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
                .status-badge.rejected { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

                /* Modal Overlay */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }

                /* Premium Modal Styling */
                .ticket-premium-modal {
                    max-width: 700px;
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
                    padding: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: white;
                }

                .banner-content { display: flex; align-items: center; gap: 1.5rem; }
                .banner-icon { color: rgba(255, 255, 255, 0.2); }
                .banner-content h3 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; }
                .banner-content p { margin: 0.2rem 0 0 0; font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
                .banner-close { background: none; border: none; color: white; font-size: 2rem; cursor: pointer; opacity: 0.5; transition: 0.2s; }
                .banner-close:hover { opacity: 1; }

                .modal-body-content { padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; }
                
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .info-card { background: #f8fafc; padding: 1.2rem; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 1rem; }
                
                .info-item .item-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 6px; margin-bottom: 0.3rem; }
                .info-item .item-value { font-size: 0.95rem; color: #1e293b; }

                .subject-section { margin-bottom: 2rem; border-left: 4px solid var(--primary); padding-left: 1.5rem; }
                .subject-section label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 0.3rem; }
                .subject-section h4 { margin: 0; font-size: 1.2rem; color: #1e293b; font-weight: 800; }

                .message-section label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 0.8rem; }
                .message-paper { background: #fdfdfd; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
                .paper-header { background: #f8fafc; padding: 0.6rem 1rem; border-bottom: 1px solid #e2e8f0; display: flex; gap: 6px; }
                .paper-header .dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; }
                .paper-content { padding: 1.5rem; line-height: 1.8; color: #334155; font-size: 1rem; min-height: 120px; white-space: pre-wrap; }

                .modal-action-footer { padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .footer-right { display: flex; gap: 1rem; }

                .btn-secondary-flat { background: transparent; border: none; color: #64748b; font-weight: 700; cursor: pointer; font-size: 0.95rem; }
                .btn-secondary-flat:hover { color: #1e293b; }

                .btn-process-flat, .btn-resolve-flat, .btn-reject-flat {
                    display: flex; align-items: center; gap: 8px; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; border: none; cursor: pointer; transition: 0.2s;
                }

                .btn-process-flat { background: #6366f1; color: white; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); }
                .btn-process-flat:hover { background: #4f46e5; transform: translateY(-2px); }

                .btn-resolve-flat { background: #10b981; color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
                .btn-resolve-flat:hover { background: #059669; transform: translateY(-2px); }

                .btn-reject-flat { background: white; color: #dc2626; border: 1px solid #fecaca; }
                .btn-reject-flat:hover { background: #fef2f2; transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

export default AdminTickets;
