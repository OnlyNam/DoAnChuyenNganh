import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

/**
 * GET /api/milestones/project/:projectId
 * Lấy danh sách 9 Mốc báo cáo tuần của nhóm sinh viên
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      include: {
        sprint: { select: { id: true, name: true, status: true } },
      },
      orderBy: { weekNumber: 'asc' },
    });

    res.json({ success: true, data: milestones });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải các mốc tiến độ' });
  }
});

/**
 * PATCH /api/milestones/:milestoneId/submit
 * Nhóm trưởng nộp báo cáo tiến độ tuần cho Giảng viên hướng dẫn
 */
router.patch('/:milestoneId/submit', async (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params;
    const { submissionUrl, submissionNote } = req.body;

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        submissionUrl,
        submissionNote,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Đã nộp báo cáo mốc tiến độ cho Giảng viên hướng dẫn!',
      data: updated,
    });
  } catch (error) {
    console.error('Error submitting milestone:', error);
    res.status(500).json({ success: false, message: 'Không thể nộp báo cáo tiến độ' });
  }
});

/**
 * PATCH /api/milestones/:milestoneId/review
 * Giảng viên hướng dẫn duyệt báo cáo, chấm điểm và để lại nhận xét
 */
router.patch('/:milestoneId/review', async (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params;
    const { status, advisorFeedback, advisorGrade } = req.body;

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status, // 'APPROVED' | 'CHANGES_REQUESTED'
        advisorFeedback,
        advisorGrade: advisorGrade !== undefined ? Number(advisorGrade) : null,
        reviewedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Đã lưu đánh giá và điểm số của Giảng viên hướng dẫn!',
      data: updated,
    });
  } catch (error) {
    console.error('Error reviewing milestone:', error);
    res.status(500).json({ success: false, message: 'Không thể lưu đánh giá của giảng viên' });
  }
});

export default router;
