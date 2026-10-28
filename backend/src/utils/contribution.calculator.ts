/**
 * Thuật toán cốt lõi của Đồ án:
 * 1. Tính vị trí kéo thả trên bảng Kanban bằng Floating-Point Indexing (O(1) Database Update)
 * 2. Tính Điểm Đóng Góp Cá Nhân (Contribution Score) & Phát hiện "Gánh team / Free-rider"
 */

export interface MemberIssueStats {
  userId: string;
  fullName: string;
  studentCode: string | null;
  totalAssignedIssues: number;
  completedIssues: number;
  completedOnTimeIssues: number;
  completedStoryPoints: number;
  peerReviewAvgOn5: number; // Trung bình điểm đánh giá chéo từ đồng đội (Thang 1 -> 5)
}

export interface MemberContributionResult extends MemberIssueStats {
  pointScore: number;       // P_i (Thang 100)
  onTimeRate: number;       // T_i (Thang 100)
  peerReviewScore: number;  // R_i (Thang 100)
  finalContributionScore: number; // S_i = 0.5*P_i + 0.3*T_i + 0.2*R_i
  workloadPercentage: number;     // % Story Points đóng góp so với tổng cả nhóm
  isFreeRiderWarning: boolean;    // Cảnh báo nếu Story Points < 40% mức trung bình nhóm
  suggestedGradeFactor: number;   // Hệ số quy đổi điểm gợi ý cho Giảng viên (0.5 -> 1.2)
}

/**
 * 1. Tính vị trí mới khi kéo thả thẻ Issue trên cột Kanban
 * @param prevPosition Vị trí thẻ đứng ngay phía trên (null nếu thả lên đầu cột)
 * @param nextPosition Vị trí thẻ đứng ngay phía dưới (null nếu thả xuống cuối cột)
 */
export function calculateKanbanPosition(
  prevPosition: number | null,
  nextPosition: number | null
): number {
  const DEFAULT_STEP = 1024.0;

  if (prevPosition === null && nextPosition === null) {
    return DEFAULT_STEP;
  }
  if (prevPosition === null && nextPosition !== null) {
    return nextPosition / 2.0;
  }
  if (prevPosition !== null && nextPosition === null) {
    return prevPosition + DEFAULT_STEP;
  }
  return (prevPosition! + nextPosition!) / 2.0;
}

/**
 * 2. Tính toán bảng điểm đóng góp của toàn bộ thành viên trong nhóm sinh viên
 * Công thức: S_i = 0.50 * P_i + 0.30 * T_i + 0.20 * R_i
 */
export function calculateTeamContributions(
  members: MemberIssueStats[]
): MemberContributionResult[] {
  if (members.length === 0) return [];

  const totalTeamPoints = members.reduce(
    (sum, m) => sum + m.completedStoryPoints,
    0
  );
  const expectedAvgPointsPerMember =
    totalTeamPoints > 0 ? totalTeamPoints / members.length : 1;

  return members.map((member) => {
    // 1. P_i: Điểm khối lượng Story Points (Trọng số 50%)
    const rawPointScore =
      totalTeamPoints > 0
        ? (member.completedStoryPoints / expectedAvgPointsPerMember) * 85
        : 0;
    const pointScore = Math.min(100, Math.round(rawPointScore * 10) / 10);

    // 2. T_i: Tỷ lệ hoàn thành đúng hạn On-time Rate (Trọng số 30%)
    const onTimeRate =
      member.totalAssignedIssues > 0
        ? Math.round(
            (member.completedOnTimeIssues / member.totalAssignedIssues) * 1000
          ) / 10
        : 0;

    // 3. R_i: Điểm đánh giá chéo từ đồng đội quy về thang 100 (Trọng số 20%)
    const effectivePeerAvg =
      member.peerReviewAvgOn5 > 0 ? member.peerReviewAvgOn5 : 4.0;
    const peerReviewScore = Math.round((effectivePeerAvg / 5.0) * 1000) / 10;

    // Tổng hợp điểm đóng góp S_i
    const finalContributionScore =
      Math.round(
        (0.5 * pointScore + 0.3 * onTimeRate + 0.2 * peerReviewScore) * 10
      ) / 10;

    // % Đóng góp khối lượng thực tế trên toàn dự án
    const workloadPercentage =
      totalTeamPoints > 0
        ? Math.round((member.completedStoryPoints / totalTeamPoints) * 1000) /
          10
        : 0;

    // Cảnh báo Free-rider nếu khối lượng hoàn thành < 40% mức trung bình kỳ vọng
    const isFreeRiderWarning =
      totalTeamPoints >= 10 &&
      member.completedStoryPoints < expectedAvgPointsPerMember * 0.4;

    // Hệ số điểm gợi ý cho Giảng viên hướng dẫn (từ 0.6 đến 1.15)
    const suggestedGradeFactor =
      Math.round(Math.max(0.6, Math.min(1.15, finalContributionScore / 85)) * 100) /
      100;

    return {
      ...member,
      pointScore,
      onTimeRate,
      peerReviewScore,
      finalContributionScore,
      workloadPercentage,
      isFreeRiderWarning,
      suggestedGradeFactor,
    };
  });
}
