# Hệ Thống Quản Lý Dự Án Phần Mềm Dành Cho Nhóm Sinh Viên (StudentJira)

Đồ án chuyên ngành xây dựng hệ thống quản lý dự án theo mô hình Agile/Scrum (tương tự Jira) được thiết kế chuyên biệt cho **nhóm sinh viên làm đồ án** và **Giảng viên hướng dẫn**.

## 🌟 Điểm Nhấn Cốt Lõi Của Đồ Án
1. **Academic Project Templates (`CAPSTONE_9W`):** Khởi tạo dự án 1-click tự động sinh sẵn 9 mốc báo cáo tuần (`Milestones`) và 4 `Sprints` chuẩn đồ án chuyên ngành.
2. **Kanban Board Kéo-Thả với Floating-Point Position & Socket.io:** Cập nhật vị trí thẻ công việc với độ phức tạp $O(1)$ Database Update và đồng bộ thời gian thực.
3. **Cổng Giảng Viên Duyệt Mốc Tiến Độ (Advisor Milestone Review):** Nhóm trưởng nộp báo cáo định kỳ hàng tuần, Giảng viên hướng dẫn vào nhận xét, duyệt trạng thái (`APPROVED` / `CHANGES_REQUESTED`) và chấm điểm quá trình.
4. **Thuật Toán Tính Điểm Đóng Góp & Chống "Gánh Team" (Anti Free-Rider Analytics):**
   - Kết hợp 50% Khối lượng Story Points + 30% Tỷ lệ hoàn thành đúng hạn + 20% Đánh giá chéo ẩn danh (Peer Evaluation).
   - Tự động gắn cờ cảnh báo nếu thành viên có mức đóng góp dưới 40% trung bình nhóm.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
student-project-management/
├── docker-compose.yml          # Khởi chạy nhanh PostgreSQL 16
├── backend/                    # Node.js + Express + TypeScript + Prisma + Socket.io
│   ├── prisma/
│   │   ├── schema.prisma       # Thiết kế CSDL đầy đủ (12 bảng & 8 Enums)
│   │   └── seed.ts             # Script tạo dữ liệu mẫu (GVHD, 4 Sinh viên, Sprints, Issues)
│   └── src/
│       ├── config/prisma.ts
│       ├── utils/
│       │   ├── contribution.calculator.ts # Thuật toán tính điểm đóng góp & Vị trí Kanban
│       │   └── template.generator.ts      # Bộ sinh mẫu đồ án 9 tuần tự động
│       ├── routes/
│       │   ├── project.routes.ts
│       │   ├── issue.routes.ts
│       │   └── milestone.routes.ts
│       └── index.ts
└── frontend/                   # Next.js + React + TypeScript + Tailwind CSS
    └── src/
        ├── types/project.types.ts
        └── app/page.tsx        # Giao diện Kanban Board, Cổng Giảng Viên & Thống kê Đóng góp
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### Bước 1: Khởi động PostgreSQL bằng Docker
```bash
docker compose up -d
```

### Bước 2: Chạy Backend & Khởi tạo Database Mẫu
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### Bước 3: Chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại `http://localhost:3000` và API tại `http://localhost:4000/api/health`.
