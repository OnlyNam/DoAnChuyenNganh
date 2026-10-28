import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { calculateKanbanPosition } from '../utils/contribution.calculator';

const router = Router();

/**
 * GET /api/issues/project/:projectId
 * Lấy toàn bộ Issues của dự án kèm bộ lọc đa tiêu chí (Tuần 3):
 * - search: Tìm theo mã issueKey hoặc tiêu đề
 * - sprintId: Lọc theo Sprint hoặc 'backlog' (sprintId = null)
 * - epicId: Lọc theo Epic
 * - type: STORY | TASK | BUG | REPORT
 * - priority: LOWEST | LOW | MEDIUM | HIGH | HIGHEST
 * - status: TODO | IN_PROGRESS | IN_REVIEW | DONE
 * - assigneeId: Lọc theo sinh viên phụ trách
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      search,
      sprintId,
      epicId,
      type,
      priority,
      status,
      assigneeId,
    } = req.query;

    const searchStr = search ? String(search).trim() : '';

    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        ...(sprintId !== undefined
          ? { sprintId: sprintId === 'backlog' ? null : String(sprintId) }
          : {}),
        ...(epicId ? { epicId: String(epicId) } : {}),
        ...(type ? { type: type as any } : {}),
        ...(priority ? { priority: priority as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(assigneeId ? { assigneeId: String(assigneeId) } : {}),
        ...(searchStr
          ? {
              OR: [
                { issueKey: { contains: searchStr, mode: 'insensitive' } },
                { title: { contains: searchStr, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        epic: { select: { id: true, title: true, color: true } },
        sprint: { select: { id: true, name: true, status: true } },
        subtasks: { orderBy: { position: 'asc' } },
        _count: { select: { comments: true, attachments: true } },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    res.json({ success: true, data: issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi khi tải danh sách công việc' });
  }
});

/**
 * POST /api/issues/project/:projectId
 * Tạo Issue/Task mới với mã tự tăng trong Transaction (VD: DACN01-7)
 */
router.post('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      sprintId,
      epicId,
      title,
      description,
      type = 'TASK',
      priority = 'MEDIUM',
      storyPoints = 3,
      assigneeId,
      reporterId,
      dueDate,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tiêu đề công việc.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { issueCounter: { increment: 1 } },
      });

      const issueNumber = updatedProject.issueCounter;
      const issueKey = `${updatedProject.key}-${issueNumber}`;

      const lastIssueInColumn = await tx.issue.findFirst({
        where: { projectId, sprintId: sprintId || null, status: 'TODO' },
        orderBy: { position: 'desc' },
      });

      const nextPosition = calculateKanbanPosition(
        lastIssueInColumn?.position ?? null,
        null
      );

      return tx.issue.create({
        data: {
          projectId,
          sprintId: sprintId || null,
          epicId: epicId || null,
          issueKey,
          issueNumber,
          title: String(title).trim(),
          description: description ? String(description).trim() : null,
          type,
          status: 'TODO',
          priority,
          storyPoints: Number(storyPoints) || 1,
          position: nextPosition,
          assigneeId: assigneeId || null,
          reporterId,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: {
          assignee: {
            select: { id: true, fullName: true, studentCode: true },
          },
          epic: { select: { id: true, title: true, color: true } },
          sprint: { select: { id: true, name: true, status: true } },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: `Tạo công việc [${result.issueKey}] thành công!`,
      data: result,
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res
      .status(500)
      .json({ success: false, message: 'Không thể tạo công việc mới' });
  }
});

/**
 * PATCH /api/issues/:issueId
 * Chỉnh sửa thông tin toàn diện của Issue (Tuần 3 - Issue CRUD):
 * Tiêu đề, Mô tả, Loại, Độ ưu tiên, Story Points, Epic, Sprint/Backlog, Người phụ trách, Hạn chót
 */
router.patch('/:issueId', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const {
      title,
      description,
      type,
      status,
      priority,
      storyPoints,
      epicId,
      sprintId,
      assigneeId,
      dueDate,
    } = req.body;

    const existing = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc cần chỉnh sửa.',
      });
    }

    const isTransitioningToDone =
      status === 'DONE' && existing.status !== 'DONE';

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(storyPoints !== undefined
          ? { storyPoints: Number(storyPoints) }
          : {}),
        ...(epicId !== undefined ? { epicId: epicId || null } : {}),
        ...(sprintId !== undefined ? { sprintId: sprintId || null } : {}),
        ...(assigneeId !== undefined
          ? { assigneeId: assigneeId || null }
          : {}),
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
        ...(status !== undefined
          ? {
              completedAt: isTransitioningToDone
                ? new Date()
                : status !== 'DONE'
                ? null
                : existing.completedAt,
            }
          : {}),
      },
      include: {
        assignee: { select: { id: true, fullName: true, studentCode: true } },
        epic: { select: { id: true, title: true, color: true } },
        sprint: { select: { id: true, name: true, status: true } },
      },
    });

    return res.json({
      success: true,
      message: `Đã cập nhật công việc [${updated.issueKey}]!`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin công việc.',
    });
  }
});

/**
 * PATCH /api/issues/:issueId/move
 * Kéo thả thẻ công việc trên bảng Kanban (Cập nhật cột Status và thứ tự Position O(1))
 */
router.patch('/:issueId/move', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const {
      targetStatus,
      targetSprintId,
      prevPosition = null,
      nextPosition = null,
      actorId,
    } = req.body;

    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!existingIssue) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy công việc' });
    }

    const newPosition = calculateKanbanPosition(prevPosition, nextPosition);
    const isMovingToDone =
      targetStatus === 'DONE' && existingIssue.status !== 'DONE';

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        status: targetStatus ?? existingIssue.status,
        sprintId:
          targetSprintId !== undefined
            ? targetSprintId
            : existingIssue.sprintId,
        position: newPosition,
        completedAt: isMovingToDone
          ? new Date()
          : targetStatus !== 'DONE'
          ? null
          : existingIssue.completedAt,
      },
      include: {
        assignee: { select: { id: true, fullName: true, studentCode: true } },
      },
    });

    if (actorId && targetStatus && targetStatus !== existingIssue.status) {
      await prisma.activityLog.create({
        data: {
          projectId: existingIssue.projectId,
          issueId: existingIssue.id,
          actorId,
          actionType: 'STATUS_CHANGED',
          oldValue: existingIssue.status,
          newValue: targetStatus,
        },
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật vị trí Kanban thành công',
      data: updatedIssue,
    });
  } catch (error) {
    console.error('Error moving issue on Kanban:', error);
    res
      .status(500)
      .json({ success: false, message: 'Lỗi khi di chuyển thẻ Kanban' });
  }
});

/**
 * DELETE /api/issues/:issueId
 * Xóa công việc khỏi dự án (Tuần 3 - Issue CRUD)
 */
router.delete('/:issueId', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;

    await prisma.issue.delete({
      where: { id: issueId },
    });

    return res.json({
      success: true,
      message: 'Đã xóa công việc khỏi dự án.',
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa công việc.',
    });
  }
});

export default router;
