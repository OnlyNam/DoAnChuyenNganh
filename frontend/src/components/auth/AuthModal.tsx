'use client';

import React, { useState } from 'react';
import { SystemRole, UserProfile } from '../../types/project.types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  presetAccounts: UserProfile[];
  onSelectUser: (user: UserProfile, token?: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  presetAccounts,
  onSelectUser,
}: AuthModalProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [systemRole, setSystemRole] = useState<SystemRole>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const endpoint = mode === 'LOGIN' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'LOGIN'
          ? { email, password }
          : { email, password, fullName, studentCode, systemRole };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Thao tác xác thực thất bại.');
      }

      const apiUser = json.data.user;
      const mappedUser: UserProfile = {
        id: apiUser.id,
        email: apiUser.email,
        fullName: apiUser.fullName,
        studentCode: apiUser.studentCode,
        systemRole: apiUser.systemRole,
        projectRole:
          apiUser.systemRole === 'LECTURER'
            ? 'ADVISOR'
            : apiUser.memberships?.[0]?.role || 'MEMBER',
      };

      onSelectUser(mappedUser, json.data.accessToken);
      setMessage({ type: 'success', text: json.message });
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      // Fallback sang dữ liệu cục bộ nếu chưa bật PostgreSQL Database
      if (mode === 'LOGIN') {
        const matched = presetAccounts.find(
          (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (matched) {
          onSelectUser(matched, 'demo-local-jwt-token');
          onClose();
          return;
        }
      } else if (mode === 'REGISTER' && fullName && email) {
        const customUser: UserProfile = {
          id: `u_${Date.now()}`,
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          studentCode:
            systemRole === 'STUDENT' ? studentCode.trim().toUpperCase() : null,
          systemRole,
          projectRole: systemRole === 'LECTURER' ? 'ADVISOR' : 'MEMBER',
        };
        onSelectUser(customUser, 'demo-local-jwt-token');
        onClose();
        return;
      }

      setMessage({
        type: 'error',
        text: err.message || 'Không thể kết nối máy chủ xác thực.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
              Tuần 2 • Xác Thực JWT & Phân Quyền RBAC
            </span>
            <h3 className="text-lg font-bold mt-0.5">
              {mode === 'LOGIN'
                ? 'Đăng Nhập Hệ Thống StudentJira'
                : 'Đăng Ký Tài Khoản Sinh Viên / Giảng Viên'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Chuyển đổi nhanh tài khoản Demo (Phục vụ test RBAC 1-click) */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
              ⚡ Chuyển nhanh vai trò Demo (Kiểm thử Phân quyền RBAC Tuần 2):
            </div>
            <div className="grid grid-cols-1 gap-2">
              {presetAccounts.map((acc) => {
                const isSelected = acc.id === currentUser.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      onSelectUser(acc, 'demo-jwt-token');
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div>
                      <div>{acc.fullName}</div>
                      <div
                        className={`text-[11px] ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {acc.email} {acc.studentCode ? `• MSSV: ${acc.studentCode}` : ''}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        isSelected
                          ? 'bg-white text-blue-700'
                          : acc.projectRole === 'LEADER'
                          ? 'bg-amber-100 text-amber-800'
                          : acc.projectRole === 'ADVISOR'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {acc.projectRole}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs Login / Register */}
          <div className="flex border-b border-slate-200 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              className={`pb-2.5 px-4 border-b-2 transition ${
                mode === 'LOGIN'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng nhập Email
            </button>
            <button
              type="button"
              onClick={() => setMode('REGISTER')}
              className={`pb-2.5 px-4 border-b-2 transition ${
                mode === 'REGISTER'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Đăng ký tài khoản mới
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
            {mode === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò hệ thống
                  </label>
                  <select
                    aria-label="Chọn vai trò hệ thống"
                    value={systemRole}
                    onChange={(e) => setSystemRole(e.target.value as SystemRole)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="STUDENT">👨‍🎓 Sinh viên thực hiện đồ án</option>
                    <option value="LECTURER">🎓 Giảng viên hướng dẫn (Advisor)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Nguyễn Văn An"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  {systemRole === 'STUDENT' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mã số sinh viên (MSSV) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: SV2026005"
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono uppercase"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email học vụ *
              </label>
              <input
                type="email"
                required
                placeholder="nam.vu@student.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? 'Đang xử lý...'
                  : mode === 'LOGIN'
                  ? 'Đăng nhập (JWT)'
                  : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
