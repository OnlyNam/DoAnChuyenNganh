import { PrismaClient } from '@prisma/client';
import { generateCapstone9WeekTemplate } from '../src/utils/template.generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu mẫu cho Đồ án Hệ thống Quản lý Dự án Sinh viên...');

  // 1. Tạo tài khoản Giảng viên hướng dẫn & 4 Sinh viên trong nhóm
  const advisor = await prisma.user.upsert({
    where: { email: 'gv.huongdan@uni.edu.vn' },
    update: {},
    create: {
      email: 'gv.huongdan@uni.edu.vn',
      passwordHash: '$2a$10$demoHashedPasswordForLecturer',
      fullName: 'TS. Nguyễn Minh Hoàng (GVHD)',
      systemRole: 'LECTURER',
    },
  });

  const leader = await prisma.user.upsert({
    where: { email: 'nam.vu@student.edu.vn' },
    update: {},
    create: {
      email: 'nam.vu@student.edu.vn',
      passwordHash: '$2a$10$demoHashedPasswordForStudent',
      fullName: 'Vũ Hoàng Nam (Nhóm trưởng)',
      studentCode: 'SV2026001',
      systemRole: 'STUDENT',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'linh.tran@student.edu.vn' },
    update: {},
    create: {
      email: 'linh.tran@student.edu.vn',
      passwordHash: '$2a$10$demoHashedPasswordForStudent',
      fullName: 'Trần Khánh Linh',
      studentCode: 'SV2026002',
      systemRole: 'STUDENT',
    },
  });

  const member3 = await prisma.user.upsert({
    where: { email: 'huy.le@student.edu.vn' },
    update: {},
    create: {
      email: 'huy.le@student.edu.vn',
      passwordHash: '$2a$10$demoHashedPasswordForStudent',
      fullName: 'Lê Quốc Huy',
      studentCode: 'SV2026003',
      systemRole: 'STUDENT',
    },
  });

  const member4 = await prisma.user.upsert({
    where: { email: 'long.pham@student.edu.vn' },
    update: {},
    create: {
      email: 'long.pham@student.edu.vn',
      passwordHash: '$2a$10$demoHashedPasswordForStudent',
      fullName: 'Phạm Bảo Long',
      studentCode: 'SV2026004',
      systemRole: 'STUDENT',
    },
  });

  // 2. Tạo Dự án Mẫu theo Template Đồ án 9 Tuần
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 63);

  const template = generateCapstone9WeekTemplate(startDate);

  const project = await prisma.project.upsert({
    where: { key: 'DACN01' },
    update: {},
    create: {
      key: 'DACN01',
      name: 'Hệ thống Quản lý Dự án Phần mềm cho Nhóm Sinh viên (StudentJira)',
      description:
        'Đồ án chuyên ngành xây dựng nền tảng quản lý dự án theo mô hình Scrum/Kanban tích hợp cổng Giảng viên duyệt tiến độ 9 tuần và thuật toán đánh giá đóng góp chống gánh team.',
      semester: 'HK1 2026-2027',
      templateType: 'CAPSTONE_9W',
      ownerId: leader.id,
      advisorId: advisor.id,
      issueCounter: 6,
      startDate,
      endDate,
      members: {
        create: [
          { userId: leader.id, role: 'LEADER' },
          { userId: member2.id, role: 'MEMBER' },
          { userId: member3.id, role: 'MEMBER' },
          { userId: member4.id, role: 'MEMBER' },
          { userId: advisor.id, role: 'ADVISOR' },
        ],
      },
      sprints: {
        create: template.sprints.map((s, idx) => ({
          name: s.name,
          goal: s.goal,
          status: idx === 0 ? 'ACTIVE' : 'PLANNED',
          startDate: s.startDate,
          endDate: s.endDate,
        })),
      },
      milestones: {
        create: template.milestones.map((m, idx) => ({
          weekNumber: m.weekNumber,
          title: m.title,
          description: m.description,
          dueDate: m.dueDate,
          status: idx === 0 ? 'APPROVED' : idx === 1 ? 'SUBMITTED' : 'PENDING',
          submissionUrl:
            idx <= 1 ? 'https://docs.google.com/document/d/demo-srs-erd-week1' : null,
          advisorFeedback:
            idx === 0
              ? 'Sơ đồ ERD và phân rã Use Case rõ ràng, có tính thực tiễn cao cho nhóm sinh viên. Duyệt chuyển sang giai đoạn code Base.'
              : null,
          advisorGrade: idx === 0 ? 9.5 : null,
        })),
      },
    },
    include: {
      sprints: true,
    },
  });

  const activeSprint = project.sprints[0];

  // 3. Tạo các Issues mẫu trên bảng Kanban
  const sampleIssues = [
    {
      issueKey: 'DACN01-1',
      issueNumber: 1,
      title: 'Phân tích yêu cầu, xác định Actors & vẽ sơ đồ Use Case tổng quát',
      type: 'REPORT' as const,
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      storyPoints: 5,
      position: 1024,
      assigneeId: leader.id,
      completedAt: new Date(),
    },
    {
      issueKey: 'DACN01-2',
      issueNumber: 2,
      title: 'Thiết kế sơ đồ ERD & CSDL PostgreSQL với Prisma ORM',
      type: 'TASK' as const,
      status: 'DONE' as const,
      priority: 'HIGHEST' as const,
      storyPoints: 8,
      position: 2048,
      assigneeId: leader.id,
      completedAt: new Date(),
    },
    {
      issueKey: 'DACN01-3',
      issueNumber: 3,
      title: 'Thiết kế UI/UX Figma cho màn hình Kanban Board & Cổng Giảng viên',
      type: 'STORY' as const,
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      storyPoints: 5,
      position: 3072,
      assigneeId: member2.id,
      completedAt: new Date(),
    },
    {
      issueKey: 'DACN01-4',
      issueNumber: 4,
      title: 'Xây dựng API Kéo thả Kanban (Floating-Point Position) & Socket.io',
      type: 'STORY' as const,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGHEST' as const,
      storyPoints: 8,
      position: 1024,
      assigneeId: member3.id,
      completedAt: null,
    },
    {
      issueKey: 'DACN01-5',
      issueNumber: 5,
      title: 'Xây dựng thuật toán tính Điểm Đóng Góp & Cảnh báo Free-rider',
      type: 'STORY' as const,
      status: 'IN_REVIEW' as const,
      priority: 'HIGH' as const,
      storyPoints: 5,
      position: 1024,
      assigneeId: member2.id,
      completedAt: null,
    },
    {
      issueKey: 'DACN01-6',
      issueNumber: 6,
      title: 'Viết tài liệu Chương 1: Tổng quan đề tài và so sánh với Jira',
      type: 'REPORT' as const,
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      storyPoints: 3,
      position: 1024,
      assigneeId: member4.id,
      completedAt: null,
    },
  ];

  for (const item of sampleIssues) {
    await prisma.issue.upsert({
      where: { issueKey: item.issueKey },
      update: {},
      create: {
        projectId: project.id,
        sprintId: activeSprint.id,
        issueKey: item.issueKey,
        issueNumber: item.issueNumber,
        title: item.title,
        type: item.type,
        status: item.status,
        priority: item.priority,
        storyPoints: item.storyPoints,
        position: item.position,
        assigneeId: item.assigneeId,
        reporterId: leader.id,
        dueDate: new Date(Date.now() + 5 * 86400000),
        completedAt: item.completedAt,
      },
    });
  }

  console.log('✅ Khởi tạo dữ liệu mẫu thành công! Mã dự án: DACN01');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
