# Tuần 1: Phân Tích Yêu Cầu & Thiết Kế Hệ Thống (SRS & Database Design)

> [!NOTE]
> Tài liệu này được biên soạn theo chuẩn cấu trúc **Chương 2 (Phân tích và Thiết kế hệ thống)** của Báo cáo Đồ án Chuyên ngành. Bạn có thể sử dụng trực tiếp các sơ đồ, bảng biểu và công thức dưới đây vào cuốn báo cáo của mình.

---

## 1. Phân Tích Tác Nhân (Actors) & Ma Trận Phân Quyền (RBAC)

Hệ thống bao gồm **2 cấp độ phân quyền**:
1. **System Role (Vai trò toàn hệ thống):** `STUDENT` (Sinh viên), `LECTURER` (Giảng viên), `ADMIN` (Quản trị viên).
2. **Project Role (Vai trò trong từng dự án đồ án):** `LEADER` (Nhóm trưởng), `MEMBER` (Thành viên), `ADVISOR` (Giảng viên hướng dẫn).

| Nhóm chức năng | Thành viên (`MEMBER`) | Nhóm trưởng (`LEADER`) | Giảng viên (`ADVISOR`) |
| :--- | :---: | :---: | :---: |
| Khởi tạo dự án từ Template (9 tuần / 15 tuần) | ❌ | ✅ | ✅ |
| Mời/Xóa thành viên, Gán Giảng viên hướng dẫn | ❌ | ✅ | ❌ |
| Tạo/Sửa/Xóa Sprint, Bắt đầu & Kết thúc Sprint | ❌ | ✅ | 👁️ (Chỉ xem) |
| Tạo Issue/Task, Kéo thả Kanban, Bình luận, Đính kèm file | ✅ | ✅ | 👁️ (Xem & Nhận xét) |
| Nộp Báo cáo Mốc tiến độ tuần (Milestone Submission) | ❌ | ✅ | ❌ |
| Duyệt Mốc tiến độ, Nhận xét & Chấm điểm giai đoạn | ❌ | 👁️ (Xem kết quả) | ✅ |
| Đánh giá chéo đồng đội cuối Sprint (Peer Evaluation) | ✅ | ✅ | 👁️ (Xem tổng hợp) |
| Xem Dashboard tiến độ & Bảng thống kê đóng góp | ✅ | ✅ | ✅ (Chi tiết) |

---

## 2. Sơ Đồ Use Case & Đặc Tả Nghiệp Vụ Cốt Lõi

### 2.1. Sơ đồ Use Case Tổng quát

```mermaid
flowchart LR
    SV["👤 Sinh viên (Member)"]
    NT["👑 Nhóm trưởng (Leader)"]
    GV["🎓 Giảng viên (Advisor)"]

    NT -->|Kế thừa toàn bộ quyền| SV

    subgraph UC_Project["1. Quản lý Không gian Dự án"]
        UC1["Khởi tạo Dự án theo Template Đồ án"]
        UC2["Quản lý Thành viên & Mời Giảng viên"]
    end

    subgraph UC_Agile["2. Quản lý Backlog, Sprint & Kanban"]
        UC3["Quản lý Epic & Backlog (Issue CRUD)"]
        UC4["Hoạch định, Bắt đầu & Kết thúc Sprint"]
        UC5["Kéo thả cập nhật trạng thái trên Kanban Board"]
        UC6["Thảo luận (Comment), Subtasks & Đính kèm tệp"]
    end

    subgraph UC_Academic["3. Cổng Giảng viên & Chống 'Gánh team'"]
        UC7["Nộp Báo cáo Mốc tiến độ (Milestone)"]
        UC8["Duyệt tiến độ, Phản hồi & Chấm điểm mốc"]
        UC9["Đánh giá chéo thành viên (Peer Evaluation)"]
        UC10["Xem Thống kê Đóng góp & Burndown Chart"]
    end

    NT --> UC1
    NT --> UC2
    NT --> UC4
    NT --> UC7

    SV --> UC3
    SV --> UC5
    SV --> UC6
    SV --> UC9
    SV --> UC10

    GV --> UC8
    GV --> UC10
    GV -.->|Theo dõi & Góp ý| UC6
```

### 2.2. Đặc tả 3 Luồng Nghiệp vụ Trọng tâm (Sequence & Logic)

