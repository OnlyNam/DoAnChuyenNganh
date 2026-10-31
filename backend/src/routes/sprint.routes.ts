import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * GET /api/sprints/project/:projectId
 * Lấy danh sách tất cả Sprints của dự án kèm thống kê tiến độ Issues & Story Points
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: {
        issues: {
          select: {
            id: true,
            issueKey: true,
            title: true,
            status: true,
            storyPoints: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = sprints.map((sp) => {
      const totalIssues = sp.issues.length;
      const doneIssues = sp.issues.filter((i) => i.status === 'DONE').length;
      const incompleteIssues = totalIssues - doneIssues;
      const totalPoints = sp.issues.reduce((s, i) => s + i.storyPoints, 0);
      const donePoints = sp.issues
        .filter((i) => i.status === 'DONE')
        .reduce((s, i) => s + i.storyPoints, 0);

      return {
        id: sp.id,
        projectId: sp.projectId,
        name: sp.name,
        goal: sp.goal,
        status: sp.status,
        startDate: sp.startDate,
        endDate: sp.endDate,
        totalIssues,
        doneIssues,
        incompleteIssues,
        totalPoints,
        donePoints,
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách Sprints.',
    });
  }
});

/**
 * POST /api/sprints/project/:projectId
 * Tạo Sprint mới trong dự án (Trạng thái mặc định: PLANNED)
 */
router.post('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên Sprint.',
      });
    }

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        name: String(name).trim(),
        goal: goal ? String(goal).trim() : null,
        status: 'PLANNED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Tạo "${sprint.name}" thành công!`,
      data: sprint,
    });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo Sprint mới.',
    });
  }
});

/**
 * PATCH /api/sprints/:sprintId/start
 * Bắt đầu chạy Sprint (Chuyển từ PLANNED -> ACTIVE)
 */
router.patch('/:sprintId/start', async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { goal, startDate, endDate } = req.body;

    const targetSprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!targetSprint) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy Sprint.',
      });
    }

    // Kiểm tra xem dự án đã có Sprint nào đang ACTIVE chưa
    const existingActive = await prisma.sprint.findFirst({
      where: {
        projectId: targetSprint.projectId,
        status: 'ACTIVE',
        id: { not: sprintId },
      },
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `Dự án đang có "${existingActive.name}" ở trạng thái ACTIVE. Vui lòng kết thúc Sprint hiện tại trước khi bắt đầu Sprint mới.`,
      });
    }

    const now = new Date();
    const defaultEnd = new Date(now.getTime() + 14 * 86400000);

    const updated = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: 'ACTIVE',
        ...(goal !== undefined ? { goal } : {}),
        startDate: startDate
          ? new Date(startDate)
          : targetSprint.startDate || now,
        endDate: endDate
          ? new Date(endDate)
          : targetSprint.endDate || defaultEnd,
      },
    });

    return res.json({
      success: true,
      message: `Đã bắt đầu chạy "${updated.name}"!`,
      data: updated,
    });
  } catch (error) {
    console.error('Error starting sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi bắt đầu Sprint.',
    });
  }
});

/**
 * POST /api/sprints/:sprintId/complete
 * Hoàn thành Sprint hiện tại (ACTIVE -> COMPLETED) & Luân chuyển tự động các công việc chưa DONE
 * rolloverTarget: 'BACKLOG' | 'NEXT_SPRINT'
 */
router.post('/:sprintId/complete', async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params;
    const { rolloverTarget = 'NEXT_SPRINT', nextSprintId } = req.body;

    const currentSprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { issues: true },
    });

    if (!currentSprint) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy Sprint cần hoàn thành.',
      });
    }

    const incompleteIssueIds = currentSprint.issues
      .filter((i) => i.status !== 'DONE')
      .map((i) => i.id);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Đánh dấu Sprint hiện tại là COMPLETED
      const completedSprint = await tx.sprint.update({
        where: { id: sprintId },
        data: { status: 'COMPLETED', endDate: new Date() },
      });

      // 2. Xác định đích đến cho các Issues chưa hoàn thành
      let destinationSprintId: string | null = null;

      if (rolloverTarget === 'NEXT_SPRINT') {
        if (nextSprintId) {
          destinationSprintId = String(nextSprintId);
        } else {
          const nextPlanned = await tx.sprint.findFirst({
            where: {
              projectId: currentSprint.projectId,
              status: 'PLANNED',
            },
            orderBy: { createdAt: 'asc' },
          });
          destinationSprintId = nextPlanned?.id || null;
        }

        // Tự động kích hoạt Sprint kế tiếp nếu có
        if (destinationSprintId) {
          await tx.sprint.update({
            where: { id: destinationSprintId },
            data: { status: 'ACTIVE' },
          });
        }
      }

      // 3. Di chuyển toàn bộ Issues chưa DONE sang đích mới (Next Sprint hoặc Backlog)
      if (incompleteIssueIds.length > 0) {
        await tx.issue.updateMany({
          where: { id: { in: incompleteIssueIds } },
          data: { sprintId: destinationSprintId },
        });
      }

      return {
        completedSprint,
        movedIncompleteCount: incompleteIssueIds.length,
        destinationSprintId,
      };
    });

    return res.json({
      success: true,
      message: `Đã hoàn thành "${currentSprint.name}"! Đã luân chuyển ${result.movedIncompleteCount} công việc chưa xong.`,
      data: result,
    });
  } catch (error) {
    console.error('Error completing sprint:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi hoàn thành Sprint.',
    });
  }
});

export default router;
