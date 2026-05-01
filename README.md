# 🍕 Bake n Take - Hệ Thống Đặt Đồ Ăn Trực Tuyến

**Bake n Take** là một nền tảng thương mại điện tử hiện đại dành cho việc đặt bánh và đồ uống. Dự án được xây dựng với kiến trúc tách biệt hoàn toàn giữa Backend (Laravel) và Frontend (React), mang lại trải nghiệm người dùng mượt mà và khả năng quản lý chuyên nghiệp.

---

## 🚀 Tính Năng Chính

### 👨‍💻 Dành cho Khách Hàng (Customer)
*   **Đăng ký & Đăng nhập:** Bảo mật, hỗ trợ xác thực qua email.
*   **Menu Đa dạng:** Xem danh sách bánh, trà sữa với thông tin chi tiết và hình ảnh.
*   **Giỏ hàng thông minh:** Thêm, xóa và cập nhật số lượng món ăn dễ dàng.
*   **Thanh toán Trực tuyến:** Quy trình đặt hàng nhanh chóng và tin cậy.
*   **Theo dõi Đơn hàng:** Cập nhật trạng thái giao hàng thời gian thực.
*   **Hỗ trợ AI Chatbot:** Giải đáp thắc mắc khách hàng tự động 24/7.
*   **Hệ thống Ticket:** Gửi yêu cầu hỗ trợ trực tiếp đến quản trị viên.

### 🧑‍🍳 Dành cho Nhân Viên (Staff)
*   **Quản lý Đơn hàng:** Cập nhật trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao).
*   **Quản lý Thực đơn:** Điều chỉnh giá và trạng thái còn hàng/hết hàng.
*   **Quản lý Kho:** Theo dõi số lượng nguyên liệu và sản phẩm.
*   **Báo cáo Doanh thu:** Cập nhật doanh số bán hàng hàng ngày.

### 👑 Dành cho Quản Trị Viên (Admin/Owner)
*   **Bảng Điều Khiển (Dashboard):** Xem tổng quan doanh thu qua biểu đồ (Bar Chart & Line Chart).
*   **Quản lý Người Dùng:** Quản lý thông tin khách hàng và nhân viên.
*   **Toàn quyền Hệ thống:** Quản lý chatbot và cấu hình hệ thống.
*   **Xử lý yêu cầu:** Xử lí yêu cầu của khách hàng gửi đến hệ thống.
*   **Phân quyền:** Phân quyền truy cập cho các vai trò.
*   **Quản lý thực đơn:** Thêm món mới, quản lý danh mục, cập nhật giá cả.
*   **Báo cáo doanh thu:** Xem báo cáo doanh thu chi tiết theo thời gian.

---

## 🛠 Công Nghệ Sử Dụng

### Backend
- **Framework:** Laravel 11
- **Xác thực:** Laravel Sanctum (API Token)
- **Cơ sở dữ liệu:** MySQL
- **Real-time:** Laravel Reverb/Echo (Notifications)

### Frontend
- **Framework:** React (Vite)
- **Styling:** Vanilla CSS & Modern UI/UX Design
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Animations:** Framer Motion (cho hiệu ứng mượt mà)

---

## 📋 Yêu Cầu Hệ Thống

Cài các chương trình sau:
- [PHP](https://www.php.net/downloads.php)
- [Composer](https://getcomposer.org/)
- [Node.js & npm](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/index.html) 

---

## 🛠 Hướng Dẫn Cài Đặt Chi Tiết

### 1. Tải Mã Nguồn
```bash
git clone https://github.com/Hwang-Lan24423/FoodOdering-New.git
cd Online-Food-Ordering-System
```

### 2. Cài Đặt Backend (Laravel)
Di chuyển vào thư mục backend:
```bash
cd backend
```

Cài đặt các thư viện PHP:
```bash
composer install
```

Cấu hình môi trường:
- Copy file `.env.example` thành `.env`:
  ```bash
  cp .env.example .env
  ```
- Mở file `.env` và cấu hình Database (DB_DATABASE, DB_USERNAME, DB_PASSWORD).
- Tạo App Key:
  ```bash
  php artisan key:generate
  ```

Khởi tạo Cơ sở dữ liệu và Dữ liệu mẫu:
```bash
php artisan migrate --seed
```

### 3. Cài Đặt Frontend (React)
Di chuyển vào thư mục frontend:
```bash
cd ../frontend
```

Cài đặt các thư viện JavaScript:
```bash
npm install
```

---

## 🏃‍♂️ Cách Chạy Ứng Dụng

Để dự án hoạt động, bạn cần chạy cả Backend và Frontend đồng thời:

### Bước 1: Chạy Backend Server
Mở một terminal mới tại thư mục `backend`:
```bash
php artisan serve
```
*Server sẽ chạy tại: `http://localhost:8000`*

### Bước 2: Chạy Frontend Server
Mở một terminal khác tại thư mục `frontend`:
```bash
npm run dev
```
*Ứng dụng sẽ chạy tại: `http://localhost:5173` (hoặc cổng được hiển thị trên terminal)*

---

## 📂 Cấu Trúc Thư Mục
- `/backend`: Chứa mã nguồn Laravel (API, Models, Migrations, Seeders).
- `/frontend`: Chứa mã nguồn React (Components, Pages, Assets).

---

Github:
- **GitHub:** [Hwang-Lan24423](https://github.com/Hwang-Lan24423)