#### A. Luồng Kéo-Thả thẻ công việc trên Bảng Kanban (LexoRank / Floating Position)
Để tránh việc phải cập nhật lại thứ tự của hàng trăm bản ghi trong Database mỗi khi kéo 1 thẻ từ vị trí này sang vị trí khác, hệ thống sử dụng kỹ thuật **Floating-Point Position Indexing**:
* Mỗi Issue trên cột Kanban có trường `position` (kiểu `DOUBLE PRECISION`, mặc định cách nhau `1024.0`: thẻ 1 = `1024`, thẻ 2 = `2048`, thẻ 3 = `3072`).
* Khi kéo Thẻ 3 chèn vào giữa Thẻ 1 và Thẻ 2:
  $$\text{position}_{\text{mới}} = \frac{\text{position}_{\text{trên}} + \text{position}_{\text{dưới}}}{2} = \frac{1024 + 2048}{2} = 1536$$
* Nhờ vậy, mỗi thao tác kéo thả **chỉ cần đúng 1 câu lệnh `UPDATE` duy nhất** vào Database và phát sự kiện qua `Socket.io` tới các thành viên khác trong nhóm.

#### B. Luồng Nộp & Duyệt Mốc Báo Cáo Tuần (Milestone Review)
1. Khi tạo dự án theo **Template Đồ án 9 tuần**, hệ thống tự động sinh sẵn 9 mốc `Milestone` (Tuần 1 $\rightarrow$ Tuần 9) tương ứng với kế hoạch đồ án.
2. Cuối mỗi tuần/Sprint, **Nhóm trưởng** đính kèm link/file báo cáo, chọn các Issue đã hoàn thành trong tuần và bấm **"Nộp báo cáo (Submit Milestone)"**.
3. **Giảng viên hướng dẫn** nhận thông báo, kiểm tra danh sách công việc thực tế các thành viên đã làm, nhập nhận xét (`advisor_feedback`), cho điểm quá trình (`grade`) và chọn trạng thái:
   * `APPROVED` (Đạt tiến độ)
   * `CHANGES_REQUESTED` (Yêu cầu bổ sung/chỉnh sửa)

#### C. Thuật toán Tính Điểm Đóng Góp Cá Nhân (Chống "Free-rider / Gánh team")
Điểm đóng góp của mỗi sinh viên $i$ trong dự án ($S_i$, thang điểm 100) được tính tự động từ **3 chỉ số khách quan & định tính**:

$$S_i = 0.50 \times P_i + 0.30 \times T_i + 0.20 \times R_i$$

Trong đó:
1. **$P_i$ (Tỷ lệ Khối lượng Story Points hoàn thành - Trọng số 50%):**
   $$P_i = \min\left(100, \frac{\text{Tổng Story Points đã DONE của SV } i}{\text{Trung bình Story Points kỳ vọng mỗi SV}} \times 100\right)$$
2. **$T_i$ (Tỷ lệ Hoàn thành đúng hạn / On-time Rate - Trọng số 30%):**
   $$T_i = \frac{\text{Số Issue DONE có } \texttt{completed\_at} \le \texttt{due\_date}}{\text{Tổng số Issue đã được giao cho SV } i} \times 100$$
3. **$R_i$ (Điểm Đánh giá chéo trung bình từ đồng đội / Peer Review - Trọng số 20%):**
   $$R_i = \frac{\text{Trung bình cộng điểm (Trách nhiệm + Chất lượng + Phối hợp) trên thang 5}}{5} \times 100$$

> [!TIP]
> Hệ thống tự động gắn cảnh báo **"⚠️ Nguy cơ Free-riding (Đóng góp thấp)"** trên Dashboard của Giảng viên nếu một thành viên có tổng Story Points hoàn thành thấp hơn **40%** mức trung bình của cả nhóm.

---

## 3. Thiết Kế Cơ Sở Dữ Liệu (ERD & Schema PostgreSQL)

### 3.1. Sơ đồ Thực thể Kết hợp (ERD)

