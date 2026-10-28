'use client';

import React, { useState } from 'react';
import {
  MilestoneItem,
  ProjectTemplate,
  ProjectWorkspace,
  UserProfile,
} from '../../types/project.types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onProjectCreated: (project: ProjectWorkspace) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const DEFAULT_9W_TITLES = [
  'Tuần 1: Phân tích yêu cầu, Use Case & Thiết kế CSDL (ERD)',
  'Tuần 2: Khởi tạo Base Project, Xác thực JWT & Quản lý Không gian nhóm',
  'Tuần 3: Xây dựng Module Backlog, Epic & Quản lý Công việc (Issue CRUD)',
  'Tuần 4: Quản lý Chu kỳ Sprint & Bảng Kanban Kéo-Thả',
  'Tuần 5: Chi tiết Công việc, Bình luận, Đính kèm tệp & Thông báo Real-time',
  'Tuần 6: Cổng Giảng viên duyệt tiến độ & Đánh giá đóng góp chống gánh team',
  'Tuần 7: Dashboard Thống kê, Biểu đồ Burndown & Tính năng mở rộng',
  'Tuần 8: Kiểm thử hệ thống (Testing), Deploy Cloud & Tạo Seed Data',
  'Tuần 9: Nộp Cuốn Báo cáo Đồ án hoàn chỉnh, Slide & Bảo vệ thử',
];

