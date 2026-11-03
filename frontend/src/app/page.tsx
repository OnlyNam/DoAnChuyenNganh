'use client';

import React, { useMemo, useState } from 'react';
import {
  EpicItem,
  IssueItem,
  IssueStatus,
  MemberContribution,
  MilestoneStatus,
  ProjectMemberItem,
  ProjectRole,
  ProjectWorkspace,
  SprintItem,
  UserProfile,
} from '../types/project.types';
import AuthModal from '../components/auth/AuthModal';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import TeamMembersModal from '../components/projects/TeamMembersModal';
import IssueFormModal from '../components/issues/IssueFormModal';
import BacklogAndEpicsView from '../components/backlog/BacklogAndEpicsView';
import SprintLifecycleModal from '../components/sprints/SprintLifecycleModal';

const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: 'u1',
    email: 'nam.vu@student.edu.vn',
    fullName: 'Vũ Hoàng Nam (Nhóm trưởng)',
    studentCode: 'SV2026001',
    systemRole: 'STUDENT',
    projectRole: 'LEADER',
  },
  {
    id: 'u2',
    email: 'linh.tran@student.edu.vn',
    fullName: 'Trần Khánh Linh (Thành viên)',
    studentCode: 'SV2026002',
    systemRole: 'STUDENT',
    projectRole: 'MEMBER',
  },
  {
    id: 'u_advisor',
    email: 'gv.huongdan@uni.edu.vn',
    fullName: 'TS. Nguyễn Minh Hoàng (GVHD)',
    studentCode: null,
    systemRole: 'LECTURER',
    projectRole: 'ADVISOR',
  },
];

