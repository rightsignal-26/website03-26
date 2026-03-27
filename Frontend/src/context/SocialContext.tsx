import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SocialContextType {
  followingIds: string[];
  toggleFollow: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('following_ids');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('following_ids', JSON.stringify(followingIds));
  }, [followingIds]);

  const toggleFollow = (id: string) => {
    setFollowingIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <SocialContext.Provider value={{ followingIds, toggleFollow, searchQuery, setSearchQuery }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
