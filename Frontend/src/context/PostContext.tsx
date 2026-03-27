    // src/context/PostContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { type PostData } from '../components/feed/Post';
import { supabase } from '../utils/supabase';

interface PostContextType {
  posts: PostData[];
  addPost: (content: string, userId: string) => void;
  toggleLike: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  loading: boolean;
  error: string | null;
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

interface SupabaseProfile {
  id: string;
  username: string;
  avatar_url: string;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', data.map((p: SupabasePost) => p.author_id));
          
          const profileMap = new Map(profilesData?.map((p: SupabaseProfile) => [p.id, p]) || []);
          
          const mappedPosts: PostData[] = data.map((post: SupabasePost) => {
            const profile = profileMap.get(post.author_id);
            return {
              id: post.id,
              author: {
                name: profile?.username || 'Unknown User',
                handle: profile?.username?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
                avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`
              },
              content: post.content,
              timestamp: new Date(post.created_at).toLocaleString(),
              likes: post.like_count || 0,
              comments: post.comment_count || 0,
              reposts: post.repost_count || 0,
              isLiked: false,
              isReposted: false,
            };
          });
          setPosts(mappedPosts);
        } else {
          setPosts([]);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch posts';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const addPost = async (content: string, userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({
          author_id: userId,
          content,
          title: content.substring(0, 50).trim(),
        })
        .select();
      
      if (insertError) throw insertError;
      if (!data || data.length === 0) throw new Error('Failed to create post');
      
      const newPost = data[0];
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      const mappedPost: PostData = {
        id: newPost.id,
        author: {
          name: profileData?.username || 'You',
          handle: profileData?.username?.toLowerCase().replace(/\s+/g, '_') || 'you',
          avatar: profileData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData?.username || 'user'}`
        },
        content: newPost.content,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        reposts: 0,
        isLiked: false,
        isReposted: false,
      };
      
      setPosts(prev => [mappedPost, ...prev]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      console.error('Error creating post:', err);
      throw new Error(message);
    }
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return { ...post, isLiked: newIsLiked, likes: newIsLiked ? post.likes + 1 : post.likes - 1 };
        }
        return post;
      })
    );
  };

  const toggleRepost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newIsReposted = !post.isReposted;
          return { ...post, isReposted: newIsReposted, reposts: newIsReposted ? post.reposts + 1 : post.reposts - 1 };
        }
        return post;
      })
    );
  };

  return (
    <PostContext.Provider value={{ posts, addPost, toggleLike, toggleRepost, loading, error }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePosts = () => { // eslint-disable-line react-refresh/only-export-components
  const context = useContext(PostContext);
  if (!context) throw new Error('usePosts must be used within a PostProvider');
  return context;
};