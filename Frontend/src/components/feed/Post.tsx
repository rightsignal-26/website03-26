// src/components/feed/Post.tsx
import { motion } from 'framer-motion';
import { MessageCircle, Repeat, Heart, Share, MoreHorizontal } from 'lucide-react';

export interface PostData {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked?: boolean;    // <-- New property
  isReposted?: boolean; // <-- New property
}

interface PostProps {
  post: PostData;
  index: number;
  onLike: () => void;   // <-- New prop
  onRepost: () => void; // <-- New prop
}

export function Post({ post, index, onLike, onRepost }: PostProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <img 
          src={post.author.avatar} 
          alt={post.author.name} 
          className="w-12 h-12 rounded-full object-cover bg-gray-800"
        />

        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold hover:underline">{post.author.name}</span>
              <span className="text-gray-500 ml-2">@{post.author.handle}</span>
              <span className="text-gray-500 mx-1">·</span>
              <span className="text-gray-500 hover:underline">{post.timestamp}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-gray-500 hover:text-brand">
              <MoreHorizontal size={20} />
            </motion.button>
          </div>

          {/* Content */}
          <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4 text-gray-500 max-w-md">
            <ActionIcon 
              icon={MessageCircle} 
              count={post.comments} 
              hoverColor="text-blue-500" 
              hoverBg="bg-blue-500/10" 
              isActive={false}
              activeColor="text-blue-500"
            />
            
            <ActionIcon 
              icon={Repeat} 
              count={post.reposts} 
              hoverColor="text-green-500" 
              hoverBg="bg-green-500/10" 
              isActive={post.isReposted ?? false}
              activeColor="text-green-500"
              onClick={onRepost}
            />
            
            <ActionIcon 
              icon={Heart} 
              count={post.likes} 
              hoverColor="text-pink-500" 
              hoverBg="bg-pink-500/10" 
              isActive={post.isLiked ?? false}
              activeColor="text-pink-500"
              onClick={onLike}
            />
            
            <ActionIcon 
              icon={Share} 
              hoverColor="text-brand" 
              hoverBg="bg-brand/10" 
              isActive={false}
              activeColor="text-brand"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Updated Helper Component
interface ActionIconProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  count?: number;
  hoverColor: string;
  hoverBg: string;
  isActive?: boolean;
  activeColor?: string;
  onClick?: () => void;
}

function ActionIcon({ icon: Icon, count, hoverColor, hoverBg, isActive = false, activeColor = '', onClick }: ActionIconProps) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation(); // Prevents clicking the post when clicking the button
        if (onClick) onClick();
      }}
      className={`flex items-center gap-2 group transition-colors hover:${hoverColor} ${isActive ? activeColor : ''}`}
      whileTap={{ scale: 0.8 }}
    >
      <div className={`p-2 rounded-full transition-colors group-hover:${hoverBg} ${isActive ? hoverBg : ''}`}>
        <Icon className={`w-[18px] h-[18px] ${isActive ? activeColor : ''}`} />
      </div>
      {count !== undefined && <span className="text-sm">{count}</span>}
    </motion.button>
  );
}