'use client';

import React, { useState } from 'react';
import {
  EpicItem,
  IssueItem,
  IssuePriority,
  IssueType,
  ProjectMemberItem,
} from '../../types/project.types';

interface BacklogAndEpicsViewProps {
  currentSprintName: string;
  epics: EpicItem[];
  issues: IssueItem[];
  members: ProjectMemberItem[];
  onCreateEpic: (epic: Omit<EpicItem, 'id'>) => void;
  onDeleteEpic: (epicId: string) => void;
  onOpenCreateIssue: (defaultInBacklog: boolean) => void;
  onOpenEditIssue: (issue: IssueItem) => void;
  onDeleteIssue: (issueId: string) => void;
  onToggleIssueSprint: (issueId: string, moveToBacklog: boolean) => void;
}

const EPIC_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#059669',
  '#D97706',
  '#DC2626',
  '#0891B2',
];

export default function BacklogAndEpicsView({
  currentSprintName,
  epics,
  issues,
  members,
  onCreateEpic,
  onDeleteEpic,
  onOpenCreateIssue,
  onOpenEditIssue,
  onDeleteIssue,
  onToggleIssueSprint,
}: BacklogAndEpicsViewProps) {
  // Bộ lọc đa tiêu chí (Tuần 3)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpicId, setSelectedEpicId] = useState<string>('ALL');
  const [selectedAssigneeCode, setSelectedAssigneeCode] =
    useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Form tạo Epic nhanh
  const [isAddingEpic, setIsAddingEpic] = useState(false);
  const [newEpicTitle, setNewEpicTitle] = useState('');
  const [newEpicColor, setNewEpicColor] = useState(EPIC_COLORS[0]);

  const studentMembers = members.filter((m) => m.role !== 'ADVISOR');

  const handleAddEpicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpicTitle.trim()) return;
    onCreateEpic({
      title: newEpicTitle.trim(),
      color: newEpicColor,
    });
    setNewEpicTitle('');
    setIsAddingEpic(false);
  };

  // Lọc danh sách Issues theo toàn bộ tiêu chí
  const filteredIssues = issues.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (
      q &&
      !item.title.toLowerCase().includes(q) &&
      !item.issueKey.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (selectedEpicId !== 'ALL' && item.epicId !== selectedEpicId) {
      return false;
    }
    if (
      selectedAssigneeCode !== 'ALL' &&
      item.studentCode !== selectedAssigneeCode
    ) {
      return false;
    }
    if (selectedType !== 'ALL' && item.type !== selectedType) {
      return false;
    }
    if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  const sprintIssues = filteredIssues.filter((i) => !i.inBacklog);
  const backlogIssues = filteredIssues.filter((i) => i.inBacklog);

  const getEpicById = (id?: string | null) =>
    epics.find((e) => e.id === id) || null;

  const renderPriorityBadge = (p: IssuePriority) => {
    const styles: Record<IssuePriority, string> = {
      HIGHEST: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-blue-100 text-blue-700',
      LOW: 'bg-slate-100 text-slate-700',
      LOWEST: 'bg-slate-100 text-slate-500',
    };
    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${styles[p]}`}
      >
        {p}
      </span>
    );
  };

  const renderTypeBadge = (t: IssueType) => {
    const icons: Record<IssueType, string> = {
      STORY: '📗 STORY',
      TASK: '📘 TASK',
      BUG: '📕 BUG',
      REPORT: '📙 REPORT',
    };
    return (
      <span className="text-[11px] font-semibold text-slate-600">
        {icons[t]}
      </span>
    );
  };

  const renderIssueRow = (issue: IssueItem, isBacklogList: boolean) => {
    const epic = getEpicById(issue.epicId);

    return (
      <div
        key={issue.id}
        className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-blue-400 transition"
      >
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <span className="font-mono text-xs font-bold text-blue-600 w-20 shrink-0">
            {issue.issueKey}
          </span>
          {renderTypeBadge(issue.type)}
          <span className="font-medium text-sm text-slate-900">
            {issue.title}
          </span>
          {epic && (
            <span
              style={{
                backgroundColor: `${epic.color}18`,
                color: epic.color,
                borderColor: `${epic.color}40`,
              }}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            >
              📌 {epic.title}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-xs">
          {renderPriorityBadge(issue.priority)}

          <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            {issue.storyPoints} SP
          </span>

          <span
            className={`px-2 py-0.5 rounded font-semibold ${
              issue.status === 'DONE'
                ? 'bg-emerald-100 text-emerald-700'
                : issue.status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-700'
                : issue.status === 'IN_REVIEW'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {issue.status}
          </span>

          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            👤 {issue.assigneeName}
          </span>

          {/* Nút chuyển nhanh giữa Backlog <-> Active Sprint */}
          {isBacklogList ? (
            <button
              type="button"
              onClick={() => onToggleIssueSprint(issue.id, false)}
              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              title="Đưa công việc này lên bảng Kanban của Sprint hiện tại"
            >
              ⬆️ Đưa vào Sprint
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleIssueSprint(issue.id, true)}
              className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
              title="Chuyển công việc này xuống Product Backlog"
            >
              ⬇️ Về Backlog
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenEditIssue(issue)}
            className="px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
          >
            ✏️ Sửa
          </button>

          <button
            type="button"
            onClick={() => onDeleteIssue(issue.id)}
            className="px-2 py-1 rounded border border-red-200 bg-red-50 text-red-600 font-semibold hover:bg-red-100"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KHU VỰC 1: QUẢN LÝ EPICS (CÁC MODULE LỚN CỦA ĐỒ ÁN) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              📌 Danh Mục Epics (Các Phân Hệ / Học Phần Lớn Của Đồ Án)
            </h2>
            <p className="text-xs text-slate-500">
              Bấm vào từng thẻ Epic để lọc nhanh công việc theo phân hệ. Tiến độ
              được tính tự động theo Story Points đã DONE.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingEpic(!isAddingEpic)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-lg shrink-0"
          >
            + Tạo Epic Mới
          </button>
        </div>

        {isAddingEpic && (
          <form
            onSubmit={handleAddEpicSubmit}
            className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 flex flex-wrap items-center gap-3 text-xs"
          >
            <input
              type="text"
              required
              placeholder="Tên Epic (VD: Module 4 - Dashboard & Thống kê)"
              value={newEpicTitle}
              onChange={(e) => setNewEpicTitle(e.target.value)}
              className="flex-1 min-w-[240px] border border-slate-300 rounded-lg px-3 py-2"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Màu:</span>
              {EPIC_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewEpicColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newEpicColor === c
                      ? 'border-slate-900 scale-110'
                      : 'border-transparent'
                  }`}
                />
              ))}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Lưu Epic
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {epics.map((epic) => {
            const epicIssues = issues.filter((i) => i.epicId === epic.id);
            const totalPts = epicIssues.reduce((s, i) => s + i.storyPoints, 0);
            const donePts = epicIssues
              .filter((i) => i.status === 'DONE')
              .reduce((s, i) => s + i.storyPoints, 0);
            const percent =
              totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;
            const isSelected = selectedEpicId === epic.id;

            return (
              <div
                key={epic.id}
                onClick={() =>
                  setSelectedEpicId(isSelected ? 'ALL' : epic.id)
                }
                className={`cursor-pointer rounded-xl border p-3.5 transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: epic.color }}
                      className="w-3 h-3 rounded-full shrink-0"
                    />
                    <span className="font-bold text-xs text-slate-900">
                      {epic.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEpic(epic.id);
                    }}
                    className="text-slate-400 hover:text-red-600 text-xs"
                    title="Xóa Epic"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>
                    {epicIssues.length} công việc ({donePts}/{totalPts} SP)
                  </span>
                  <span className="font-bold text-slate-700">{percent}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${percent}%`,
                      backgroundColor: epic.color,
                    }}
                    className="h-full transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC 2: THANH TÌM KIẾM & BỘ LỌC ĐA TIÊU CHÍ (MULTI-FILTER BAR) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <input
            type="text"
            placeholder="🔍 Tìm theo mã (VD: DACN01-3) hoặc tên công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs min-w-[250px] flex-1"
          />

          <select
            aria-label="Lọc theo thành viên"
            value={selectedAssigneeCode}
            onChange={(e) => setSelectedAssigneeCode(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
          >
            <option value="ALL">👥 Tất cả thành viên</option>
            {studentMembers.map((m) => (
              <option key={m.id} value={m.studentCode || ''}>
                👤 {m.fullName}
              </option>
            ))}
          </select>

          <select
            aria-label="Lọc theo loại công việc"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
          >
            <option value="ALL">🏷️ Tất cả loại</option>
            <option value="STORY">📗 STORY</option>
            <option value="TASK">📘 TASK</option>
            <option value="BUG">📕 BUG</option>
            <option value="REPORT">📙 REPORT (Báo cáo)</option>
          </select>

          <select
            aria-label="Lọc theo độ ưu tiên"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
          >
            <option value="ALL">⚡ Mọi độ ưu tiên</option>
            <option value="HIGHEST">🔥 HIGHEST</option>
            <option value="HIGH">⬆️ HIGH</option>
            <option value="MEDIUM">➖ MEDIUM</option>
            <option value="LOW">⬇️ LOW</option>
          </select>

          {(searchQuery ||
            selectedEpicId !== 'ALL' ||
            selectedAssigneeCode !== 'ALL' ||
            selectedType !== 'ALL' ||
            selectedPriority !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedEpicId('ALL');
                setSelectedAssigneeCode('ALL');
                setSelectedType('ALL');
                setSelectedPriority('ALL');
              }}
              className="text-xs text-red-600 font-semibold hover:underline px-2"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenCreateIssue(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0"
        >
          ➕ Tạo Công Việc Mới
        </button>
      </div>

      {/* KHU VỰC 3A: DANH SÁCH CÔNG VIỆC TRONG ACTIVE SPRINT */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
              ACTIVE SPRINT
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              {currentSprintName} ({sprintIssues.length} công việc •{' '}
              {sprintIssues.reduce((s, i) => s + i.storyPoints, 0)} Story Points)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenCreateIssue(false)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Thêm công việc vào Sprint này
          </button>
        </div>

        <div className="space-y-2">
          {sprintIssues.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-500">
              Không có công việc nào khớp bộ lọc trong Sprint hiện tại.
            </div>
          ) : (
            sprintIssues.map((issue) => renderIssueRow(issue, false))
          )}
        </div>
      </div>

      {/* KHU VỰC 3B: PRODUCT BACKLOG (DỰ TRỮ CHO CÁC SPRINT TIẾP THEO) */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-white">
              PRODUCT BACKLOG
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Danh sách Công việc Chờ Lên Lịch ({backlogIssues.length} công việc
              • {backlogIssues.reduce((s, i) => s + i.storyPoints, 0)} Story
              Points)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenCreateIssue(true)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Thêm công việc vào Backlog
          </button>
        </div>

        <div className="space-y-2">
          {backlogIssues.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-500">
              Product Backlog đang trống. Bấm &ldquo;+ Thêm công việc vào
              Backlog&rdquo; để chuẩn bị cho các Sprint tiếp theo!
            </div>
          ) : (
            backlogIssues.map((issue) => renderIssueRow(issue, true))
          )}
        </div>
      </div>
    </div>
  );
}
