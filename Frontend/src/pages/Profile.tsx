// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Link as LinkIcon } from 'lucide-react';
import { Post, type PostData } from '../components/feed/Post';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const TABS = ['Posts', 'Replies', 'Media', 'Likes'];

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  created_at: string;
}

interface SupabasePost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState('Posts');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.warn('Profile select warning', profileError);
        }

        let activeProfile = profileData as UserProfile | null;

        if (!activeProfile) {
          const defaultUsername = user.email?.split('@')[0] || 'user';
          const { data: upsertData, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              username: defaultUsername,
              full_name: defaultUsername,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
              bio: '',
              website: ''
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (upsertError) throw upsertError;
          activeProfile = upsertData as UserProfile;
        }

        if (!activeProfile) {
          throw new Error('Cannot load or create profile');
        }

        setProfile(activeProfile);
        setFullName(activeProfile.full_name || '');
        setUsername(activeProfile.username || '');
        setBio(activeProfile.bio || '');
        setWebsite(activeProfile.website || '');
        setAvatarUrl(activeProfile.avatar_url || '');

        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });
        
        if (postsData) {
          const mappedPosts: PostData[] = (postsData as SupabasePost[]).map((post: SupabasePost) => ({
            id: post.id,
            author: {
              name: profileData?.username || 'You',
              handle: profileData?.username?.toLowerCase().replace(/\s+/g, '_') || 'you',
              avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData?.username || 'user'}`
            },
            content: post.content,
            timestamp: new Date(post.created_at).toLocaleString(),
            likes: post.like_count || 0,
            comments: post.comment_count || 0,
            reposts: post.repost_count || 0,
            isLiked: false,
            isReposted: false,
          }));
          setPosts(mappedPosts);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full pb-20 sm:pb-0 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  const handleLike = (postId: string) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return { ...post, isLiked: newIsLiked, likes: newIsLiked ? post.likes + 1 : post.likes - 1 };
        }
        return post;
      })
    );
  };

  const handleRepost = (postId: string) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id === postId) {
          const newIsReposted = !post.isReposted;
          return { ...post, isReposted: newIsReposted, reposts: newIsReposted ? post.reposts + 1 : post.reposts - 1 };
        }
        return post;
      })
    );
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username || profile.username,
          full_name: fullName || profile.full_name,
          bio: bio || profile.bio,
          website: website || profile.website,
          avatar_url: avatarUrl || profile.avatar_url,
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data as UserProfile);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-full pb-20 sm:pb-0"
    >
      {/* Banner Area */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-r from-brand to-blue-900">
        {/* Avatar */}
        <div className="absolute -bottom-16 left-4 w-32 h-32 bg-dark rounded-full border-4 border-dark overflow-hidden transition-colors duration-300 z-10">
          <img 
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`}
            alt={profile?.full_name || 'User Avatar'} 
            className="w-full h-full object-cover bg-gray-800" 
          />
        </div>
      </div>
      
      {/* Profile Info Area */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex justify-end mb-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isEditing) {
                handleUpdateProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className="px-4 py-1.5 font-bold rounded-full border border-gray-500 hover:bg-gray-500/10 transition-colors"
            disabled={loading}
          >
            {isEditing ? (loading ? 'Saving...' : 'Save profile') : 'Edit profile'}
          </motion.button>
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-3 px-4 py-1.5 font-bold rounded-full border border-gray-500 hover:bg-gray-500/10 transition-colors"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </motion.button>
          )}
        </div>
        
        <div className="mt-20">
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full p-2 border border-gray-700 rounded bg-dark text-white"
              />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-2 border border-gray-700 rounded bg-dark text-white"
              />
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Avatar URL"
                className="w-full p-2 border border-gray-700 rounded bg-dark text-white"
              />
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website"
                className="w-full p-2 border border-gray-700 rounded bg-dark text-white"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="w-full p-2 border border-gray-700 rounded bg-dark text-white"
                rows={3}
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{profile?.full_name || profile?.username}</h1>
              <p className="text-gray-500">@{profile?.username}</p>
              
              {profile?.bio && (
                <p className="text-[15px] leading-relaxed mb-3 mt-2">
                  {profile.bio}
                </p>
              )}

              {profile?.website && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-500 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <LinkIcon size={16} />
                    <a href={profile.website} className="text-brand hover:underline">{profile.website}</a>
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center gap-1 text-gray-500 text-sm">
                <Calendar size={16} />
                <span>
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4 text-sm mt-4">
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-white">0</span> <span className="text-gray-500">Following</span>
          </div>
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-white">0</span> <span className="text-gray-500">Followers</span>
          </div>
        </div>
      </div>

      {/* Animated Tabs */}
      <div className="flex border-b border-gray-800 w-full">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center font-medium transition-colors relative hover:bg-gray-900/50 ${
              activeTab === tab ? 'text-white' : 'text-gray-500'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="profileTab" // This creates the smooth sliding underline!
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-t-full mx-auto w-16"
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === 'Posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {posts.map((post, index) => (
                <Post 
                  key={post.id} 
                  post={post} 
                  index={index} 
                  onLike={() => handleLike(post.id)}
                  onRepost={() => handleRepost(post.id)}
                />
              ))}
            </motion.div>
          )}

          {activeTab !== 'Posts' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="py-16 text-center"
            >
              <h3 className="text-xl font-bold mb-2">Nothing to see here yet</h3>
              <p className="text-gray-500">When you have {activeTab.toLowerCase()}, they'll show up here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
