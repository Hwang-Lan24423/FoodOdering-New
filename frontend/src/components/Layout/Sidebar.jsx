import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    MessageSquare, 
    BarChart3, 
    User, 
    LogOut,
    ChefHat,
    Settings,
    FileText,
    Archive,
    Users,
    UserCircle,
    Ticket
} from 'lucide-react';

const Sidebar = ({ pendingCount = 0, ticketCount = 0 }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('user_role');

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    const menuItems = [
        { 
            title: 'Dashboard', 
            icon: <LayoutDashboard size={20} />, 
            path: '/staff/dashboard',
            roles: ['2']
        },
        { 
            title: 'Dashboard', 
            icon: <LayoutDashboard size={20} />, 
            path: '/admin/dashboard',
            roles: ['3']
        },
        { 
            title: 'Đơn hàng', 
            icon: <ShoppingBag size={20} />, 
            path: role === '3' ? '/admin/orders' : '/staff/orders', 
            roles: ['2', '3']
        },
        { 
            title: 'Kho thực phẩm', 
            icon: <Archive size={20} />, 
            path: role === '3' ? '/admin/inventory' : '/staff/inventory', 
            roles: ['2', '3']
        },
        { 
            title: 'Báo cáo', 
            icon: <FileText size={20} />, 
            path: '/staff/reports', 
            roles: ['2']
        },
        { 
            title: 'Thống kê', 
            icon: <BarChart3 size={20} />, 
            path: '/admin/analytics', 
            roles: ['3']
        },
        { 
            title: 'Khách hàng', 
            icon: <Users size={20} />, 
            path: '/admin/customers', 
            roles: ['3']
        },
        { 
            title: 'Nhân viên', 
            icon: <UserCircle size={20} />, 
            path: '/admin/staffs', 
            roles: ['3']
        },
        { 
            title: 'Yêu cầu', 
            icon: <MessageSquare size={20} />, 
            path: '/admin/tickets', 
            roles: ['3']
        },
        { 
            title: 'Mã giảm giá', 
            icon: <Ticket size={20} />, 
            path: '/admin/coupons', 
            roles: ['3']
        },
        { 
            title: 'Hồ sơ', 
            icon: <User size={20} />, 
            path: '/profile', 
            roles: ['2', '3']
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <ChefHat className="logo-icon" size={28} />
                <span>BakenTake <small>Portal</small></span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <p className="group-title">Main Menu</p>
                    {menuItems.filter(item => item.roles.includes(role)).map((item, index) => (
                        <NavLink 
                            key={index} 
                            to={item.path} 
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.title}</span>
                            {item.title === 'Đơn hàng' && pendingCount > 0 && (
                                <span className="menu-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>
                            )}
                            {item.title === 'Yêu cầu' && ticketCount > 0 && (
                                <span className="menu-badge ticket-badge">{ticketCount > 99 ? '99+' : ticketCount}</span>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div className="nav-group system-group">
                    <p className="group-title">System</p>
                    <button onClick={handleLogout} className="sidebar-link logout-link">
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-brief">
                    <div className="avatar">
                        {role === '3' ? 'AD' : 'ST'}
                    </div>
                    <div className="info">
                        <p>{role === '3' ? 'Quản trị viên' : 'Nhân viên'}</p>
                        <span>Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
