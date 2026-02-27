import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import socket from "../../socket";
import api from "../../api/axios";

function Header({ darkMode, setDarkMode, toggleMenu, isMenuOpen, animateIcon }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);

  // Format time based on how recent
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return notifDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: notifDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Map notification type to icon and color
  const getNotificationStyle = (type) => {
    const styles = {
      forum_update: { icon: 'fa-paw', color: 'text-orange-500' },
      pet_tips_update: { icon: 'fa-lightbulb', color: 'text-yellow-500' },
      video_update: { icon: 'fa-video', color: 'text-purple-500' },
      appointment_update: { icon: 'fa-calendar-check', color: 'text-green-500' },
      medical_record_update: { icon: 'fa-notes-medical', color: 'text-red-500' },
      lab_record_update: { icon: 'fa-flask', color: 'text-blue-500' }
    };
    return styles[type] || { icon: 'fa-bell', color: 'text-gray-500' };
  };

  // Get navigation link based on notification type
  const getNotificationLink = (type) => {
    switch (type) {
      case 'forum_update':
        return '/forum';
      case 'pet_tips_update':
        return '/pet-tips';
      case 'video_update':
        return '/videos';
      case 'appointment_update':
        return '/appointments';
      case 'medical_record_update':
      case 'lab_record_update':
        return '/medical-records';
      default:
        return '#';
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      console.log('📥 [fetchNotifications] Response:', response.data);
      
      // Get current user ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user?.id;
      
      if (response.data.success) {
        // Transform and FILTER the notifications
        const formattedNotifications = response.data.notifications
          .filter(notif => {
            // 🔴 FILTER OUT OWN NOTIFICATIONS
            // Check if this notification was created by the current user
            if (notif.createdBy && notif.createdBy === currentUserId) {
              console.log('⏭️ [fetchNotifications] Filtering out own notification:', notif.notificationID);
              return false;
            }
            return true;
          })
          .map(notif => {
            const style = getNotificationStyle(notif.typeName);
            return {
              id: notif.notificationID,
              notificationId: notif.notificationID,
              title: notif.title,
              message: notif.message,
              timestamp: notif.createdAt,
              read: notif.isRead === 1,
              type: notif.typeName,
              icon: style.icon,
              color: style.color,
              link: getNotificationLink(notif.typeName),
              createdBy: notif.createdBy // Store for future reference
            };
          });
        
        console.log('📥 [fetchNotifications] Formatted notifications:', formattedNotifications.length);
        setNotifications(formattedNotifications);
        
        // Update unread count (only count unread notifications that aren't your own)
        const unreadResponse = await api.get('/notifications/unread-count');
        if (unreadResponse.data.success) {
          setUnreadCount(unreadResponse.data.unread);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.unread);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Socket.IO setup for real-time notifications
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
    console.log('👤 [Socket] Current user:', userId);

    if (userId) {
      if (!socket.connected) {
        console.log('🔌 [Socket] Connecting...');
        socket.connect();
      }
      
      console.log('🎯 [Socket] Joining room for user:', userId);
      socket.emit('join', userId);

      // Listen for new notifications
      socket.on('new_notification', (notification) => {
        console.log('📨 [Socket] RAW notification received:', notification);
        
        // Get current user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = user?.id;
        
        // 🔴 SKIP IF THIS IS THE CURRENT USER'S OWN NOTIFICATION
        if (notification.createdBy && notification.createdBy === currentUserId) {
          console.log('⏭️ [Socket] Skipping own notification');
          return;
        }
        
        // Transform the backend notification to frontend format
        const style = getNotificationStyle(notification.type);
        
        const formattedNotification = {
          id: notification.notificationId || Date.now(),
          notificationId: notification.notificationId,
          title: notification.title || 'New Notification',
          message: notification.message || '',
          timestamp: notification.createdAt || new Date().toISOString(),
          read: false,
          type: notification.type || 'forum_update',
          icon: style.icon,
          color: style.color,
          link: getNotificationLink(notification.type),
          createdBy: notification.createdBy
        };
        
        console.log('📨 [Socket] Adding notification to state');
        
        // Update state with the new notification
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.notificationId === formattedNotification.notificationId);
          if (exists) {
            return prev;
          }
          return [formattedNotification, ...prev];
        });
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
      });

      // Listen for notification read updates
      socket.on('notification_read', ({ notificationId }) => {
        console.log('📖 [Socket] Notification marked read:', notificationId);
        setNotifications(prev =>
          prev.map(notif =>
            notif.notificationId === notificationId ? { ...notif, read: true } : notif
          )
        );
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      // Listen for all read event
      socket.on('all_read', () => {
        console.log('📚 [Socket] All notifications marked read');
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      });

      // Listen for notification deleted
      socket.on('notification_deleted', ({ notificationId }) => {
        console.log('🗑️ [Socket] Notification deleted:', notificationId);
        setNotifications(prev => 
          prev.filter(notif => notif.notificationId !== notificationId)
        );
      });

      socket.on('connect', () => {
        console.log('✅ [Socket] Connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('❌ [Socket] Disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ [Socket] Connection error:', error);
      });
    }

    return () => {
      if (userId) {
        console.log('🧹 [Socket] Cleaning up listeners');
        socket.off('new_notification');
        socket.off('notification_read');
        socket.off('all_read');
        socket.off('notification_deleted');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationItemClick = async (notification) => {
    console.log('👆 Clicked notification:', notification);
    
    // Update local state optimistically
    setNotifications(prev =>
      prev.map(notif =>
        notif.notificationId === notification.notificationId ? { ...notif, read: true } : notif
      )
    );
    
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Mark as read on server
    try {
      await api.post(`/notifications/${notification.notificationId}/read`);
      console.log('✅ Marked as read on server');
      
      // Emit read event through socket
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.id) {
        socket.emit('notificationRead', {
          userId: user.id,
          notificationId: notification.notificationId
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      fetchNotifications();
    }

    // Navigate based on notification link
    if (notification.link && notification.link !== '#') {
      navigate(notification.link);
    }
    
    setShowNotifications(false);
  };

  const markAllAsRead = async () => {
    const previousNotifications = [...notifications];
    const previousCount = unreadCount;
    
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);

    try {
      await api.post('/notifications/mark-all-read');
      console.log('✅ All marked as read on server');
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.id) {
        socket.emit('allNotificationsRead', { userId: user.id });
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      setNotifications(previousNotifications);
      setUnreadCount(previousCount);
    }
  };

  return (
    <div className="pt-5 pb-2 px-4 sm:px-6 md:px-10 flex flex-row justify-between items-center relative z-40 fixed top-0 left-0 right-0 bg-transparent">
      {/* Left side - Menu, Logo */}
      <div className="flex flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
        <motion.button
          onClick={toggleMenu}
          className={`text-2xl sm:text-3xl text-gray-700 focus:outline-none flex-shrink-0 ${
            animateIcon ? 'transition-transform duration-300' : ''
          }`}
          style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          ☰
        </motion.button>
        <img
          src="/images/logo.png"
          className="w-[30px] sm:w-[40px] md:w-[60px] lg:w-[80px] flex-shrink-0"
          alt="Logo"
        />
        <div className="flex flex-col flex-shrink-0">
          <div className="font-baloo text-lg sm:text-xl md:text-2xl leading-none">
            <span className="text-[#000000]">RV</span>
            <span className="text-[#5EE6FE]">Care</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - NOTIF + FORUM */}
      <div className="flex flex-row justify-end items-center gap-3 sm:gap-5 md:gap-8 text-gray-700 flex-shrink-0">
        {/* Notification */}
        <div className="relative" ref={notificationRef}>
          <div
            onClick={handleNotificationClick}
            className="relative text-xl sm:text-2xl cursor-pointer text-gray-700"
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="fixed right-2 sm:right-4 top-16 sm:top-20 w-[calc(100vw-1rem)] sm:w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              {/* Header */}
              <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-[#5EE6FE] hover:text-[#3ecbe0] font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#5EE6FE]"></div>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">Loading...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification)}
                      className={`p-3 sm:p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50 border-l-4 border-l-blue-400" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {/* Notification Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                          notification.read ? "bg-gray-100" : "bg-blue-100"
                        }`}>
                          <i className={`fa-solid ${notification.icon} ${notification.color} text-sm sm:text-base md:text-lg`}></i>
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-semibold text-xs sm:text-sm ${
                              notification.read ? "text-gray-600" : "text-gray-900"
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] sm:text-xs text-gray-400 ml-2 flex-shrink-0">
                              {formatNotificationTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5EE6FE] rounded-full flex-shrink-0 mt-1 sm:mt-2 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 sm:p-8 text-center">
                    <i className="fa-solid fa-bell-slash text-2xl sm:text-3xl md:text-4xl text-gray-300 mb-2 sm:mb-3"></i>
                    <p className="text-gray-500 text-xs sm:text-sm">No notifications yet</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1">We'll notify you when something new arrives</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Forum Button */}
        <div
          onClick={() => navigate("/forum")}
          className="flex items-center gap-1 sm:gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-paw text-lg sm:text-xl"></i>
          <span className="font-semibold text-sm sm:text-base hidden sm:inline">Lost Pets</span>
        </div>
      </div>
    </div>
  );
}

export default Header;