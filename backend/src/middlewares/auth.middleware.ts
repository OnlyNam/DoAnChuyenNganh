import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ProjectRole, SystemRole } from '@prisma/client';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'student_jira_super_secret_key_2026';

export interface AuthJwtPayload {
  userId: string;
  email: string;
  fullName: string;
  systemRole: SystemRole;
  studentCode?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
      projectRole?: ProjectRole;
    }
  }
}

/**
 * Middleware 1: Xác thực JWT Token (Tầng Hệ thống)
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để thực hiện thao tác này (Missing Bearer Token).',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
    });
  }
}

/**
 * Middleware 2: Kiểm tra vai trò toàn hệ thống (STUDENT | LECTURER | ADMIN)
 */
export function requireSystemRole(allowedRoles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng.',
      });
    }

    if (!allowedRoles.includes(req.user.systemRole)) {
      return res.status(403).json({
        success: false,
        message: `Quyền truy cập bị từ chối. Yêu cầu vai trò hệ thống: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Middleware 3: Kiểm tra phân quyền RBAC bên trong từng Dự án cụ thể (LEADER | MEMBER | ADVISOR)
 */
export function requireProjectRole(allowedProjectRoles: ProjectRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực người dùng.',
        });
      }

      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu tham số projectId để kiểm tra quyền dự án.',
        });
      }

      // Admin hệ thống có toàn quyền
      if (req.user.systemRole === 'ADMIN') {
        return next();
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: String(projectId),
            userId: req.user.userId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không phải là thành viên hoặc giảng viên của dự án này.',
        });
      }

      if (!allowedProjectRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Thao tác bị từ chối! Chức năng này chỉ dành cho: ${allowedProjectRoles.join(', ')} (Vai trò hiện tại của bạn: ${membership.role}).`,
        });
      }

      req.projectRole = membership.role;
      next();
    } catch (error) {
      console.error('Error in requireProjectRole middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ khi kiểm tra quyền truy cập dự án.',
      });
    }
  };
}

/**
 * Hàm tiện ích tạo JWT Access Token
 */
export function signAccessToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
