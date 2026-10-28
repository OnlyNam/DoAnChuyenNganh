import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { generateCapstone9WeekTemplate } from '../utils/template.generator';
import {
  calculateTeamContributions,
  MemberIssueStats,
} from '../utils/contribution.calculator';

const router = Router();

/**
 * GET /api/projects
 * Lấy danh sách các dự án đồ án kèm thống kê nhanh & thành viên
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const projects = await prisma.project.findMany({
      where: userId
        ? {
            members: {
              some: { userId: String(userId) },
            },
          }
        : undefined,
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, studentCode: true },
        },
        advisor: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                studentCode: true,
                systemRole: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: { issues: true, sprints: true, milestones: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi khi tải danh sách dự án' });
  }
});

/**
 * GET /api/projects/:projectId
 * Lấy thông tin chi tiết của 1 dự án (Thành viên, Sprints, Milestones, Issues)
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true, studentCode: true },
        },
        advisor: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                studentCode: true,
                systemRole: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        sprints: { orderBy: { startDate: 'asc' } },
        milestones: { orderBy: { weekNumber: 'asc' } },
        issues: {
          include: {
            assignee: {
              select: { id: true, fullName: true, studentCode: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy dự án' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi khi tải chi tiết dự án' });
  }
});

/**
 * POST /api/projects
 * Khởi tạo Dự án mới (Tự động sinh 9 Milestones & 4 Sprints nếu dùng mẫu CAPSTONE_9W)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      key,
      name,
      description,
      semester,
      templateType = 'CAPSTONE_9W',
      ownerId,
      advisorId,
      startDate,
    } = req.body;

    if (!key || !name || !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Mã dự án (key), Tên đề tài và Người tạo (ownerId).',
      });
    }

    const normalizedKey = String(key).trim().toUpperCase();

    const existingKey = await prisma.project.findUnique({
      where: { key: normalizedKey },
    });
    if (existingKey) {
      return res.status(409).json({
        success: false,
        message: `Mã dự án "${normalizedKey}" đã tồn tại. Vui lòng chọn mã khác.`,
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 63); // 9 tuần = 63 ngày

    const templateData =
      templateType === 'CAPSTONE_9W'
        ? generateCapstone9WeekTemplate(start)
        : { milestones: [], sprints: [] };

    const newProject = await prisma.project.create({
      data: {
        key: normalizedKey,
        name: String(name).trim(),
        description,
        semester: semester || 'HK1 2026-2027',
        templateType,
        ownerId,
        advisorId: advisorId || null,
        startDate: start,
        endDate: end,
        members: {
          create: [
            { userId: ownerId, role: 'LEADER' },
            ...(advisorId && advisorId !== ownerId
              ? [{ userId: advisorId, role: 'ADVISOR' as const }]
              : []),
          ],
        },
        sprints: {
          create: templateData.sprints.map((s, idx) => ({
            name: s.name,
            goal: s.goal,
            status: idx === 0 ? 'ACTIVE' : 'PLANNED',
            startDate: s.startDate,
            endDate: s.endDate,
          })),
        },
        milestones: {
          create: templateData.milestones.map((m) => ({
            weekNumber: m.weekNumber,
            title: m.title,
            description: m.description,
            dueDate: m.dueDate,
            status: 'PENDING',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, studentCode: true },
            },
          },
        },
        sprints: true,
        milestones: { orderBy: { weekNumber: 'asc' } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Khởi tạo dự án đồ án 9 tuần thành công!',
      data: newProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res
      .status(500)
      .json({ success: false, message: 'Không thể khởi tạo dự án' });
  }
});

/**
 * POST /api/projects/:projectId/members
 * Mời Sinh viên hoặc Giảng viên hướng dẫn vào dự án bằng Email hoặc MSSV (studentCode)
 */
