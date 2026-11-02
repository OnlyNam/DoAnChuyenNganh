'use client';

import React, { useState } from 'react';
import {
  IssueItem,
  SprintItem,
  UserProfile,
} from '../../types/project.types';

interface SprintLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  sprints: SprintItem[];
  activeSprintIssues: IssueItem[];
  onCreateSprint: (sprint: Omit<SprintItem, 'id'>) => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (
    sprintId: string,
    rolloverTarget: 'NEXT_SPRINT' | 'BACKLOG'
  ) => void;
}

export default function SprintLifecycleModal({
  isOpen,
  onClose,
  currentUser,
  sprints,
  activeSprintIssues,
  onCreateSprint,
  onStartSprint,
  onCompleteSprint,
}: SprintLifecycleModalProps) {
  const [rolloverTarget, setRolloverTarget] = useState<
    'NEXT_SPRINT' | 'BACKLOG'
  >('NEXT_SPRINT');
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLeader = currentUser.projectRole === 'LEADER';
  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const doneCount = activeSprintIssues.filter(
    (i) => i.status === 'DONE'
  ).length;
  const incompleteCount = activeSprintIssues.length - doneCount;

  const handleAddSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLeader || !newSprintName.trim()) return;

    const today = new Date().toISOString().slice(0, 10);
    const twoWeeks = new Date(Date.now() + 14 * 86400000)
      .toISOString()
      .slice(0, 10);

    onCreateSprint({
      name: newSprintName.trim(),
      goal:
        newSprintGoal.trim() ||
        'Hoàn thành các hạng mục được phân công trong giai đoạn này.',
      status: 'PLANNED',
      startDate: today,
      endDate: twoWeeks,
    });

    setNewSprintName('');
    setNewSprintGoal('');
    setNotice('Đã thêm Sprint mới vào kế hoạch dự án!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Tuần 4 • Quản Lý Vòng Đời Sprint (Sprint Lifecycle)
            </span>
            <h3 className="text-lg font-bold mt-0.5">
              Điều Khiển Chu Kỳ Sprint & Luân Chuyển Công Việc Tồn Đọng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm max-h-[82vh] overflow-y-auto">
          {notice && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              ✅ {notice}
            </div>
          )}

          {/* Khung Hoàn thành Active Sprint hiện tại */}
          {activeSprint && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  🏃 Sprint Đang Chạy Hiện Tại (ACTIVE)
                </span>
                <span className="text-xs font-semibold text-blue-700">
                  {activeSprint.startDate} → {activeSprint.endDate}
                </span>
              </div>

              <div className="font-bold text-slate-900 text-base">
                {activeSprint.name}
              </div>
              <p className="text-xs text-slate-600">
                🎯 Mục tiêu: {activeSprint.goal}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-xs">
                  <div className="text-slate-500">Đã hoàn thành (DONE)</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {doneCount} công việc
                  </div>
                </div>
                <div className="bg-white border border-amber-200 rounded-lg p-2.5 text-xs">
                  <div className="text-slate-500">
                    Chưa hoàn thành (Tồn đọng)
                  </div>
                  <div className="text-lg font-bold text-amber-600">
                    {incompleteCount} công việc
                  </div>
                </div>
              </div>

              {incompleteCount > 0 && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khi kết thúc Sprint này, chuyển {incompleteCount} công việc
                    chưa DONE đi đâu?
                  </label>
                  <select
                    aria-label="Chọn đích luân chuyển công việc chưa hoàn thành"
                    value={rolloverTarget}
                    onChange={(e) =>
                      setRolloverTarget(
                        e.target.value as 'NEXT_SPRINT' | 'BACKLOG'
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white font-medium"
                  >
                    <option value="NEXT_SPRINT">
                      ➡️ Chuyển sang Sprint kế tiếp & Tự động kích hoạt Sprint mới
                    </option>
                    <option value="BACKLOG">
                      🗂️ Đẩy toàn bộ công việc chưa xong về lại Product Backlog
                    </option>
                  </select>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!isLeader}
                  onClick={() => {
                    onCompleteSprint(activeSprint.id, rolloverTarget);
                    setNotice(
                      `Đã hoàn thành "${activeSprint.name}" và xử lý ${incompleteCount} công việc tồn đọng!`
                    );
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-40"
                >
                  🏁 Hoàn thành Sprint này (Complete Sprint)
                </button>
              </div>
            </div>
          )}

          {/* Danh sách toàn bộ các Sprints của dự án */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              📅 Danh Sách Tất Cả Sprints Trong Lộ Trình Đồ Án
            </div>
            {sprints.map((sp) => (
              <div
                key={sp.id}
                className="border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs md:text-sm">
                      {sp.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        sp.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sp.status === 'COMPLETED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{sp.goal}</div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {sp.status === 'PLANNED' && (
                    <button
                      type="button"
                      disabled={!isLeader || Boolean(activeSprint)}
                      onClick={() => {
                        onStartSprint(sp.id);
                        setNotice(`Đã bắt đầu chạy "${sp.name}"!`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40"
                      title={
                        activeSprint
                          ? 'Hãy kết thúc Sprint đang chạy trước khi bắt đầu Sprint mới'
                          : 'Bắt đầu chạy Sprint này'
                      }
                    >
                      ▶️ Start Sprint
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form thêm Sprint mới */}
          <form
            onSubmit={handleAddSprint}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              ➕ Thêm Sprint Mới Vào Dự Án
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                disabled={!isLeader}
                placeholder="Tên Sprint (VD: Sprint 5 - Tối ưu)"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
              <input
                type="text"
                disabled={!isLeader}
                placeholder="Mục tiêu Sprint Goal..."
                value={newSprintGoal}
                onChange={(e) => setNewSprintGoal(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={!isLeader}
                className="bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-slate-800 disabled:opacity-40"
              >
                + Tạo Sprint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
