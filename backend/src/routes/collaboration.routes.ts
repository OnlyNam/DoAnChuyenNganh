import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * GET /api/collaboration/issues/:issueId
 * Lấy toàn bộ Subtasks, Comments, Attachments và ActivityLogs của 1 Issue
 */
router.get('/issues/:issueId', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;

    const [subtasks, comments, attachments, activityLogs] = await Promise.all([
      prisma.subtask.findMany({
        where: { issueId },
        orderBy: { position: 'asc' },
      }),
      prisma.issueComment.findMany({
        where: { issueId },
        include: {
          user: {
            select: { id: true, fullName: true, studentCode: true, systemRole: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.issueAttachment.findMany({
        where: { issueId },
        include: {
          uploader: {
            select: { id: true, fullName: true, studentCode: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.findMany({
        where: { issueId },
        include: {
          actor: {
            select: { id: true, fullName: true, studentCode: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
    ]);

    return res.json({
      success: true,
      data: { subtasks, comments, attachments, activityLogs },
    });
  } catch (error) {
    console.error('Error fetching issue collaboration data:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải dữ liệu chi tiết công việc.',
    });
  }
});

/**
 * POST /api/collaboration/issues/:issueId/subtasks
 * Thêm Subtask (Checklist item) vào Issue
 */
router.post('/issues/:issueId/subtasks', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const { title } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập nội dung đầu việc con (Subtask).',
      });
    }

    const count = await prisma.subtask.count({ where: { issueId } });

    const subtask = await prisma.subtask.create({
      data: {
        issueId,
        title: String(title).trim(),
        isCompleted: false,
        position: count + 1,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Đã thêm đầu việc con (Subtask)!',
      data: subtask,
    });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo Subtask.',
    });
  }
});

/**
 * PATCH /api/collaboration/subtasks/:subtaskId/toggle
 * Đánh dấu hoàn thành / chưa hoàn thành Subtask
 */
router.patch(
  '/subtasks/:subtaskId/toggle',
  async (req: Request, res: Response) => {
    try {
      const { subtaskId } = req.params;

      const existing = await prisma.subtask.findUnique({
        where: { id: subtaskId },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy Subtask.',
        });
      }

      const updated = await prisma.subtask.update({
        where: { id: subtaskId },
        data: { isCompleted: !existing.isCompleted },
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error toggling subtask:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái Subtask.',
      });
    }
  }
);

/**
 * POST /api/collaboration/issues/:issueId/comments
 * Thêm bình luận trao đổi vào Issue (hỗ trợ @mention)
 */
router.post('/issues/:issueId/comments', async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống.',
      });
    }

    const comment = await prisma.issueComment.create({
      data: {
        issueId,
        userId,
        content: String(content).trim(),
      },
      include: {
        user: {
          select: { id: true, fullName: true, studentCode: true, systemRole: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Đã gửi bình luận!',
      data: comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi bình luận.',
    });
  }
});

/**
 * POST /api/collaboration/issues/:issueId/attachments
 * Đính kèm link tài liệu / GitHub PR / file báo cáo vào Issue
 */
router.post(
  '/issues/:issueId/attachments',
  async (req: Request, res: Response) => {
    try {
      const { issueId } = req.params;
      const { uploadedBy, fileName, fileUrl, fileType = 'LINK' } = req.body;

      if (!uploadedBy || !fileName || !fileUrl) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên tài liệu và đường dẫn (URL).',
        });
      }

      const attachment = await prisma.issueAttachment.create({
        data: {
          issueId,
          uploadedBy,
          fileName: String(fileName).trim(),
          fileUrl: String(fileUrl).trim(),
          fileType,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Đã đính kèm tài liệu minh chứng!',
        data: attachment,
      });
    } catch (error) {
      console.error('Error adding attachment:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể đính kèm tài liệu.',
      });
    }
  }
);

export default router;
