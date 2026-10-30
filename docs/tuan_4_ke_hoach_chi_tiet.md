# Kế Hoạch Chi Tiết Tuần 4: Quản Lý Chu Kỳ Sprint & Bảng Kanban Kéo-Thả (Drag & Drop)

**Mục tiêu Tuần 4:** Xây dựng trái tim của quy trình Scrum/Agile trên hệ thống: **Vòng đời Sprint (`PLANNED` -> `ACTIVE` -> `COMPLETED`)**, xử lý tự động các công việc chưa hoàn thành khi kết thúc Sprint, và **Bảng Kanban Kéo-Thả trực quan** với thuật toán cập nhật vị trí $O(1)$.

---

## 1. Lịch Trình Chia Nhỏ Commit & Đẩy Lên GitHub Theo Từng Ngày

| Ngày thực hiện | Nội dung công việc & Commit tương ứng |
| :--- | :--- |
| **Ngày 1 (30/10)** | • `docs(week4): add week 4 sprint lifecycle and kanban drag-drop plan`<br>• `feat(sprints): implement Sprint CRUD, Start Sprint and Complete Sprint rollover API` |
| **Ngày 2 (31/10)** | • `feat(backend): register sprint routes and enhance kanban position calculation` |
| **Ngày 3 (01/11)** | • `feat(frontend): add SprintItem interfaces and sprint lifecycle types` |
| **Ngày 4 (02/11)** | • `feat(frontend): build SprintLifecycleModal with incomplete issues rollover option` |
| **Ngày 5 (03/11)** | • `feat(kanban): implement interactive Drag-and-Drop Kanban board and My Issues filter` |

---

## 2. Thiết Kế Kỹ Thuật Trọng Tâm Của Tuần 4

1. **Quản lý Vòng đời Sprint (`/api/sprints`):**
   * `GET /api/sprints/project/:projectId`: Lấy danh sách Sprints kèm số lượng Issues đã hoàn thành và chưa hoàn thành.
   * `POST /api/sprints/project/:projectId`: Tạo Sprint mới kèm mục tiêu (`goal`) và thời gian bắt đầu/kết thúc.
   * `PATCH /api/sprints/:sprintId/start`: Kích hoạt Sprint (`ACTIVE`), đảm bảo mỗi dự án chỉ chạy 1 Sprint tại 1 thời điểm.
   * `POST /api/sprints/:sprintId/complete`: Kết thúc Sprint (`COMPLETED`) và tự động chuyển các công việc tồn đọng (chưa `DONE`) sang Sprint tiếp theo hoặc trả về `Product Backlog`.
2. **Kéo-Thả Kanban Board (HTML5 Drag & Drop + Floating Position):**
   * Kéo thả trực tiếp thẻ công việc giữa 4 cột `TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`.
   * Bộ lọc nhanh **"👤 Công việc của tôi (My Issues)"** trên Bảng Kanban.
