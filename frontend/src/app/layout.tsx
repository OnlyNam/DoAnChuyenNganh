import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudentJira - Hệ thống Quản lý Dự án Phần mềm cho Nhóm Sinh viên',
  description:
    'Đồ án chuyên ngành: Quản lý dự án theo mô hình Scrum/Kanban tích hợp Cổng Giảng viên duyệt tiến độ 9 tuần và Đánh giá đóng góp chống gánh team.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
