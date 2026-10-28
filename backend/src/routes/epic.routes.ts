import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * GET /api/epics/project/:projectId
 * Lấy danh sách các Epics (Modules lớn của đồ án) kèm thống kê tiến độ hoàn thành
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const epics = await prisma.epic.findMany({
      where: { projectId },
      include: {
        issues: {
          select: {
            id: true,
            status: true,
            storyPoints: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = epics.map((epic) => {
      const totalIssues = epic.issues.length;
      const doneIssues = epic.issues.filter((i) => i.status === 'DONE').length;
      const totalPoints = epic.issues.reduce((s, i) => s + i.storyPoints, 0);
      const donePoints = epic.issues
        .filter((i) => i.status === 'DONE')
        .reduce((s, i) => s + i.storyPoints, 0);

      const progressPercent =
        totalPoints > 0
          ? Math.round((donePoints / totalPoints) * 100)
          : totalIssues > 0
          ? Math.round((doneIssues / totalIssues) * 100)
          : 0;

      return {
        id: epic.id,
        projectId: epic.projectId,
        title: epic.title,
        description: epic.description,
        color: epic.color,
        startDate: epic.startDate,
        dueDate: epic.dueDate,
        totalIssues,
        doneIssues,
        totalPoints,
        donePoints,
        progressPercent,
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching epics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách Epics của dự án.',
    });
  }
});

/**
 * POST /api/epics/project/:projectId
 * Tạo Epic (Hạng mục lớn) mới cho dự án đồ án
 */
router.post('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      color = '#3B82F6',
      startDate,
      dueDate,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên Epic / Module.',
      });
    }

    const epic = await prisma.epic.create({
      data: {
        projectId,
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        color,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo Epic mới thành công!',
      data: epic,
    });
  } catch (error) {
    console.error('Error creating epic:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo Epic mới.',
    });
  }
});

/**
 * PATCH /api/epics/:epicId
 * Cập nhật thông tin Epic
 */
router.patch('/:epicId', async (req: Request, res: Response) => {
  try {
    const { epicId } = req.params;
    const { title, description, color, startDate, dueDate } = req.body;

    const updated = await prisma.epic.update({
      where: { id: epicId },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(startDate !== undefined
          ? { startDate: startDate ? new Date(startDate) : null }
          : {}),
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
      },
    });

    return res.json({
      success: true,
      message: 'Đã cập nhật Epic thành công!',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating epic:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật Epic.',
    });
  }
});

/**
 * DELETE /api/epics/:epicId
 * Xóa Epic (Các Issue thuộc Epic sẽ tự động được gán epicId = null)
 */
router.delete('/:epicId', async (req: Request, res: Response) => {
  try {
    const { epicId } = req.params;

    await prisma.epic.delete({
      where: { id: epicId },
    });

    return res.json({
      success: true,
      message: 'Đã xóa Epic khỏi dự án.',
    });
  } catch (error) {
    console.error('Error deleting epic:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa Epic.',
    });
  }
});

export default router;
