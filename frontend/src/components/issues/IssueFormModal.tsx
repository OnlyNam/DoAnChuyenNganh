'use client';

import React, { useEffect, useState } from 'react';
import {
  EpicItem,
  IssueItem,
  IssuePriority,
  IssueStatus,
  IssueType,
  ProjectMemberItem,
} from '../../types/project.types';

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectKey: string;
  nextIssueNumber: number;
  epics: EpicItem[];
  members: ProjectMemberItem[];
  editingIssue?: IssueItem | null;
  defaultInBacklog?: boolean;
  onSaveIssue: (issueData: Omit<IssueItem, 'id' | 'issueKey' | 'position'>, existingId?: string) => void;
}

const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13];

export default function IssueFormModal({
  isOpen,
  onClose,
  projectKey,
  nextIssueNumber,
  epics,
  members,
  editingIssue,
  defaultInBacklog = false,
  onSaveIssue,
}: IssueFormModalProps) {
  const studentMembers = members.filter((m) => m.role !== 'ADVISOR');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('TASK');
  const [status, setStatus] = useState<IssueStatus>('TODO');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [epicId, setEpicId] = useState<string>('');
  const [inBacklog, setInBacklog] = useState<boolean>(defaultInBacklog);
  const [selectedStudentCode, setSelectedStudentCode] = useState<string>(
    studentMembers[0]?.studentCode || 'SV2026001'
  );
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (editingIssue) {
      setTitle(editingIssue.title);
      setDescription(editingIssue.description || '');
      setType(editingIssue.type);
      setStatus(editingIssue.status);
      setPriority(editingIssue.priority);
      setStoryPoints(editingIssue.storyPoints);
      setEpicId(editingIssue.epicId || '');
      setInBacklog(Boolean(editingIssue.inBacklog));
      setSelectedStudentCode(editingIssue.studentCode);
      setDueDate(editingIssue.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setType('TASK');
      setStatus('TODO');
      setPriority('MEDIUM');
      setStoryPoints(3);
      setEpicId(epics[0]?.id || '');
      setInBacklog(defaultInBacklog);
      setSelectedStudentCode(studentMembers[0]?.studentCode || 'SV2026001');
      const nextWeek = new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .slice(0, 10);
      setDueDate(nextWeek);
    }
  }, [editingIssue, defaultInBacklog, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedMember =
      studentMembers.find((m) => m.studentCode === selectedStudentCode) ||
      studentMembers[0];

    onSaveIssue(
      {
        title: title.trim(),
        description: description.trim(),
        type,
        status,
        priority,
        storyPoints: Number(storyPoints) || 1,
        epicId: epicId || null,
        inBacklog,
        assigneeName: assignedMember?.fullName || 'Chưa phân công',
        studentCode: assignedMember?.studentCode || 'SV2026001',
        dueDate: dueDate || undefined,
      },
      editingIssue?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
              Tuần 3 • Quản Lý Công Việc & Ước Lượng Story Points
            </span>
            <h3 className="text-lg font-bold mt-0.5">
              {editingIssue
                ? `Chỉnh Sửa Công Việc [${editingIssue.issueKey}]`
                : `Tạo Công Việc Mới [${projectKey}-${nextIssueNumber}]`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề công việc (Summary) *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Xây dựng giao diện Quản lý Backlog và bộ lọc đa tiêu chí"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại công việc (Issue Type)
              </label>
              <select
                aria-label="Chọn loại công việc"
                value={type}
                onChange={(e) => setType(e.target.value as IssueType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs font-medium"
              >
                <option value="STORY">📗 STORY (Tính năng người dùng)</option>
                <option value="TASK">📘 TASK (Cài đặt kỹ thuật)</option>
                <option value="BUG">📕 BUG (Sửa lỗi phần mềm)</option>
                <option value="REPORT">📙 REPORT (Viết báo cáo đồ án)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Độ ưu tiên (Priority)
              </label>
              <select
                aria-label="Chọn độ ưu tiên"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs font-medium"
              >
                <option value="HIGHEST">🔥 HIGHEST (Khẩn cấp)</option>
                <option value="HIGH">⬆️ HIGH (Cao)</option>
                <option value="MEDIUM">➖ MEDIUM (Trung bình)</option>
                <option value="LOW">⬇️ LOW (Thấp)</option>
                <option value="LOWEST">💤 LOWEST (Rất thấp)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Story Points (Fibonacci)
              </label>
              <select
                aria-label="Chọn điểm độ khó Story Points"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs font-bold text-blue-700"
              >
                {FIBONACCI_POINTS.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt} Story Points {pt >= 8 ? '(Phức tạp)' : pt <= 2 ? '(Nhỏ)' : '(Vừa)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thuộc Epic (Module lớn của đồ án)
              </label>
              <select
                aria-label="Chọn Epic"
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs"
              >
                <option value="">— Không gắn Epic —</option>
                {epics.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    📌 {ep.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vị trí lưu trữ (Sprint hay Backlog)
              </label>
              <select
                aria-label="Chọn vị trí lưu trữ"
                value={inBacklog ? 'BACKLOG' : 'SPRINT'}
                onChange={(e) => setInBacklog(e.target.value === 'BACKLOG')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs font-medium"
              >
                <option value="SPRINT">
                  🏃 Đưa thẳng vào Active Sprint (Hiện trên Kanban)
                </option>
                <option value="BACKLOG">
                  🗂️ Lưu vào Product Backlog (Chờ Sprint sau)
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sinh viên phụ trách (Assignee)
              </label>
              <select
                aria-label="Chọn sinh viên phụ trách"
                value={selectedStudentCode}
                onChange={(e) => setSelectedStudentCode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs"
              >
                {studentMembers.map((m) => (
                  <option key={m.id} value={m.studentCode || m.id}>
                    👤 {m.fullName} ({m.studentCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái (Status)
              </label>
              <select
                aria-label="Chọn trạng thái"
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-xs"
              >
                <option value="TODO">TO DO (Cần làm)</option>
                <option value="IN_PROGRESS">IN PROGRESS (Đang làm)</option>
                <option value="IN_REVIEW">IN REVIEW (Chờ duyệt)</option>
                <option value="DONE">DONE (Hoàn thành)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn hoàn thành (Due Date)
              </label>
              <input
                type="date"
                aria-label="Hạn hoàn thành"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết & Tiêu chí nghiệm thu (Acceptance Criteria)
            </label>
            <textarea
              rows={3}
              placeholder="Ghi rõ các yêu cầu đầu ra hoặc link tài liệu tham khảo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              {editingIssue ? '💾 Lưu thay đổi' : '➕ Tạo Công Việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