const INITIAL_PROJECTS: ProjectWorkspace[] = [
  {
    id: 'proj_dacn01',
    key: 'DACN01',
    name: 'Hệ thống Quản lý Dự án Phần mềm cho Nhóm Sinh viên',
    description:
      'Đồ án chuyên ngành xây dựng hệ thống quản lý dự án Scrum/Kanban tích hợp Cổng Giảng viên duyệt mốc 9 tuần và Đánh giá đóng góp chống gánh team.',
    semester: 'HK1 2026-2027',
    templateType: 'CAPSTONE_9W',
    advisorName: 'TS. Nguyễn Minh Hoàng',
    currentSprintName: 'Sprint 2 - Quản lý Backlog, Epics & Kanban (Tuần 3-5)',
    issueCounter: 9,
    members: [
      {
        id: 'm1',
        userId: 'u1',
        fullName: 'Vũ Hoàng Nam',
        email: 'nam.vu@student.edu.vn',
        studentCode: 'SV2026001',
        systemRole: 'STUDENT',
        role: 'LEADER',
        joinedAt: '2026-10-20',
      },
      {
        id: 'm2',
        userId: 'u2',
        fullName: 'Trần Khánh Linh',
        email: 'linh.tran@student.edu.vn',
        studentCode: 'SV2026002',
        systemRole: 'STUDENT',
        role: 'MEMBER',
        joinedAt: '2026-10-20',
      },
      {
        id: 'm3',
        userId: 'u3',
        fullName: 'Lê Quốc Huy',
        email: 'huy.le@student.edu.vn',
        studentCode: 'SV2026003',
        systemRole: 'STUDENT',
        role: 'MEMBER',
        joinedAt: '2026-10-20',
      },
      {
        id: 'm4',
        userId: 'u4',
        fullName: 'Phạm Bảo Long',
        email: 'long.pham@student.edu.vn',
        studentCode: 'SV2026004',
        systemRole: 'STUDENT',
        role: 'MEMBER',
        joinedAt: '2026-10-20',
      },
      {
        id: 'm5',
        userId: 'u_advisor',
        fullName: 'TS. Nguyễn Minh Hoàng',
        email: 'gv.huongdan@uni.edu.vn',
        studentCode: null,
        systemRole: 'LECTURER',
        role: 'ADVISOR',
        joinedAt: '2026-10-20',
      },
    ],
    epics: [
      {
        id: 'epic_1',
        title: 'Phân hệ 1: Phân tích Thiết kế & Báo cáo Học thuật',
        color: '#2563EB',
      },
      {
        id: 'epic_2',
        title: 'Phân hệ 2: Xác thực JWT, Phân quyền RBAC & Quản lý Nhóm',
        color: '#059669',
      },
      {
        id: 'epic_3',
        title: 'Phân hệ 3: Lõi Agile - Backlog, Epics & Bảng Kanban',
        color: '#7C3AED',
      },
    ],
    sprints: [
      {
        id: 'sp_1',
        name: 'Sprint 1 - Phân tích thiết kế & Base System (Tuần 1-2)',
        goal: 'Hoàn tất thiết kế ERD, Use Case và dựng xong khung xác thực + quản lý dự án.',
        status: 'COMPLETED',
        startDate: '2026-10-16',
        endDate: '2026-10-29',
      },
      {
        id: 'sp_2',
        name: 'Sprint 2 - Quản lý Backlog, Epics & Kanban (Tuần 3-5)',
        goal: 'Hoàn thiện luồng Backlog, chạy Sprint, kéo thả Kanban và trao đổi real-time.',
        status: 'ACTIVE',
        startDate: '2026-10-30',
        endDate: '2026-11-15',
      },
      {
        id: 'sp_3',
        name: 'Sprint 3 - Cổng Giảng viên, Đánh giá Đóng góp & Dashboard (Tuần 6-7)',
        goal: 'Hoàn thiện tính năng duyệt tiến độ tuần, chống free-rider và biểu đồ thống kê.',
        status: 'PLANNED',
        startDate: '2026-11-16',
        endDate: '2026-11-30',
      },
      {
        id: 'sp_4',
        name: 'Sprint 4 - Kiểm thử, Triển khai Cloud & Hoàn thiện Báo cáo (Tuần 8-9)',
        goal: 'Đóng gói sản phẩm không lỗi, tạo dữ liệu mẫu và hoàn thành cuốn báo cáo đồ án.',
        status: 'PLANNED',
        startDate: '2026-12-01',
        endDate: '2026-12-15',
      },
    ],
    issues: [
      {
        id: '1',
        issueKey: 'DACN01-1',
        title: 'Phân tích yêu cầu, xác định Actors & vẽ sơ đồ Use Case tổng quát',
        type: 'REPORT',
        status: 'DONE',
        priority: 'HIGH',
        storyPoints: 5,
        position: 1024,
        epicId: 'epic_1',
        inBacklog: false,
        assigneeName: 'Vũ Hoàng Nam',
        studentCode: 'SV2026001',
      },
      {
        id: '2',
        issueKey: 'DACN01-2',
        title: 'Thiết kế sơ đồ ERD & CSDL PostgreSQL với Prisma ORM',
        type: 'TASK',
        status: 'DONE',
        priority: 'HIGHEST',
        storyPoints: 8,
        position: 2048,
        epicId: 'epic_1',
        inBacklog: false,
        assigneeName: 'Vũ Hoàng Nam',
        studentCode: 'SV2026001',
      },
      {
        id: '3',
        issueKey: 'DACN01-3',
        title: 'Xây dựng JWT Auth, Phân quyền RBAC 2 tầng & Quản lý Nhóm (Tuần 2)',
        type: 'STORY',
        status: 'DONE',
        priority: 'HIGHEST',
        storyPoints: 8,
        position: 3072,
        epicId: 'epic_2',
        inBacklog: false,
        assigneeName: 'Vũ Hoàng Nam',
        studentCode: 'SV2026001',
      },
      {
        id: '4',
        issueKey: 'DACN01-4',
        title: 'Xây dựng Module Quản lý Backlog, Epics & Issue CRUD (Tuần 3)',
        type: 'STORY',
        status: 'DONE',
        priority: 'HIGHEST',
        storyPoints: 8,
        position: 4096,
        epicId: 'epic_3',
        inBacklog: false,
        assigneeName: 'Trần Khánh Linh',
        studentCode: 'SV2026002',
      },
      {
        id: '5',
        issueKey: 'DACN01-5',
        title: 'Thiết kế UI/UX Figma cho màn hình Kanban Board & Cổng Giảng viên',
        type: 'STORY',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        storyPoints: 5,
        position: 1024,
        epicId: 'epic_1',
        inBacklog: false,
        assigneeName: 'Trần Khánh Linh',
        studentCode: 'SV2026002',
      },
      {
        id: '6',
        issueKey: 'DACN01-6',
        title: 'Xây dựng API Kéo thả Kanban (Floating-Point Position) & Socket.io',
        type: 'STORY',
        status: 'IN_PROGRESS',
        priority: 'HIGHEST',
        storyPoints: 8,
        position: 1024,
        epicId: 'epic_3',
        inBacklog: false,
        assigneeName: 'Lê Quốc Huy',
        studentCode: 'SV2026003',
      },
      {
        id: '7',
        issueKey: 'DACN01-7',
        title: 'Viết tài liệu Chương 1: Tổng quan đề tài và so sánh với Jira',
        type: 'REPORT',
        status: 'TODO',
        priority: 'MEDIUM',
        storyPoints: 3,
        position: 1024,
        epicId: 'epic_1',
        inBacklog: false,
        assigneeName: 'Phạm Bảo Long',
        studentCode: 'SV2026004',
      },
      {
        id: '8',
        issueKey: 'DACN01-8',
        title: 'Xây dựng biểu đồ Sprint Burndown Chart bằng Recharts (Tuần 7)',
        type: 'STORY',
        status: 'TODO',
        priority: 'HIGH',
        storyPoints: 5,
        position: 1024,
        epicId: 'epic_3',
        inBacklog: true,
        assigneeName: 'Lê Quốc Huy',
        studentCode: 'SV2026003',
      },
      {
        id: '9',
        issueKey: 'DACN01-9',
        title: 'Tích hợp Form Đánh giá chéo ẩn danh cuối Sprint (Peer Review)',
        type: 'STORY',
        status: 'TODO',
        priority: 'HIGH',
        storyPoints: 5,
        position: 2048,
        epicId: 'epic_2',
        inBacklog: true,
        assigneeName: 'Trần Khánh Linh',
        studentCode: 'SV2026002',
      },
    ],
    milestones: [
      {
        id: 'm1',
        weekNumber: 1,
        title: 'Tuần 1: Phân tích yêu cầu, Use Case & Thiết kế CSDL (ERD)',
        description: 'Nộp đặc tả SRS rút gọn, sơ đồ Use Case, ERD và khung dự án.',
        status: 'APPROVED',
        dueDate: '2026-10-23',
        submissionUrl: 'https://github.com/OnlyNam/DoAnChuyenNganh/tree/main/docs',
        advisorFeedback:
          'Sơ đồ ERD chặt chẽ, giải quyết tốt bài toán đánh giá đóng góp sinh viên. Duyệt!',
        advisorGrade: 9.5,
      },
      {
        id: 'm2',
        weekNumber: 2,
        title: 'Tuần 2: Khởi tạo Base Project, Xác thực JWT & Quản lý Không gian nhóm',
        description:
          'Hoàn thành cấu trúc Git, Database Migration, Auth RBAC 2 tầng & Quản lý thành viên nhóm.',
        status: 'APPROVED',
        dueDate: '2026-10-28',
        submissionUrl: 'https://github.com/OnlyNam/DoAnChuyenNganh',
        advisorFeedback:
          'Đã hoàn thiện xác thực JWT và phân quyền RBAC 2 tầng rất tốt.',
        advisorGrade: 9.5,
      },
      {
        id: 'm3',
        weekNumber: 3,
        title: 'Tuần 3: Xây dựng Module Backlog, Epic & Quản lý Công việc (Issue CRUD)',
        description:
          'Hoàn thiện API và giao diện danh sách Backlog, Epics, bộ lọc đa tiêu chí và gán Story Points Fibonacci.',
        status: 'APPROVED',
        dueDate: '2026-10-29',
        submissionUrl: 'https://github.com/OnlyNam/DoAnChuyenNganh',
        advisorFeedback:
          'Giao diện Backlog và phân loại Fibonacci Story Points đúng chuẩn Scrum.',
        advisorGrade: 9.5,
      },
      {
        id: 'm4',
        weekNumber: 4,
        title: 'Tuần 4: Quản lý Chu kỳ Sprint & Bảng Kanban Kéo-Thả (Drag & Drop)',
        description:
          'Bắt đầu/Kết thúc Sprint kèm luân chuyển task tồn đọng và kéo thả thẻ trên Kanban.',
        status: 'SUBMITTED',
        dueDate: '2026-11-05',
        submissionUrl: 'https://github.com/OnlyNam/DoAnChuyenNganh',
      },
    ],
  },
];

