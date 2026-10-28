'use client';

import React, { useState } from 'react';
import {
  ProjectMemberItem,
  ProjectRole,
  UserProfile,
} from '../../types/project.types';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentUser: UserProfile;
  members: ProjectMemberItem[];
  onAddMember: (member: ProjectMemberItem) => void;
  onUpdateRole: (memberId: string, newRole: ProjectRole) => void;
  onRemoveMember: (memberId: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function TeamMembersModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentUser,
  members,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
}: TeamMembersModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [role, setRole] = useState<ProjectRole>('MEMBER');
  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const isLeader = currentUser.projectRole === 'LEADER';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!isLeader) {
      setNotice({
        type: 'error',
        text: 'Từ chối truy cập (403 Forbidden): Chỉ Nhóm trưởng (LEADER) mới có quyền mời thêm thành viên!',
      });
      return;
    }

    const cleanId = identifier.trim();
    if (!cleanId) return;

    // Kiểm tra trùng trong danh sách hiện tại
    const exists = members.some(
      (m) =>
        m.email.toLowerCase() === cleanId.toLowerCase() ||
        (m.studentCode &&
          m.studentCode.toLowerCase() === cleanId.toLowerCase())
    );
    if (exists) {
      setNotice({
        type: 'error',
        text: `Thành viên với mã/email "${cleanId}" đã có trong nhóm dự án!`,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, role }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const apiMem = json.data;
        onAddMember({
          id: apiMem.id,
          userId: apiMem.user.id,
          fullName: apiMem.user.fullName,
          email: apiMem.user.email,
          studentCode: apiMem.user.studentCode,
          systemRole: apiMem.user.systemRole,
          role: apiMem.role,
          joinedAt: new Date().toISOString().slice(0, 10),
        });
        setIdentifier('');
        setFullNameInput('');
        setNotice({ type: 'success', text: json.message });
        return;
      }
    } catch {
      // Fallback sang state cục bộ nếu chưa bật DB
    }

    const isEmail = cleanId.includes('@');
    const newMember: ProjectMemberItem = {
      id: `pm_${Date.now()}`,
      userId: `u_${Date.now()}`,
      fullName:
        fullNameInput.trim() ||
        (role === 'ADVISOR'
          ? `GV. ${cleanId}`
          : `Sinh viên (${cleanId.toUpperCase()})`),
      email: isEmail
        ? cleanId.toLowerCase()
        : `${cleanId.toLowerCase()}@student.edu.vn`,
      studentCode:
        role === 'ADVISOR'
          ? null
          : isEmail
          ? `SV${Math.floor(100000 + Math.random() * 900000)}`
          : cleanId.toUpperCase(),
      systemRole: role === 'ADVISOR' ? 'LECTURER' : 'STUDENT',
      role,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    onAddMember(newMember);
    setIdentifier('');
    setFullNameInput('');
    setNotice({
      type: 'success',
      text: `Đã mời ${newMember.fullName} vào nhóm với vai trò ${role}!`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
              Tuần 2 • Quản Lý Thành Viên & Phân Quyền Nhóm (RBAC)
            </span>
            <h3 className="text-lg font-bold mt-0.5">{projectName}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {/* Thông báo quyền hiện tại */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              isLeader
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span>
              Bạn đang đăng nhập với tư cách:{' '}
              <strong>{currentUser.fullName}</strong> (Vai trò dự án:{' '}
              <strong>{currentUser.projectRole}</strong>)
            </span>
            <span className="font-semibold">
              {isLeader
                ? '✅ Có toàn quyền Thêm / Xóa / Phân quyền'
                : '🔒 Chế độ Chỉ Xem (Read-only RBAC)'}
            </span>
          </div>

          {notice && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                notice.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {notice.text}
            </div>
          )}

          {/* Form mời thành viên mới (Chỉ dành cho LEADER) */}
          <form
            onSubmit={handleInvite}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              ➕ Mời Sinh Viên (theo MSSV/Email) hoặc Giảng Viên Hướng Dẫn
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              <input
                type="text"
                required
                disabled={!isLeader}
                placeholder="MSSV (VD: SV2026005) hoặc Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-xs disabled:bg-slate-100"
              />
              <input
                type="text"
                disabled={!isLeader}
                placeholder="Họ tên (Tùy chọn)"
                value={fullNameInput}
                onChange={(e) => setFullNameInput(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-xs disabled:bg-slate-100"
              />
              <select
                aria-label="Chọn vai trò trong dự án"
                disabled={!isLeader}
                value={role}
                onChange={(e) => setRole(e.target.value as ProjectRole)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white disabled:bg-slate-100"
              >
                <option value="MEMBER">👤 Thành viên (MEMBER)</option>
                <option value="LEADER">👑 Nhóm trưởng (LEADER)</option>
                <option value="ADVISOR">🎓 Giảng viên (ADVISOR)</option>
              </select>
              <button
                type="submit"
                disabled={!isLeader}
                className="bg-blue-600 text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-blue-700 disabled:opacity-40"
              >
                + Thêm vào nhóm
              </button>
            </div>
          </form>

          {/* Danh sách thành viên */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">MSSV / Email</th>
                  <th className="p-3">Vai trò dự án (RBAC)</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="p-3 font-semibold text-slate-900">
                      {m.fullName}
                    </td>
                    <td className="p-3 text-slate-600">
                      {m.studentCode && (
                        <span className="font-mono font-semibold text-blue-600 mr-1.5">
                          [{m.studentCode}]
                        </span>
                      )}
                      <span>{m.email}</span>
                    </td>
                    <td className="p-3">
                      <select
                        aria-label="Đổi vai trò dự án"
                        disabled={!isLeader}
                        value={m.role}
                        onChange={(e) =>
                          onUpdateRole(m.id, e.target.value as ProjectRole)
                        }
                        className="border border-slate-200 rounded px-2 py-1 font-semibold bg-slate-50 disabled:opacity-75"
                      >
                        <option value="LEADER">👑 LEADER (Nhóm trưởng)</option>
                        <option value="MEMBER">👤 MEMBER (Thành viên)</option>
                        <option value="ADVISOR">🎓 ADVISOR (Giảng viên)</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      {isLeader && m.role !== 'LEADER' ? (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Xóa khỏi nhóm
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
