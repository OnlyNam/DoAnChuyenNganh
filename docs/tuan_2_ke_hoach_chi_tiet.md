# Kế Hoạch Chi Tiết Tuần 2: Xác Thực, Phân Quyền (RBAC) & Quản Lý Không Gian Nhóm

**Mục tiêu Tuần 2:** Hoàn thiện nền tảng định danh người dùng (**Sinh viên / Nhóm trưởng / Giảng viên hướng dẫn**), cơ chế bảo mật API bằng **JWT + Middleware RBAC**, và luồng **Khởi tạo Dự án Đồ án + Mời thành viên vào nhóm**.

---

## 1. Phân Chia Đầu Việc Theo Ngày (Checklist 7 Ngày Tuần 2)

| Giai đoạn | Hạng mục công việc | Đầu ra (Deliverables) |
| :--- | :--- | :--- |
| **Ngày 1–2: Backend Auth & JWT** | • Xây dựng API Đăng ký (`/api/auth/register`), Đăng nhập (`/api/auth/login`), Lấy thông tin phiên hiện tại (`/api/auth/me`).<br>• Mã hóa mật khẩu bằng `bcryptjs` và cấp phát `JWT Access Token`. | Bộ API `/api/auth/*` hoạt động hoàn chỉnh. |
| **Ngày 3: Phân quyền RBAC Middleware** | • Viết Middleware `authenticateToken` kiểm tra JWT.<br>• Viết Middleware `requireProjectRole(['LEADER', 'ADVISOR'])` kiểm tra quyền hạn của từng thành viên bên trong từng dự án cụ thể. | File `backend/src/middlewares/auth.middleware.ts`. |
| **Ngày 4: API Quản lý Nhóm & Thành viên** | • API thêm thành viên vào nhóm bằng Email hoặc MSSV (`POST /api/projects/:id/members`).<br>• API gán Giảng viên hướng dẫn (`PATCH /api/projects/:id/advisor`).<br>• API đổi vai trò Nhóm trưởng / Thành viên và xóa thành viên khỏi nhóm. | Mở rộng `project.routes.ts` với đầy đủ phân quyền. |
| **Ngày 5: Giao diện Đăng nhập & Đăng ký (Frontend)** | • Xây dựng trang `/login` và `/register` (cho phép chọn vai trò Sinh viên nhập MSSV hoặc Giảng viên).<br>• Lưu trữ trạng thái đăng nhập (Auth Context / LocalStorage) và tự động đính kèm `Bearer Token` khi gọi API. | Màn hình `/login`, `/register` và `src/lib/api.ts`. |
| **Ngày 6: Giao diện Danh sách Dự án & Modal Tạo Đồ Án** | • Xây dựng Modal **"Tạo Dự Án Đồ Án Mới"** (Chọn mẫu 9 tuần `CAPSTONE_9W`, nhập mã dự án, chọn học kỳ, mời GVHD).<br>• Xây dựng Modal **"Quản lý Thành viên Nhóm"** (Danh sách thành viên, thêm bằng MSSV/Email, phân quyền Leader/Member). | Giao diện quản lý dự án & thành viên kết nối trực tiếp với Backend. |
| **Ngày 7: Kiểm thử Tuần 2 & Viết Báo cáo Tiến độ** | • Kiểm thử các trường hợp phân quyền (VD: Thành viên thường không được xóa dự án hoặc duyệt Milestone của Giảng viên).<br>• Vẽ **Sequence Diagram** cho luồng *Đăng nhập* và *Khởi tạo Dự án 9 tuần* để đưa vào báo cáo. | Commit code Tuần 2 lên GitHub & hoàn thành Báo cáo Tuần 2. |

---

## 2. Thiết Kế Kỹ Thuật Trọng Tâm Của Tuần 2

### 2.1. Danh sách API Cần Hoàn Thiện Trong Tuần 2

1. **Module Authentication (`/api/auth`):**
   * `POST /api/auth/register`: Đăng ký tài khoản mới (kiểm tra trùng Email và trùng Mã số sinh viên `studentCode`).
   * `POST /api/auth/login`: Đăng nhập và nhận `accessToken` + danh sách các dự án đang tham gia.
   * `GET /api/auth/me`: Lấy thông tin người dùng hiện tại từ Token.

2. **Module Quản lý Dự án & Thành viên (`/api/projects`):**
   * `GET /api/projects`: Lấy danh sách dự án mà người dùng hiện tại đang tham gia (hoặc hướng dẫn).
   * `GET /api/projects/:projectId`: Lấy chi tiết 1 dự án (kèm danh sách Thành viên, Sprints, Milestones).
   * `POST /api/projects`: Tạo dự án mới + tự động sinh 9 Milestones & 4 Sprints theo mẫu.
   * `POST /api/projects/:projectId/members`: Mời sinh viên hoặc giảng viên vào nhóm qua Email hoặc MSSV (`studentCode`).
   * `DELETE /api/projects/:projectId/members/:userId`: Xóa thành viên khỏi nhóm (chỉ `LEADER` mới có quyền).
