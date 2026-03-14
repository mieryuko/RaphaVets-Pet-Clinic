// backend/socket.js
import { Server } from 'socket.io';
import { registerSocketSession, removeSocketSession } from './controllers/notificationController.js';

let io;

const normalizeOrigin = (origin) => {
    if (!origin) return '';
    return String(origin).trim().replace(/\/+$/, '').toLowerCase();
};

const getAllowedOrigins = () => {
    const configured = [
        process.env.FRONTEND_URL,
        process.env.CLINIC_URL,
        ...(process.env.SOCKET_ALLOWED_ORIGINS || '').split(','),
    ];

    if (process.env.NODE_ENV !== 'production') {
        configured.push(
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        );
    }

    return [...new Set(configured.map(normalizeOrigin).filter(Boolean))];
};

export const initializeSocket = (server) => {
    const allowedOrigins = getAllowedOrigins();

    if (allowedOrigins.length === 0) {
        console.warn('⚠️ No socket CORS origins configured; allowing any origin. Set FRONTEND_URL/CLINIC_URL/SOCKET_ALLOWED_ORIGINS in production.');
    } else {
    }

    io = new Server(server, {
        cors: {
            credentials: true,
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.length === 0) {
                    return callback(null, true);
                }

                const normalizedIncomingOrigin = normalizeOrigin(origin);
                if (allowedOrigins.includes(normalizedIncomingOrigin)) {
                    return callback(null, true);
                }

                return callback(new Error(`Socket origin not allowed: ${origin}`), false);
            },
        }
    });

    io.on('connection', (socket) => {

        // Get client info for database
        const userAgent = socket.handshake.headers['user-agent'];
        const ipAddress = socket.handshake.address;

        // Handle user joining their room
        socket.on('join', async (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                
                // 🔴 ADD THIS - Register in database
                try {
                    await registerSocketSession(userId, socket.id, userAgent, ipAddress);
                    
                    // Send confirmation back to client
                    socket.emit('joined_room', { success: true, userId });
                } catch (error) {
                    console.error(`❌ Failed to save session:`, error);
                }
            }
        });

        socket.on('join_admin_room', ({ role } = {}) => {
            if (role !== undefined && Number(role) !== 2) {
                return;
            }

            socket.join('admin-room');
            socket.emit('admin_room_joined', { success: true });
        });

        socket.on('leave_admin_room', () => {
            socket.leave('admin-room');
        });

        // Handle notification read
        socket.on('notificationRead', (data) => {
            const { userId, notificationId } = data;
            io.to(`user_${userId}`).emit('notification_read', { notificationId });
        });

        // Handle all notifications read
        socket.on('allNotificationsRead', (data) => {
            const { userId } = data;
            io.to(`user_${userId}`).emit('all_read');
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            
            // 🔴 ADD THIS - Remove from database
            try {
                await removeSocketSession(socket.id);
            } catch (error) {
                console.error(`❌ Failed to remove session:`, error);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
