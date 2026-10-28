import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import epicRoutes from './routes/epic.routes';
import issueRoutes from './routes/issue.routes';
import milestoneRoutes from './routes/milestone.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    service:
      'Student Software Project Management API (Week 3 - Backlog, Epics & Issue CRUD)',
    timestamp: new Date().toISOString(),
  });
});

// Đăng ký các cụm API chính
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/epics', epicRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/milestones', milestoneRoutes);

// Đồng bộ Real-time bảng Kanban và Thông báo nhóm qua Socket.io
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on('join_project', (projectId: string) => {
    socket.join(`project_${projectId}`);
  });

  socket.on(
    'kanban_card_moved',
    (payload: {
      projectId: string;
      issueId: string;
      targetStatus: string;
      newPosition: number;
      movedBy: string;
    }) => {
      socket.to(`project_${payload.projectId}`).emit('kanban_board_updated', payload);
    }
  );

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
