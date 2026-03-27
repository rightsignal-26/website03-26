import { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  UserPlus, 
  MessageSquare, 
  AlertCircle,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification } from '../types/notification';

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New Follower',
    description: 'Sarah Jenkins started following you.',
    timestamp: '2 mins ago',
    isRead: false,
    icon: <UserPlus className="w-5 h-5 text-blue-500" />,
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    description: 'Hey! Are we still on for the project meeting later?',
    timestamp: '1 hour ago',
    isRead: false,
    icon: <MessageSquare className="w-5 h-5 text-green-500" />,
  },
  {
    id: '3',
    type: 'system',
    title: 'System Maintenance',
    description: 'Scheduled maintenance will occur tonight at 12:00 AM UTC.',
    timestamp: '5 hours ago',
    isRead: true,
    icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
  },
  {
    id: '4',
    type: 'update',
    title: 'Post Liked',
    description: 'Your recent post is getting a lot of traction.',
    timestamp: '1 day ago',
    isRead: true,
    icon: <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen py-6 sm:px-4 lg:px-6 w-full transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-4 mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-brand text-white text-[10px] px-2 py-1 rounded-full "
              >
                {unreadCount}
              </motion.span>
            )}
          </h1>
          
          <button 
            onClick={markAllAsRead}
            className="p-2 text-gray-500 hover:text-brand hover:bg-brand/10 rounded-full transition-colors"
            title="Mark all as read"
          >
            <CheckCheck className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 border-gray-800 mb-6 gap-6 relative">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 relative text-sm font-medium transition-colors ${
              filter === 'all' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All
            {filter === 'all' && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute -bottom-[1px] left-0 right-0 h-[4px] bg-brand rounded-full" 
              />
            )}
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-3 relative text-sm font-medium transition-colors ${
              filter === 'unread' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Unread
            {filter === 'unread' && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute -bottom-[1px] left-0 right-0 h-[4px] bg-brand rounded-full" 
              />
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="w-full md:rounded-2xl border border-gray-800 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-gray-900"
            >
              <div className="bg-gray-800 p-6 rounded-full mb-4">
                <Bell className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white">No notifications here</h3>
              <p className="text-gray-500 mt-1 text-sm">You're all caught up!</p>
            </motion.div>
          ) : (
            <div className="flex flex-col bg-transparent">
              <AnimatePresence mode='popLayout'>
                {filteredNotifications.map((notification) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ duration: 0.2 }}
                    key={notification.id}
                    className={`group relative flex items-start gap-4 p-4 cursor-pointer transition-colors border-b border-gray-800 last:border-b-0 hover:bg-gray-900 ${
                      !notification.isRead ? 'bg-brand/5' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    {/* Unread dot indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-1/2 left-1.5 -translate-y-1/2 w-1.5 h-1.5 bg-brand rounded-full" />
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      !notification.isRead ? 'bg-brand/10' : 'bg-gray-800'
                    }`}>
                      {notification.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className={`text-base font-medium truncate ${
                          !notification.isRead ? 'text-white' : 'text-gray-500'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-snug">
                        {notification.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        deleteNotification(notification.id);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}