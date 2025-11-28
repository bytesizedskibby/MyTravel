import { createContext, ReactNode, useContext, useState, useCallback } from "react";
import { 
  BlogPost, 
  BlogCategory, 
  mockBlogPosts, 
  EditorContent,
  getAuthorInitials 
} from "@/lib/mock-data";

interface BlogContextType {
  posts: BlogPost[];
  getPost: (id: string) => BlogPost | undefined;
  getPostsByCategory: (category: BlogCategory | "all") => BlogPost[];
  getPostsByAuthor: (authorId: string) => BlogPost[];
  addPost: (post: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => BlogPost;
  updatePost: (id: string, updates: Partial<Omit<BlogPost, "id" | "createdAt">>) => BlogPost | undefined;
  deletePost: (id: string) => boolean;
}

const BlogContext = createContext<BlogContextType | null>(null);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);

  const getPost = useCallback((id: string) => {
    return posts.find(post => post.id === id);
  }, [posts]);

  const getPostsByCategory = useCallback((category: BlogCategory | "all") => {
    if (category === "all") {
      return posts.filter(post => post.published);
    }
    return posts.filter(post => post.category === category && post.published);
  }, [posts]);

  const getPostsByAuthor = useCallback((authorId: string) => {
    return posts.filter(post => post.author.id === authorId);
  }, [posts]);

  const addPost = useCallback((postData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newPost: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<Omit<BlogPost, "id" | "createdAt">>) => {
    let updatedPost: BlogPost | undefined;
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        updatedPost = {
          ...post,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedPost;
      }
      return post;
    }));
    return updatedPost;
  }, []);

  const deletePost = useCallback((id: string) => {
    const postExists = posts.some(post => post.id === id);
    if (postExists) {
      setPosts(prev => prev.filter(post => post.id !== id));
      return true;
    }
    return false;
  }, [posts]);

  return (
    <BlogContext.Provider
      value={{
        posts,
        getPost,
        getPostsByCategory,
        getPostsByAuthor,
        addPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
}

// Re-export helper function for convenience
export { getAuthorInitials };
export type { BlogPost, BlogCategory, EditorContent };