```mermaid
erDiagram
    USERS ||--o{ PROJECT_MEMBERS : "participates in"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has"
    PROJECTS ||--o{ EPICS : "contains"
    PROJECTS ||--o{ SPRINTS : "manages"
    PROJECTS ||--o{ ISSUES : "tracks"
    PROJECTS ||--o{ MILESTONES : "schedules"
    PROJECTS ||--o{ PEER_EVALUATIONS : "evaluates"

    SPRINTS ||--o{ ISSUES : "includes"
    EPICS ||--o{ ISSUES : "groups"
    USERS ||--o{ ISSUES : "assigned to / reports"

    ISSUES ||--o{ SUBTASKS : "breaks down into"
    ISSUES ||--o{ ISSUE_COMMENTS : "has"
    ISSUES ||--o{ ISSUE_ATTACHMENTS : "attaches"
    ISSUES ||--o{ ACTIVITY_LOGS : "logs"

    SPRINTS ||--o{ MILESTONES : "links to"
    SPRINTS ||--o{ PEER_EVALUATIONS : "triggers"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string student_code UK
        string avatar_url
        enum system_role "STUDENT | LECTURER | ADMIN"
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        string key UK "VD: DA01"
        string name
        text description
        string semester "VD: HK1-2026"
        enum template_type "CAPSTONE_9W | COURSE_15W | SCRUM_BASIC"
        enum status "ACTIVE | COMPLETED | ARCHIVED"
        uuid owner_id FK
        uuid advisor_id FK
        timestamp start_date
        timestamp end_date
    }

    PROJECT_MEMBERS {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        enum role "LEADER | MEMBER | ADVISOR"
        timestamp joined_at
    }

    SPRINTS {
        uuid id PK
        uuid project_id FK
        string name "VD: Sprint 1 - Phân tích"
        text goal
        enum status "PLANNED | ACTIVE | COMPLETED"
        timestamp start_date
        timestamp end_date
    }

    EPICS {
        uuid id PK
        uuid project_id FK
        string title
        string color
        timestamp start_date
        timestamp due_date
    }

    ISSUES {
        uuid id PK
        uuid project_id FK
        uuid sprint_id FK "Nullable (Backlog)"
        uuid epic_id FK "Nullable"
        string issue_key UK "VD: DA01-1"
        int issue_number
        string title
        text description
        enum type "STORY | TASK | BUG | REPORT"
        enum status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        enum priority "LOWEST | LOW | MEDIUM | HIGH | HIGHEST"
        int story_points
        float position "Thứ tự kéo thả Kanban"
        uuid assignee_id FK
        uuid reporter_id FK
        timestamp due_date
        timestamp completed_at
    }

    SUBTASKS {
        uuid id PK
        uuid issue_id FK
        string title
        boolean is_completed
        int position
    }

    MILESTONES {
        uuid id PK
        uuid project_id FK
        uuid sprint_id FK
        int week_number "Tuần 1 -> 9"
        string title
        text description
        string submission_url
        text submission_note
        enum status "PENDING | SUBMITTED | APPROVED | CHANGES_REQUESTED"
        text advisor_feedback
        float advisor_grade "Thang điểm 10"
        timestamp due_date
        timestamp submitted_at
        timestamp reviewed_at
    }

    PEER_EVALUATIONS {
        uuid id PK
        uuid project_id FK
        uuid sprint_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        int responsibility_score "1-5"
        int quality_score "1-5"
        int teamwork_score "1-5"
        text comment
    }
```

---

## 4. Thiết Kế Giao Diện (UI/UX Wireframe Định Hướng)

Hệ thống gồm **5 màn hình cốt lõi** cần xây dựng ở Frontend:
1. **Project Overview & Contribution Dashboard:** Hiển thị thẻ thống kê nhanh, Biểu đồ Burndown Chart của Sprint hiện tại, và **Bảng xếp hạng đóng góp thành viên** (kèm cảnh báo thành viên ít đóng góp).
2. **Backlog & Sprint Planning View:** Chia làm 2 nửa trên/dưới giống Jira — phía trên là danh sách các Sprint (có nút `Start Sprint` / `Complete Sprint`), phía dưới là danh sách `Backlog` chờ kéo lên Sprint.
3. **Active Sprint Kanban Board:** 4 cột (`TO DO`, `IN PROGRESS`, `IN REVIEW`, `DONE`), mỗi thẻ hiển thị mã (`DA01-12`), tiêu đề, nhãn độ ưu tiên, badge `Story Points`, hạn chót và Avatar người phụ trách.
4. **Issue Detail Drawer / Modal:** Mở trượt từ bên phải hoặc giữa màn hình khi click vào thẻ công việc, cho phép sửa mô tả, tích chọn Sub-tasks, bình luận và xem lịch sử hoạt động.
5. **Advisor Milestone & Peer Review Portal:** Giao diện lộ trình 9 tuần của đồ án (Timeline), nơi Nhóm trưởng đính kèm báo cáo tuần và Giảng viên hướng dẫn vào chấm điểm, nhận xét.
