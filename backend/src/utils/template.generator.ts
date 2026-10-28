/**
 * Bộ khởi tạo Mẫu Dự Án Đồ Án Học Thuật (Academic Project Template Generator)
 * Tự động sinh 9 Mốc báo cáo (Milestones) và 4 Sprints chuẩn khi sinh viên chọn mẫu CAPSTONE_9W
 */

export interface MilestoneTemplateItem {
  weekNumber: number;
  title: string;
  description: string;
  dueDate: Date;
}

export interface SprintTemplateItem {
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
}

export function generateCapstone9WeekTemplate(projectStartDate: Date): {
  milestones: MilestoneTemplateItem[];
  sprints: SprintTemplateItem[];
} {
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const weeklyPlan: Array<{ title: string; description: string }> = [
    {
      title: 'Tuần 1: Phân tích yêu cầu, Use Case & Thiết kế CSDL (ERD)',
      description: 'Nộp đặc tả SRS rút gọn, sơ đồ Use Case tổng quát/phân rã, sơ đồ ERD và Wireframe Figma.',
    },
    {
      title: 'Tuần 2: Khởi tạo Base Project, Xác thực & Quản lý Không gian nhóm',
      description: 'Hoàn thành cấu trúc Git, Database Migration, Đăng nhập/Phân quyền RBAC và tạo nhóm dự án.',
    },
    {
      title: 'Tuần 3: Xây dựng Module Backlog, Epic & Quản lý Công việc (Issue CRUD)',
      description: 'Hoàn thiện API và giao diện danh sách Backlog, thêm/sửa/xóa/lọc công việc và gán Story Points.',
    },
    {
      title: 'Tuần 4: Quản lý Chu kỳ Sprint & Bảng Kanban Kéo-Thả',
      description: 'Bắt đầu/Kết thúc Sprint, kéo thả công việc trên bảng Kanban 4 cột với thuật toán vị trí.',
    },
    {
      title: 'Tuần 5: Chi tiết Công việc, Bình luận, Đính kèm tệp & Thông báo Real-time',
      description: 'Hoàn thiện Issue Detail Drawer, Subtasks, Activity Log và đồng bộ Socket.io thời gian thực.',
    },
    {
      title: 'Tuần 6: Cổng Giảng viên duyệt tiến độ & Đánh giá đóng góp chống gánh team',
      description: 'Xây dựng luồng nộp/chấm điểm Milestone cho Giảng viên và form Đánh giá chéo (Peer Evaluation).',
    },
    {
      title: 'Tuần 7: Dashboard Thống kê, Biểu đồ Burndown & Tính năng mở rộng',
      description: 'Hoàn thành biểu đồ tiến độ Sprint Burndown Chart và bảng xếp hạng đóng góp thành viên.',
    },
    {
      title: 'Tuần 8: Kiểm thử hệ thống (Testing), Deploy Cloud & Tạo Seed Data',
      description: 'Kiểm thử toàn diện, triển khai lên môi trường thực tế và chuẩn bị dữ liệu mẫu phục vụ bảo vệ.',
    },
    {
      title: 'Tuần 9: Nộp Cuốn Báo cáo Đồ án hoàn chỉnh, Slide & Bảo vệ thử',
      description: 'Nộp file PDF báo cáo 4 chương, Slide thuyết trình, link source code và video demo.',
    },
  ];

  const milestones: MilestoneTemplateItem[] = weeklyPlan.map((item, idx) => ({
    weekNumber: idx + 1,
    title: item.title,
    description: item.description,
    dueDate: addDays(projectStartDate, (idx + 1) * 7),
  }));

  const sprints: SprintTemplateItem[] = [
    {
      name: 'Sprint 1: Khởi động, Phân tích thiết kế & Base System (Tuần 1-2)',
      goal: 'Hoàn tất thiết kế ERD, Use Case và dựng xong khung xác thực + quản lý dự án.',
      startDate: projectStartDate,
      endDate: addDays(projectStartDate, 14),
    },
    {
      name: 'Sprint 2: Xây dựng Lõi Quản lý Agile - Backlog & Kanban (Tuần 3-5)',
      goal: 'Hoàn thiện luồng Backlog, chạy Sprint, kéo thả Kanban và trao đổi real-time.',
      startDate: addDays(projectStartDate, 14),
      endDate: addDays(projectStartDate, 35),
    },
    {
      name: 'Sprint 3: Cổng Giảng viên, Đánh giá Đóng góp & Dashboard (Tuần 6-7)',
      goal: 'Hoàn thiện tính năng duyệt tiến độ tuần, chống free-rider và biểu đồ thống kê.',
      startDate: addDays(projectStartDate, 35),
      endDate: addDays(projectStartDate, 49),
    },
    {
      name: 'Sprint 4: Kiểm thử, Triển khai Cloud & Hoàn thiện Báo cáo (Tuần 8-9)',
      goal: 'Đóng gói sản phẩm không lỗi, tạo dữ liệu mẫu và hoàn thành cuốn báo cáo đồ án.',
      startDate: addDays(projectStartDate, 49),
      endDate: addDays(projectStartDate, 63),
    },
  ];

  return { milestones, sprints };
}