router.post('/:projectId/members', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { identifier, role = 'MEMBER' } = req.body; // identifier có thể là Email hoặc MSSV

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập Email hoặc Mã số sinh viên (MSSV) để mời vào nhóm.',
      });
    }

    const cleanIdentifier = String(identifier).trim();

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanIdentifier, mode: 'insensitive' } },
          { studentCode: { equals: cleanIdentifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tài khoản nào khớp với "${cleanIdentifier}".`,
      });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: `${targetUser.fullName} đã là thành viên của dự án này.`,
      });
    }

    const assignedRole =
      role || (targetUser.systemRole === 'LECTURER' ? 'ADVISOR' : 'MEMBER');

    const newMembership = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: assignedRole,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentCode: true,
            systemRole: true,
          },
        },
      },
    });

    // Nếu gán làm Giảng viên hướng dẫn (ADVISOR), cập nhật luôn trường advisorId của Project
    if (assignedRole === 'ADVISOR') {
      await prisma.project.update({
        where: { id: projectId },
        data: { advisorId: targetUser.id },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Đã thêm ${targetUser.fullName} vào dự án với vai trò ${assignedRole}!`,
      data: newMembership,
    });
  } catch (error) {
    console.error('Error adding project member:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm thành viên vào dự án.',
    });
  }
});

/**
 * PATCH /api/projects/:projectId/members/:userId
 * Cập nhật vai trò thành viên trong dự án (LEADER | MEMBER | ADVISOR)
 */
router.patch(
  '/:projectId/members/:userId',
  async (req: Request, res: Response) => {
    try {
      const { projectId, userId } = req.params;
      const { role } = req.body;

      const updated = await prisma.projectMember.update({
        where: {
          projectId_userId: { projectId, userId },
        },
        data: { role },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              studentCode: true,
            },
          },
        },
      });

      return res.json({
        success: true,
        message: 'Đã cập nhật vai trò thành viên!',
        data: updated,
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật vai trò thành viên.',
      });
    }
  }
);

/**
 * DELETE /api/projects/:projectId/members/:userId
 * Xóa thành viên khỏi nhóm dự án
 */
router.delete(
  '/:projectId/members/:userId',
  async (req: Request, res: Response) => {
    try {
      const { projectId, userId } = req.params;

      await prisma.projectMember.delete({
        where: {
          projectId_userId: { projectId, userId },
        },
      });

      return res.json({
        success: true,
        message: 'Đã xóa thành viên khỏi nhóm dự án.',
      });
    } catch (error) {
      console.error('Error removing project member:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể xóa thành viên khỏi dự án.',
      });
    }
  }
);

/**
 * GET /api/projects/:projectId/contributions
 * Tính toán Bảng Điểm Đóng Góp & Cảnh Báo "Gánh Team / Free-rider" cho Giảng viên và Nhóm
 */
router.get('/:projectId/contributions', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const studentMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        role: { in: ['LEADER', 'MEMBER'] },
      },
      include: {
        user: true,
      },
    });

    const projectIssues = await prisma.issue.findMany({
      where: { projectId },
    });

    const peerEvaluations = await prisma.peerEvaluation.findMany({
      where: { projectId },
    });

    const statsInput: MemberIssueStats[] = studentMembers.map((member) => {
      const assigned = projectIssues.filter(
        (i) => i.assigneeId === member.userId
      );
      const completed = assigned.filter((i) => i.status === 'DONE');
      const completedOnTime = completed.filter((i) => {
        if (!i.dueDate || !i.completedAt) return true;
        return new Date(i.completedAt) <= new Date(i.dueDate);
      });
      const completedStoryPoints = completed.reduce(
        (sum, i) => sum + i.storyPoints,
        0
      );

      const receivedReviews = peerEvaluations.filter(
        (ev) => ev.revieweeId === member.userId
      );
      const peerReviewAvgOn5 =
        receivedReviews.length > 0
          ? receivedReviews.reduce(
              (sum, ev) =>
                sum +
                (ev.responsibilityScore + ev.qualityScore + ev.teamworkScore) /
                  3,
              0
            ) / receivedReviews.length
          : 4.2;

      return {
        userId: member.userId,
        fullName: member.user.fullName,
        studentCode: member.user.studentCode,
        totalAssignedIssues: assigned.length,
        completedIssues: completed.length,
        completedOnTimeIssues: completedOnTime.length,
        completedStoryPoints,
        peerReviewAvgOn5: Math.round(peerReviewAvgOn5 * 10) / 10,
      };
    });

    const contributionResults = calculateTeamContributions(statsInput);

    res.json({
      success: true,
      data: contributionResults,
    });
  } catch (error) {
    console.error('Error calculating contributions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính toán điểm đóng góp thành viên',
    });
  }
});

export default router;
