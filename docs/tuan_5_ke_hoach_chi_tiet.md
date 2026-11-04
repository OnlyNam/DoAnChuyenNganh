# Kế Hoạch Chi Tiết Tuần 5: Chi Tiết Công Việc (Issue Detail Drawer), Subtasks, Bình Luận & Nhật Ký Hoạt Động

**Mục tiêu Tuần 5:** Xây dựng không gian cộng tác chuyên sâu bên trong từng công việc: **Chia nhỏ đầu việc con (Subtasks Checklist)**, **Thảo luận nhóm (`Comments` hỗ trợ `@mention`)**, **Đính kèm tài liệu/link PR (`Attachments`)** và **Lưu vết lịch sử thay đổi (`Activity Logs`)**.

---

## 1. Phân Chia Đầu Việc & Lịch Commit Theo Ngày (Tuần 5)

| Ngày thực hiện | Nội dung công việc & Commit tương ứng |
| :--- | :--- |
| **Ngày 1 (04/11)** | • `docs(week5): add week 5 issue detail collaboration and activity log plan` |
| **Ngày 2 (05/11)** | • `feat(collaboration): implement Subtasks, Comments, Attachments and ActivityLog API routes` |
| **Ngày 3 (06/11)** | • `feat(frontend): build IssueDetailDrawer with subtasks checklist, comments and activity timeline` |

---

## 2. Thiết Kế Kỹ Thuật Trọng Tâm Của Tuần 5

1. **Quản lý Subtasks Checklist (`/api/collaboration/issues/:issueId/subtasks`):**
   * Mỗi công việc lớn (`STORY` / `TASK` / `REPORT`) có thể chia nhỏ thành nhiều `Subtask`.
   * Tự động tính thanh tiến độ `% Subtasks hoàn thành` ngay trên thẻ Kanban và bên trong Drawer.
2. **Thảo luận & Đính kèm Minh chứng (`/api/collaboration/issues/:issueId/comments` & `/attachments`):**
   * Sinh viên gắn link nhánh code GitHub, link Figma hoặc file báo cáo trực tiếp vào công việc để Nhóm trưởng và Giảng viên kiểm tra.
3. **Nhật ký Hoạt động Tự động (`ActivityLog`):**
   * Mọi thao tác đổi trạng thái, thêm bình luận, hoàn thành subtask đều được ghi nhận kèm mốc thời gian.