export default function CreateProjectModal({
  isOpen,
  onClose,
  currentUser,
  onProjectCreated,
}: CreateProjectModalProps) {
  const [key, setKey] = useState('DACN02');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('HK1 2026-2027');
  const [templateType, setTemplateType] =
    useState<ProjectTemplate>('CAPSTONE_9W');
  const [advisorName, setAdvisorName] = useState('TS. Nguyễn Minh Hoàng');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !name.trim()) return;

    setLoading(true);
    const normalizedKey = key.trim().toUpperCase();

    const defaultEpics = [
      {
        id: `ep_${Date.now()}_1`,
        title: 'Phân hệ 1: Phân tích Thiết kế & Báo cáo Đồ án',
        color: '#2563EB',
      },
      {
        id: `ep_${Date.now()}_2`,
        title: 'Phân hệ 2: Backend API & Cơ sở dữ liệu',
        color: '#059669',
      },
      {
        id: `ep_${Date.now()}_3`,
        title: 'Phân hệ 3: Giao diện Frontend & Kiểm thử',
        color: '#7C3AED',
      },
    ];

    const generatedMilestones: MilestoneItem[] =
      templateType === 'CAPSTONE_9W'
        ? DEFAULT_9W_TITLES.map((title, idx) => {
            const due = new Date();
            due.setDate(due.getDate() + (idx + 1) * 7);
            return {
              id: `ms_${Date.now()}_${idx + 1}`,
              weekNumber: idx + 1,
              title,
              description: `Mốc báo cáo tiến độ tuần ${idx + 1} theo mẫu Đồ án 9 tuần.`,
              status: 'PENDING',
              dueDate: due.toISOString().slice(0, 10),
            };
          })
        : [];

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: normalizedKey,
          name: name.trim(),
          description: description.trim(),
          semester,
          templateType,
          ownerId: currentUser.id,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const apiProj = json.data;
        const workspace: ProjectWorkspace = {
          id: apiProj.id,
          key: apiProj.key,
          name: apiProj.name,
          description: apiProj.description || '',
          semester: apiProj.semester,
          templateType: apiProj.templateType,
          advisorName,
          currentSprintName:
            apiProj.sprints?.[0]?.name ||
            'Sprint 1 - Phân tích thiết kế & Base System (Tuần 1-2)',
          issueCounter: 1,
          members: [
            {
              id: `pm_${Date.now()}`,
              userId: currentUser.id,
              fullName: currentUser.fullName,
              email: currentUser.email,
              studentCode: currentUser.studentCode,
              systemRole: currentUser.systemRole,
              role: 'LEADER',
              joinedAt: new Date().toISOString().slice(0, 10),
            },
          ],
          epics: defaultEpics,
          issues: [],
          milestones:
            apiProj.milestones?.length > 0
              ? apiProj.milestones.map((m: any) => ({
                  id: m.id,
                  weekNumber: m.weekNumber,
                  title: m.title,
                  description: m.description || '',
                  status: m.status,
                  dueDate: String(m.dueDate).slice(0, 10),
                }))
              : generatedMilestones,
        };
        onProjectCreated(workspace);
        onClose();
        return;
      }
    } catch {
      // Fallback sang state cục bộ nếu chưa bật DB
    } finally {
      setLoading(false);
    }

    const fallbackWorkspace: ProjectWorkspace = {
      id: `proj_${Date.now()}`,
      key: normalizedKey,
      name: name.trim(),
      description: description.trim(),
      semester,
      templateType,
      advisorName,
      currentSprintName:
        'Sprint 1: Khởi động, Phân tích thiết kế & Base System (Tuần 1-2)',
      issueCounter: 1,
      members: [
        {
          id: `pm_${Date.now()}_1`,
          userId: currentUser.id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          studentCode: currentUser.studentCode || 'SV2026001',
          systemRole: 'STUDENT',
          role: 'LEADER',
          joinedAt: new Date().toISOString().slice(0, 10),
        },
        {
          id: `pm_${Date.now()}_2`,
          userId: 'u_advisor',
          fullName: advisorName,
          email: 'gv.huongdan@uni.edu.vn',
          studentCode: null,
          systemRole: 'LECTURER',
          role: 'ADVISOR',
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ],
      epics: defaultEpics,
      issues: [
        {
          id: `iss_${Date.now()}`,
          issueKey: `${normalizedKey}-1`,
          title: 'Khởi tạo đề cương đồ án, phân tích Use Case và thiết kế ERD',
          type: 'REPORT',
          status: 'TODO',
          priority: 'HIGH',
          storyPoints: 5,
          position: 1024,
          epicId: defaultEpics[0].id,
          inBacklog: false,
          assigneeName: currentUser.fullName,
          studentCode: currentUser.studentCode || 'SV2026001',
        },
      ],
      milestones: generatedMilestones,
    };

    onProjectCreated(fallbackWorkspace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Academic Project Template • Tuần 2 & 3
            </span>
            <h3 className="text-lg font-bold mt-0.5">
              Khởi Tạo Không Gian Dự Án Đồ Án Mới
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Dự Án (Key) *
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="VD: DACN02"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold uppercase"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Học kỳ thực hiện *
              </label>
              <input
                type="text"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên đề tài đồ án / dự án phần mềm *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Hệ thống thương mại điện tử tích hợp gợi ý sản phẩm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mẫu lộ trình dự án (Template)
              </label>
              <select
                aria-label="Chọn mẫu lộ trình dự án"
                value={templateType}
                onChange={(e) =>
                  setTemplateType(e.target.value as ProjectTemplate)
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="CAPSTONE_9W">
                  ⭐ Đồ án chuyên ngành 9 Tuần (Tự sinh 9 Milestones)
                </option>
                <option value="COURSE_15W">
                  📚 Đồ án môn học 15 Tuần (Học kỳ)
                </option>
                <option value="SCRUM_BASIC">⚡ Scrum cơ bản (Tự do)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giảng viên hướng dẫn (Advisor)
              </label>
              <input
                type="text"
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả mục tiêu đề tài
            </label>
            <textarea
              rows={2}
              placeholder="Tóm tắt phạm vi và mục tiêu cần đạt trong 9 tuần..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
            <strong>Tự động hóa khi khởi tạo:</strong> Hệ thống sẽ gán bạn (
            <strong>{currentUser.fullName}</strong>) làm{' '}
            <strong>Nhóm trưởng (LEADER)</strong>, tạo sẵn <strong>3 Epics</strong>{' '}
            cùng <strong>9 Mốc báo cáo tuần (Milestones)</strong> chuẩn.
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
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Đang tạo...' : '🚀 Khởi tạo Dự Án 9 Tuần'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
