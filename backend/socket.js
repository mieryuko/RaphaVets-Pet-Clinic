// backend/socket.js
import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Handle user joining their room
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined room user_${userId}`);
            }
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
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
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