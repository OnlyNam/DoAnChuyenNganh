# Kế Hoạch Chi Tiết Tuần 3: Quản Lý Backlog, Epics & Công Việc (Issue CRUD)

**Mục tiêu Tuần 3:** Xây dựng hoàn chỉnh phân hệ **Quản lý Danh sách Công việc (Product Backlog)**, **Nhóm hạng mục lớn (Epics)** và đầy đủ các thao tác **Thêm / Xem / Sửa / Xóa / Tìm kiếm / Lọc Công việc (Issue CRUD)** theo đúng chuẩn Scrum/Jira dành cho nhóm sinh viên.

---

## 1. Phân Chia Đầu Việc Theo Ngày (Checklist 7 Ngày Tuần 3)

| Giai đoạn | Hạng mục công việc | Đầu ra (Deliverables) |
| :--- | :--- | :--- |
| **Ngày 1: Backend API Quản lý Epics** | • Xây dựng CRUD cho bảng `epics` (`GET`, `POST`, `PATCH`, `DELETE /api/epics`).<br>• Tính toán tự động tiến độ % hoàn thành của từng Epic dựa trên số Issue và Story Points. | File `backend/src/routes/epic.routes.ts`. |
| **Ngày 2–3: Hoàn thiện Issue CRUD & Auto-Key Generator** | • Nâng cấp API tạo Issue với cơ chế sinh mã tự động theo Transaction (`DACN01-1`, `DACN01-2`...).<br>• Bổ sung API cập nhật toàn diện Issue (`PATCH /api/issues/:id`) và xóa Issue (`DELETE /api/issues/:id`).<br>• Hỗ trợ lọc đa tiêu chí: Từ khóa, Epic, Sprint/Backlog, Loại công việc, Độ ưu tiên, Người phụ trách. | Nâng cấp `backend/src/routes/issue.routes.ts`. |
| **Ngày 4: Giao diện Backlog & Quản lý Epics** | • Xây dựng màn hình **Backlog & Epics View** chia làm 2 khu vực giống Jira: **Active Sprint** (phía trên) và **Product Backlog** (phía dưới).<br>• Hiển thị thẻ Epics kèm mã màu và thanh tiến độ hoàn thành. | Component `BacklogAndEpicsView.tsx`. |
| **Ngày 5: Modal Tạo / Chỉnh sửa Issue chuẩn Scrum** | • Xây dựng Modal `IssueFormModal` cho phép tạo mới hoặc chỉnh sửa công việc.<br>• Tích hợp chọn loại công việc đặc thù sinh viên (`STORY`, `TASK`, `BUG`, `REPORT` - viết báo cáo), ước lượng điểm **Story Points theo dãy Fibonacci (`1, 2, 3, 5, 8, 13`)**, gán thành viên nhóm và hạn chót. | Component `IssueFormModal.tsx`. |
| **Ngày 6: Thanh Tìm kiếm, Bộ lọc & Luân chuyển Backlog $\leftrightarrow$ Sprint** | • Xây dựng thanh lọc tức thời theo Tên/Mã, Thành viên, Epic, Loại task và Độ ưu tiên.<br>• Nút chuyển nhanh công việc từ **Product Backlog $\rightarrow$ Active Sprint** (và ngược lại). | Tích hợp hoàn chỉnh vào `src/app/page.tsx`. |
| **Ngày 7: Kiểm thử Tuần 3 & Cập nhật Báo cáo** | • Kiểm thử luồng tạo Epic $\rightarrow$ tạo Issue $\rightarrow$ lọc danh sách $\rightarrow$ đẩy lên Sprint Kanban.<br>• Vẽ Activity Diagram & Sequence Diagram cho chức năng Quản lý Backlog/Issue. | Commit code Tuần 3 lên GitHub & cập nhật tài liệu báo cáo. |