const COLUMNS: { key: IssueStatus; label: string }[] = [
  { key: 'TODO', label: 'TO DO (Cần làm)' },
  { key: 'IN_PROGRESS', label: 'IN PROGRESS (Đang làm)' },
  { key: 'IN_REVIEW', label: 'IN REVIEW (Chờ duyệt)' },
  { key: 'DONE', label: 'DONE (Hoàn thành)' },
];

export default function StudentProjectManagementPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_ACCOUNTS[0]);
  const [projects, setProjects] = useState<ProjectWorkspace[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    INITIAL_PROJECTS[0].id
  );
  const [activeTab, setActiveTab] = useState<
    'KANBAN' | 'BACKLOG' | 'MILESTONES' | 'CONTRIBUTION'
  >('KANBAN');

  // Modals của Tuần 2, 3 & 4
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueItem | null>(null);
  const [defaultInBacklog, setDefaultInBacklog] = useState<boolean>(false);

  // State Kéo-Thả Kanban & Bộ lọc nhanh trên Kanban (Tuần 4)
  const [draggingIssueId, setDraggingIssueId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(
    null
  );
  const [onlyMyIssues, setOnlyMyIssues] = useState<boolean>(false);
  const [kanbanEpicFilter, setKanbanEpicFilter] = useState<string>('ALL');

  // State chấm điểm trên Cổng Giảng Viên
  const [gradingMilestoneId, setGradingMilestoneId] = useState<string | null>(
    null
  );
  const [gradeInput, setGradeInput] = useState<string>('9.5');
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Các Issues thuộc Active Sprint (Hiển thị trên Kanban Board)
  const activeSprintIssues = currentProject.issues.filter((i) => !i.inBacklog);

  // Áp dụng bộ lọc nhanh trên Bảng Kanban (Tuần 4)
  const visibleKanbanIssues = activeSprintIssues.filter((i) => {
    if (
      onlyMyIssues &&
      currentUser.studentCode &&
      i.studentCode !== currentUser.studentCode
    ) {
      return false;
    }
    if (kanbanEpicFilter !== 'ALL' && i.epicId !== kanbanEpicFilter) {
      return false;
    }
    return true;
  });

  // Tính toán Điểm đóng góp tự động theo dữ liệu thực tế của dự án hiện tại
  const dynamicContributions: MemberContribution[] = useMemo(() => {
    const studentMembers = currentProject.members.filter(
      (m) => m.role !== 'ADVISOR'
    );
    const allDonePoints = currentProject.issues
      .filter((i) => i.status === 'DONE')
      .reduce((sum, i) => sum + i.storyPoints, 0);
    const expectedAvg =
      studentMembers.length > 0 ? allDonePoints / studentMembers.length : 1;

    return studentMembers.map((mem, idx) => {
      const assigned = currentProject.issues.filter(
        (i) => i.studentCode === mem.studentCode
      );
      const completed = assigned.filter((i) => i.status === 'DONE');
      const completedPoints = completed.reduce(
        (s, i) => s + i.storyPoints,
        0
      );

      const pointScore =
        allDonePoints > 0
          ? Math.min(100, Math.round((completedPoints / expectedAvg) * 85))
          : 0;
      const onTimeRate =
        assigned.length > 0
          ? Math.round((completed.length / assigned.length) * 100)
          : 80;
      const peerAvg = idx === 0 ? 4.9 : idx === 1 ? 4.7 : idx === 2 ? 4.4 : 3.2;
      const peerScore = (peerAvg / 5) * 100;

      const finalScore =
        Math.round(
          (0.5 * pointScore + 0.3 * onTimeRate + 0.2 * peerScore) * 10
        ) / 10;
      const workloadPercentage =
        allDonePoints > 0
          ? Math.round((completedPoints / allDonePoints) * 1000) / 10
          : 0;
      const isFreeRiderWarning =
        allDonePoints >= 8 && completedPoints < expectedAvg * 0.4;
      const suggestedGradeFactor =
        Math.round(Math.max(0.6, Math.min(1.15, finalScore / 85)) * 100) / 100;

      return {
        userId: mem.userId,
        fullName: mem.fullName,
        studentCode: mem.studentCode || 'SV2026',
        role: mem.role === 'LEADER' ? 'LEADER' : 'MEMBER',
        totalAssignedIssues: assigned.length,
        completedIssues: completed.length,
        completedStoryPoints: completedPoints,
        onTimeRate,
        peerReviewAvgOn5: peerAvg,
        finalContributionScore: finalScore,
        workloadPercentage,
        isFreeRiderWarning,
        suggestedGradeFactor,
      };
    });
  }, [currentProject]);

  const handleStatusChange = (issueId: string, nextStatus: IssueStatus) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              issues: proj.issues.map((item) =>
                item.id === issueId ? { ...item, status: nextStatus } : item
              ),
            }
      )
    );
  };

  // Xử lý thả thẻ công việc trên Bảng Kanban (Drag & Drop - Tuần 4)
  const handleDropOnColumn = (targetStatus: IssueStatus) => {
    if (!draggingIssueId) return;
    handleStatusChange(draggingIssueId, targetStatus);
    setDraggingIssueId(null);
    setDragOverColumn(null);
  };

  // Xử lý Vòng đời Sprint (Tuần 4)
  const handleCreateSprint = (sprintData: Omit<SprintItem, 'id'>) => {
    const newSp: SprintItem = {
      id: `sp_${Date.now()}`,
      ...sprintData,
    };
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : { ...proj, sprints: [...proj.sprints, newSp] }
      )
    );
  };

  const handleStartSprint = (sprintId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;
        const target = proj.sprints.find((s) => s.id === sprintId);
        return {
          ...proj,
          currentSprintName: target ? target.name : proj.currentSprintName,
          sprints: proj.sprints.map((s) =>
            s.id === sprintId ? { ...s, status: 'ACTIVE' } : s
          ),
        };
      })
    );
  };

  const handleCompleteSprint = (
    sprintId: string,
    rolloverTarget: 'NEXT_SPRINT' | 'BACKLOG'
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        const nextPlanned = proj.sprints.find(
          (s) => s.status === 'PLANNED' && s.id !== sprintId
        );

        const updatedSprints: SprintItem[] = proj.sprints.map((s) => {
          if (s.id === sprintId) return { ...s, status: 'COMPLETED' };
          if (
            rolloverTarget === 'NEXT_SPRINT' &&
            nextPlanned &&
            s.id === nextPlanned.id
          ) {
            return { ...s, status: 'ACTIVE' };
          }
          return s;
        });

        const updatedIssues = proj.issues.map((iss) => {
          if (!iss.inBacklog && iss.status !== 'DONE') {
            return {
              ...iss,
              inBacklog: rolloverTarget === 'BACKLOG',
            };
          }
          return iss;
        });

        return {
          ...proj,
          currentSprintName:
            rolloverTarget === 'NEXT_SPRINT' && nextPlanned
              ? nextPlanned.name
              : 'Chưa có Sprint đang chạy (Hãy bắt đầu Sprint mới)',
          sprints: updatedSprints,
          issues: updatedIssues,
        };
      })
    );
  };

  const handleSaveIssue = (
    issueData: Omit<IssueItem, 'id' | 'issueKey' | 'position'>,
    existingId?: string
  ) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== currentProject.id) return proj;

        if (existingId) {
          return {
            ...proj,
            issues: proj.issues.map((it) =>
              it.id === existingId ? { ...it, ...issueData } : it
            ),
          };
        }

        const nextNum = proj.issueCounter + 1;
        const newIssue: IssueItem = {
          id: `iss_${Date.now()}`,
          issueKey: `${proj.key}-${nextNum}`,
          position: (proj.issues.length + 1) * 1024,
          ...issueData,
        };

        return {
          ...proj,
          issueCounter: nextNum,
          issues: [...proj.issues, newIssue],
        };
      })
    );
  };

  const handleDeleteIssue = (issueId: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              issues: proj.issues.filter((i) => i.id !== issueId),
            }
      )
    );
  };

  const handleToggleIssueSprint = (issueId: string, moveToBacklog: boolean) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              issues: proj.issues.map((i) =>
                i.id === issueId ? { ...i, inBacklog: moveToBacklog } : i
              ),
            }
      )
    );
  };

  const handleCreateEpic = (epicData: Omit<EpicItem, 'id'>) => {
    const newEpic: EpicItem = {
      id: `epic_${Date.now()}`,
      ...epicData,
    };
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : { ...proj, epics: [...proj.epics, newEpic] }
      )
    );
  };

  const handleDeleteEpic = (epicId: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              epics: proj.epics.filter((e) => e.id !== epicId),
              issues: proj.issues.map((i) =>
                i.epicId === epicId ? { ...i, epicId: null } : i
              ),
            }
      )
    );
  };

  const handleProjectCreated = (newProject: ProjectWorkspace) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
  };

  const handleAddMember = (member: ProjectMemberItem) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : { ...proj, members: [...proj.members, member] }
      )
    );
  };

  const handleUpdateMemberRole = (memberId: string, newRole: ProjectRole) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              members: proj.members.map((m) =>
                m.id === memberId ? { ...m, role: newRole } : m
              ),
            }
      )
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              members: proj.members.filter((m) => m.id !== memberId),
            }
      )
    );
  };

  const handleSubmitMilestone = (milestoneId: string) => {
    const url = window.prompt(
      'Nhập đường dẫn báo cáo tuần (Link GitHub / Google Docs):',
      'https://github.com/OnlyNam/DoAnChuyenNganh'
    );
    if (!url) return;

    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              milestones: proj.milestones.map((ms) =>
                ms.id === milestoneId
                  ? { ...ms, status: 'SUBMITTED', submissionUrl: url }
                  : ms
              ),
            }
      )
    );
  };

  const handleAdvisorReview = (
    milestoneId: string,
    status: MilestoneStatus
  ) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id !== currentProject.id
          ? proj
          : {
              ...proj,
              milestones: proj.milestones.map((ms) =>
                ms.id === milestoneId
                  ? {
                      ...ms,
                      status,
                      advisorGrade: Number(gradeInput) || 9.0,
                      advisorFeedback:
                        feedbackInput.trim() ||
                        'Đã kiểm tra tiến độ và mã nguồn trên GitHub.',
                    }
                  : ms
              ),
            }
      )
    );
    setGradingMilestoneId(null);
    setFeedbackInput('');
  };

  const studentMemberCount = currentProject.members.filter(
    (m) => m.role !== 'ADVISOR'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6">
      {/* Top Workspace & Auth Bar */}
      <div className="max-w-7xl mx-auto bg-slate-900 text-white rounded-xl px-5 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold tracking-tight text-base text-blue-400">
            🚀 StudentJira
          </span>
          <span className="text-slate-600">|</span>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Dự án:</span>
            <select
              aria-label="Chọn dự án đồ án"
              value={currentProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-semibold"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateProjectOpen(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            + Tạo Dự Án 9 Tuần
          </button>

          <button
            type="button"
            onClick={() => setIsMembersModalOpen(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg transition"
          >
            👥 Thành viên ({studentMemberCount} SV)
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingIssue(null);
              setDefaultInBacklog(false);
              setIsIssueModalOpen(true);
            }}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            ➕ Tạo Công Việc
          </button>
        </div>

        {/* Thông tin User & Chuyển vai trò RBAC */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="font-semibold text-white">
              {currentUser.fullName}
            </div>
            <div className="text-slate-400 text-[11px]">
              {currentUser.email}{' '}
              {currentUser.studentCode ? `• ${currentUser.studentCode}` : ''}
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
              currentUser.projectRole === 'LEADER'
                ? 'bg-amber-400 text-slate-950'
                : currentUser.projectRole === 'ADVISOR'
                ? 'bg-purple-400 text-slate-950'
                : 'bg-blue-400 text-slate-950'
            }`}
          >
            {currentUser.projectRole}
          </span>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            🔐 Đổi Vai Trò
          </button>
        </div>
      </div>

      {/* Header Dự Án */}
      <header className="max-w-7xl mx-auto bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <span>Mẫu dự án: {currentProject.templateType}</span>
            <span>•</span>
            <span>Mã: {currentProject.key}</span>
            <span>•</span>
            <span>Học kỳ: {currentProject.semester}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {currentProject.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            GVHD: <strong>{currentProject.advisorName}</strong> | Sprint hiện
            tại:{' '}
            <span className="text-emerald-600 font-medium">
              {currentProject.currentSprintName}
            </span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('KANBAN')}
            className={`px-3.5 py-2 rounded-md text-xs md:text-sm font-medium transition ${
              activeTab === 'KANBAN'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Bảng Kanban ({activeSprintIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('BACKLOG')}
            className={`px-3.5 py-2 rounded-md text-xs md:text-sm font-medium transition ${
              activeTab === 'BACKLOG'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗂️ Backlog & Epics ({currentProject.issues.length})
          </button>
          <button
            onClick={() => setActiveTab('MILESTONES')}
            className={`px-3.5 py-2 rounded-md text-xs md:text-sm font-medium transition ${
              activeTab === 'MILESTONES'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎓 Cổng Giảng Viên ({currentProject.milestones.length} Tuần)
          </button>
          <button
            onClick={() => setActiveTab('CONTRIBUTION')}
            className={`px-3.5 py-2 rounded-md text-xs md:text-sm font-medium transition ${
              activeTab === 'CONTRIBUTION'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚖️ Điểm Đóng Góp
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* TAB 1: KANBAN BOARD KÉO-THẢ & QUẢN LÝ SPRINT (TUẦN 4) */}
        {activeTab === 'KANBAN' && (
          <div className="space-y-4">
            {/* Thanh công cụ Kanban (Tuần 4) */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-slate-600">
                  💡 Mẹo: Kéo và thả trực tiếp thẻ công việc giữa 4 cột bên dưới!
                </span>

                <button
                  type="button"
                  onClick={() => setOnlyMyIssues(!onlyMyIssues)}
                  className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                    onlyMyIssues
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  👤 Chỉ việc của tôi ({currentUser.fullName.split('(')[0].trim()})
                </button>

                <select
                  aria-label="Lọc theo Epic trên bảng Kanban"
                  value={kanbanEpicFilter}
                  onChange={(e) => setKanbanEpicFilter(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
                >
                  <option value="ALL">📌 Tất cả Epics</option>
                  {currentProject.epics.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      📌 {ep.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsSprintModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg transition"
              >
                🏁 Quản lý / Kết thúc Sprint
              </button>
            </div>

            {/* 4 Cột Kanban Hỗ Trợ Drag & Drop */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {COLUMNS.map((col) => {
                const colIssues = visibleKanbanIssues.filter(
                  (i) => i.status === col.key
                );
                const totalPoints = colIssues.reduce(
                  (s, i) => s + i.storyPoints,
                  0
                );
                const isDragOver = dragOverColumn === col.key;

                return (
                  <div
                    key={col.key}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverColumn !== col.key) {
                        setDragOverColumn(col.key);
                      }
                    }}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={() => handleDropOnColumn(col.key)}
                    className={`rounded-xl p-3 flex flex-col min-h-[520px] border-2 transition ${
                      isDragOver
                        ? 'bg-blue-50/80 border-blue-500 border-dashed'
                        : 'bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between px-2 py-1.5 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {col.label} ({colIssues.length})
                      </span>
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                        {totalPoints} SP
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {colIssues.map((issue) => {
                        const epic = currentProject.epics.find(
                          (e) => e.id === issue.epicId
                        );

                        return (
                          <div
                            key={issue.id}
                            draggable
                            onDragStart={() => setDraggingIssueId(issue.id)}
                            onDragEnd={() => {
                              setDraggingIssueId(null);
                              setDragOverColumn(null);
                            }}
                            className={`bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm hover:border-blue-400 cursor-grab active:cursor-grabbing transition ${
                              draggingIssueId === issue.id
                                ? 'opacity-50 scale-95'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-mono font-semibold text-blue-600">
                                {issue.issueKey}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                                  {issue.storyPoints} SP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingIssue(issue);
                                    setIsIssueModalOpen(true);
                                  }}
                                  className="text-slate-400 hover:text-blue-600"
                                  title="Chỉnh sửa công việc"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>

                            {epic && (
                              <div className="mb-1.5">
                                <span
                                  style={{
                                    backgroundColor: `${epic.color}18`,
                                    color: epic.color,
                                  }}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block"
                                >
                                  📌 {epic.title}
                                </span>
                              </div>
                            )}

                            <p className="text-sm font-medium text-slate-800 mb-3">
                              {issue.title}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                              <span>👤 {issue.assigneeName}</span>
                              <select
                                aria-label="Đổi trạng thái công việc"
                                value={issue.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    issue.id,
                                    e.target.value as IssueStatus
                                  )
                                }
                                className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="DONE">Done</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BACKLOG & EPICS (TUẦN 3) */}
        {activeTab === 'BACKLOG' && (
          <BacklogAndEpicsView
            currentSprintName={currentProject.currentSprintName}
            epics={currentProject.epics}
            issues={currentProject.issues}
            members={currentProject.members}
            onCreateEpic={handleCreateEpic}
            onDeleteEpic={handleDeleteEpic}
            onOpenCreateIssue={(inBacklog) => {
              setEditingIssue(null);
              setDefaultInBacklog(inBacklog);
              setIsIssueModalOpen(true);
            }}
            onOpenEditIssue={(issue) => {
              setEditingIssue(issue);
              setIsIssueModalOpen(true);
            }}
            onDeleteIssue={handleDeleteIssue}
            onToggleIssueSprint={handleToggleIssueSprint}
          />
        )}

        {/* TAB 3: ADVISOR MILESTONE REVIEW (9 TUẦN) */}
        {activeTab === 'MILESTONES' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Lộ trình Nộp Báo Cáo & Giảng Viên Duyệt Mốc Tiến Độ
                </h2>
                <p className="text-xs text-slate-500">
                  Phân quyền RBAC: <strong>LEADER</strong> có quyền nộp link báo
                  cáo tuần • <strong>ADVISOR (Giảng viên)</strong> có quyền chấm
                  điểm và duyệt mốc.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700">
                Quyền hiện tại của bạn: <strong>{currentUser.projectRole}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {currentProject.milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="border border-slate-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {ms.title}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            ms.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ms.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-700'
                              : ms.status === 'CHANGES_REQUESTED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ms.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{ms.description}</p>
                      {ms.submissionUrl && (
                        <div className="text-xs text-blue-600">
                          🔗 Bài nộp của nhóm:{' '}
                          <a
                            href={ms.submissionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-medium"
                          >
                            {ms.submissionUrl}
                          </a>
                        </div>
                      )}
                      {ms.advisorFeedback && (
                        <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-md mt-2">
                          <strong>Nhận xét của GVHD:</strong>{' '}
                          {ms.advisorFeedback} —{' '}
                          <strong>Điểm mốc: {ms.advisorGrade}/10</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-xs text-slate-500">
                        Hạn nộp: {ms.dueDate}
                      </div>

                      {currentUser.projectRole === 'LEADER' && (
                        <button
                          type="button"
                          onClick={() => handleSubmitMilestone(ms.id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg"
                        >
                          📤 Nộp / Cập nhật Báo cáo
                        </button>
                      )}

                      {currentUser.projectRole === 'ADVISOR' && (
                        <button
                          type="button"
                          onClick={() =>
                            setGradingMilestoneId(
                              gradingMilestoneId === ms.id ? null : ms.id
                            )
                          }
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg"
                        >
                          ✍️ Chấm điểm & Duyệt (GVHD)
                        </button>
                      )}
                    </div>
                  </div>

                  {gradingMilestoneId === ms.id &&
                    currentUser.projectRole === 'ADVISOR' && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 space-y-3 text-xs">
                        <div className="font-bold text-purple-900">
                          🎓 Đánh giá của Giảng viên hướng dẫn cho {ms.title}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Điểm quá trình (Thang 10)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="10"
                              aria-label="Điểm quá trình thang 10"
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block font-semibold text-slate-700 mb-1">
                              Nhận xét / Góp ý cho nhóm sinh viên
                            </label>
                            <input
                              type="text"
                              placeholder="Nhập nhận xét chi tiết cho nhóm..."
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAdvisorReview(ms.id, 'CHANGES_REQUESTED')
                            }
                            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
                          >
                            ⚠️ Yêu cầu chỉnh sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdvisorReview(ms.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            ✅ Duyệt mốc tiến độ (APPROVED)
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTRIBUTION ANALYTICS & ANTI FREE-RIDER */}
        {activeTab === 'CONTRIBUTION' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Bảng Thống Kê Điểm Đóng Góp Cá Nhân & Phát Hiện &ldquo;Gánh
                Team&rdquo; (Cập nhật Real-time theo Story Points)
              </h2>
              <p className="text-sm text-slate-500">
                Công thức tự động:{' '}
                <strong>
                  S = 50% Khối lượng Story Points + 30% Tỷ lệ Đúng hạn + 20%
                  Đánh giá chéo
                </strong>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th className="p-3">Sinh viên</th>
                    <th className="p-3">MSSV</th>
                    <th className="p-3">Task hoàn thành</th>
                    <th className="p-3">Story Points (% Nhóm)</th>
                    <th className="p-3">Đúng hạn</th>
                    <th className="p-3">Peer Review</th>
                    <th className="p-3">Điểm Đóng Góp</th>
                    <th className="p-3">Trạng thái / Cảnh báo</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicContributions.map((m) => (
                    <tr
                      key={m.userId}
                      className={`border-b border-slate-100 ${
                        m.isFreeRiderWarning ? 'bg-red-50/60' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold">{m.fullName}</td>
                      <td className="p-3 font-mono text-xs">{m.studentCode}</td>
                      <td className="p-3">
                        {m.completedIssues}/{m.totalAssignedIssues}
                      </td>
                      <td className="p-3 font-medium">
                        {m.completedStoryPoints} SP ({m.workloadPercentage}%)
                      </td>
                      <td className="p-3">{m.onTimeRate}%</td>
                      <td className="p-3">{m.peerReviewAvgOn5}/5.0</td>
                      <td className="p-3 font-bold text-blue-600">
                        {m.finalContributionScore}/100
                      </td>
                      <td className="p-3">
                        {m.isFreeRiderWarning ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            ⚠️ Cảnh báo Đóng góp thấp (&lt;40% TB)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            ✅ Đóng góp tốt (Hệ số: {m.suggestedGradeFactor}x)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Các Modal của Tuần 2, 3 & 4 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        presetAccounts={PRESET_ACCOUNTS}
        onSelectUser={(u) => setCurrentUser(u)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        currentUser={currentUser}
        onProjectCreated={handleProjectCreated}
      />

      <TeamMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={currentProject.id}
        projectName={currentProject.name}
        currentUser={currentUser}
        members={currentProject.members}
        onAddMember={handleAddMember}
        onUpdateRole={handleUpdateMemberRole}
        onRemoveMember={handleRemoveMember}
      />

      <IssueFormModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setEditingIssue(null);
        }}
        projectKey={currentProject.key}
        nextIssueNumber={currentProject.issueCounter + 1}
        epics={currentProject.epics}
        members={currentProject.members}
        editingIssue={editingIssue}
        defaultInBacklog={defaultInBacklog}
        onSaveIssue={handleSaveIssue}
      />

      <SprintLifecycleModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        currentUser={currentUser}
        sprints={currentProject.sprints}
        activeSprintIssues={activeSprintIssues}
        onCreateSprint={handleCreateSprint}
        onStartSprint={handleStartSprint}
        onCompleteSprint={handleCompleteSprint}
      />
    </div>
  );
}
