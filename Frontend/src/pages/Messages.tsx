import { useState, useMemo } from 'react';
import { 
  Search, 
  Edit, 
  MessageSquareOff, 
  CheckCheck,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Conversation from '../components/shared/Conversation';
import { useSocial } from '../context/SocialContext';

type Chat = {
  id: string;
  sender: string;
  avatarColor: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
};

const initialChats: Chat[] = [
  {
    id: '1',
    sender: 'Sarah Jenkins',
    avatarColor: 'bg-blue-500',
    initials: 'SJ',
    lastMessage: 'Sounds great! I will send over the documents by tomorrow morning.',
    timestamp: '10:42 AM',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    sender: 'Alex Chen',
    avatarColor: 'bg-emerald-500',
    initials: 'AC',
    lastMessage: 'Are we still on for the design review meeting at 3?',
    timestamp: 'Yesterday',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '3',
    sender: 'Design Team',
    avatarColor: 'bg-purple-500',
    initials: 'DT',
    lastMessage: 'Marcus: I just uploaded the new Figma files to the drive.',
    timestamp: 'Tuesday',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '4',
    sender: 'Rachel Green',
    avatarColor: 'bg-rose-500',
    initials: 'RG',
    lastMessage: 'Thanks for the update! Talk soon.',
    timestamp: 'Mar 22',
    unreadCount: 0,
    isOnline: false,
  },
];

export default function Messages() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { searchQuery } = useSocial();

  const activeSearch = searchQuery || localSearch;

  // Derived state
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const matchesTab = filter === 'all' || chat.unreadCount > 0;
      const matchesSearch = chat.sender.toLowerCase().includes(activeSearch.toLowerCase()) || 
                            chat.lastMessage.toLowerCase().includes(activeSearch.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [chats, filter, activeSearch]);

  const selectedChat = useMemo(() => 
    chats.find(c => c.id === selectedChatId), 
    [chats, selectedChatId]
  );

  const markAllAsRead = () => {
    setChats(prev => prev.map(chat => ({ ...chat, unreadCount: 0 })));
  };

  if (selectedChatId && selectedChat) {
    return (
      <div className="p-4 w-full max-w-3xl mx-auto h-screen">
        <Conversation 
          chat={selectedChat} 
          onBack={() => setSelectedChatId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:px-4 lg:px-6 w-full transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-4 mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            Messages
            {totalUnread > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-brand text-white text-[10px] px-2 py-1 rounded-full leading-none"
              >
                {totalUnread}
              </motion.span>
            )}
          </h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={markAllAsRead}
              className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-full transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-brand hover:bg-brand/10 rounded-full transition-colors"
              title="New Message"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 group-focus-within:text-brand transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 rounded-xl leading-5 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all sm:text-sm"
              placeholder="Search messages..."
              value={activeSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex px-4 border-gray-800 mb-6 gap-6 relative border-b">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 relative text-sm font-medium transition-colors ${
              filter === 'all' ? 'text-brand' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All
            {filter === 'all' && (
              <motion.div 
                layoutId="messageTab" 
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
                layoutId="messageTab" 
                className="absolute -bottom-[1px] left-0 right-0 h-[4px] bg-brand rounded-full" 
              />
            )}
          </button>
        </div>

        {/* Messages List Container */}
        <div className="w-full md:rounded-2xl border border-gray-800 overflow-hidden bg-gray-900/20 backdrop-blur-sm">
          {filteredChats.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-gray-900"
            >
              <div className="bg-gray-800 p-6 rounded-full mb-4">
                <MessageSquareOff className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white">No messages found</h3>
              <p className="text-gray-500 mt-1 text-sm">
                {activeSearch ? "Try searching for something else." : "You have no open conversations."}
              </p>
              {activeSearch && (
                <button 
                  onClick={() => {setLocalSearch(''); setSelectedChatId(null)}}
                  className="mt-6 px-6 py-2 bg-brand text-white rounded-full font-bold hover:bg-brand/80 transition-all"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence mode='popLayout'>
                {filteredChats.map((chat) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={chat.id}
                    className="group relative flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50"
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      if (chat.unreadCount > 0) {
                        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                      }
                    }}
                  >
                    {/* Avatar with Online Status */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${chat.avatarColor}`}>
                        {chat.initials}
                      </div>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                      )}
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className={`text-base truncate ${
                          chat.unreadCount > 0 ? 'font-bold text-white' : 'font-medium text-white'
                        }`}>
                          {chat.sender}
                        </h4>
                        <span className={`text-xs flex-shrink-0 ${
                          chat.unreadCount > 0 ? 'text-brand font-medium' : 'text-gray-500'
                        }`}>
                          {chat.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className={`text-sm truncate leading-snug ${
                          chat.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'
                        }`}>
                          {chat.lastMessage}
                        </p>
                        
                        {/* Unread Badge */}
                        {chat.unreadCount > 0 && (
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-brand rounded-full text-white text-[10px] font-bold">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* FAB for Mobile */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-6 p-4 bg-brand text-white rounded-full shadow-lg shadow-brand/40 md:hidden z-10"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}