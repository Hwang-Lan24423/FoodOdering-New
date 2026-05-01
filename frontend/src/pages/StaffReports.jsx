import React, { useState, useEffect, useRef } from 'react';
import { 
    FileText, 
    Download, 
    Send, 
    Calendar, 
    CheckCircle2,
    ArrowRight,
    Loader2
} from 'lucide-react';
import api from '../api/axios';

const StaffReports = () => {
    const [period, setPeriod] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const dateInputRef = useRef(null);

    useEffect(() => {
        fetchRealReport();
    }, [period, selectedDate]);

    const fetchRealReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/orders/stats?period=${period}&date=${selectedDate}`);
            setReportData(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy báo cáo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReport = () => {
        setIsSent(true);
        // Phát sự kiện thông báo lên hệ thống (bắt bởi chuông thông báo)
        const event = new CustomEvent('system-notification', { 
            detail: { 
                id: Date.now(), 
                message: 'Báo cáo đã được gửi cho Admin thành công!', 
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
            } 
        });
        window.dispatchEvent(event);

        setTimeout(() => setIsSent(false), 3000);
    };

    const handleCalendarClick = () => {
        dateInputRef.current.showPicker();
    };

    const formatDateDisplay = () => {
        const date = new Date(selectedDate);
        if (period === 'daily') return `Ngày: ${date.toLocaleDateString('vi-VN')}`;
        if (period === 'weekly') return `Tuần của ngày: ${date.toLocaleDateString('vi-VN')}`;
        return `Tháng: ${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <div className="staff-reports">
            <header className="dashboard-header">
                <div className="header-title">
                    <h1>Báo cáo Bán hàng</h1>
                    <p>Dữ liệu thực tế được tổng hợp tự động từ các đơn hàng đã hoàn thành.</p>
                </div>
                <div className="header-actions">
                    <button 
                        className={`btn-action ${isSent ? 'btn-complete' : 'btn-prepare'}`}
                        onClick={handleSendReport}
                        disabled={isSent || reportData.length === 0}
                    >
                        {isSent ? <CheckCircle2 size={18} /> : <Send size={18} />}
                        <span>{isSent ? 'Đã gửi báo cáo' : 'Gửi cho Admin'}</span>
                    </button>
                </div>
            </header>

            <div className="dashboard-controls glass-card">
                <div className="filter-tabs">
                    <button className={`filter-btn ${period === 'daily' ? 'active' : ''}`} onClick={() => setPeriod('daily')}>Hàng ngày</button>
                    <button className={`filter-btn ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>Hàng tuần</button>
                    <button className={`filter-btn ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>Hàng tháng</button>
                </div>
                <div className="report-period-info clickable" onClick={handleCalendarClick}>
                    <Calendar size={18} className="text-primary" />
                    <span>{formatDateDisplay()}</span>
                    <input 
                        type="date" ref={dateInputRef} value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    />
                </div>
            </div>

            <div className="orders-table-wrapper glass-card">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Danh mục</th>
                            <th className="text-center">Số lượng bán</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="no-data"><Loader2 className="spin" size={24} /><p>Đang tải dữ liệu...</p></td></tr>
                        ) : reportData.length === 0 ? (
                            <tr><td colSpan="5" className="no-data">Không có dữ liệu bán hàng cho thời gian này.</td></tr>
                        ) : (
                            reportData.map((item, index) => (
                                <tr key={index}>
                                    <td className="customer-info"><strong>{item.name}</strong></td>
                                    <td><span className="status-badge status-preparing">{item.category}</span></td>
                                    <td className="text-center"><span className="order-id">{item.total_quantity}</span></td>
                                    <td><strong>{parseFloat(item.total_revenue).toLocaleString()} đ</strong></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="report-footer-actions">
                <button className="btn-icon" title="Tải xuống PDF"><Download size={20} /></button>
                <p className="text-muted small">Nhấn vào biểu tượng lịch để chọn ngày khác.</p>
            </div>
        </div>
    );
};

export default StaffReports;
