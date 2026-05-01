import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './Layout/Navbar';
import DashboardLayout from './Layout/DashboardLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Menu from '../pages/Menu';
import About from '../pages/About';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Profile from '../pages/Profile';
import Support from '../pages/Support';
import StaffDashboard from '../pages/StaffDashboard';
import StaffOrders from '../pages/StaffOrders';
import AdminDashboard from '../pages/AdminDashboard';
import StaffReports from '../pages/StaffReports';
import StaffInventory from '../pages/StaffInventory';
import AdminCustomers from '../pages/AdminCustomers';
import AdminStaffs from '../pages/AdminStaffs';
import AdminTickets from '../pages/AdminTickets';
import Chatbot from './Support/Chatbot';

const AppContent = () => {
    const location = useLocation();
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('auth_token');

    // Các trang công cộng luôn dùng giao diện chính
    const publicPaths = ['/', '/login', '/register', '/about', '/verify-email', '/forgot-password', '/reset-password'];
    const isPublicPath = publicPaths.some(path => location.pathname === path || location.pathname.startsWith('/verify-email'));

    // Nếu là Staff (2) hoặc Admin (3) và không ở trang public, dùng DashboardLayout
    const isManagement = (role === '2' || role === '3') && token && !isPublicPath;

    if (isManagement) {
        return (
            <DashboardLayout>
                <Routes>
                    <Route path="/staff/dashboard" element={<StaffDashboard />} />
                    <Route path="/staff/orders" element={<StaffOrders />} />
                    <Route path="/staff/inventory" element={<StaffInventory />} />
                    <Route path="/staff/reports" element={<StaffReports />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/customers" element={<AdminCustomers />} />
                    <Route path="/admin/staffs" element={<AdminStaffs />} />
                    <Route path="/admin/tickets" element={<AdminTickets />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                    {/* Fallback cho management */}
                    <Route path="*" element={<Navigate to={role === '3' ? "/admin/dashboard" : "/staff/dashboard"} />} />
                </Routes>
            </DashboardLayout>
        );
    }

    return (
        <div className="app-wrapper">
            {!isManagement && <Navbar />}
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/verify-email/:id/:hash" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/staff/dashboard" element={<StaffDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
            </main>
            {!isManagement && <Chatbot />}
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
