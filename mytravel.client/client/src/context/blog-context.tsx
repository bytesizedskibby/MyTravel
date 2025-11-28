import { createContext, ReactNode, useContext, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getAuthorInitials } from "@/lib/mock-data";

// Types matching the API response
export type BlogCategory = "solo-travel" | "family-trips" | "luxury-travel";

export interface BlogAuthor {
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorContent = any; // Lexical serialized state

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: BlogCategory;
  excerpt: string;
  content: EditorContent | null;
  image: string; // mapped from imageUrl
  imageUrl?: string | null;
  author: BlogAuthor;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  publishedAt?: string | null;
}

interface BlogPostsResponse {
  posts: Array<{
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string | null;
    imageUrl: string | null;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    author: BlogAuthor | null;
  }>;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface BlogContextType {
  posts: BlogPost[];
  isLoading: boolean;
  error: Error | null;
  getPost: (idOrSlug: string | number) => BlogPost | undefined;
  getPostBySlug: (slug: string) => Promise<BlogPost | null>;
  getPostsByCategory: (category: BlogCategory | "all") => BlogPost[];
  getPostsByAuthor: (authorId: string) => BlogPost[];
  addPost: (post: CreatePostData) => Promise<BlogPost>;
  updatePost: (id: number, updates: UpdatePostData) => Promise<BlogPost | undefined>;
  deletePost: (id: number) => Promise<boolean>;
  refetch: () => void;
}

interface CreatePostData {
  title: string;
  category?: string;
  excerpt?: string;
  content?: string | null;
  imageUrl?: string;
  authorId?: string;
  published?: boolean;
}

interface UpdatePostData {
  title?: string;
  category?: string;
  excerpt?: string;
  content?: string | null;
  imageUrl?: string;
  published?: boolean;
}

const BlogContext = createContext<BlogContextType | null>(null);

// Helper to transform API response to BlogPost format
function transformPost(apiPost: BlogPostsResponse["posts"][0]): BlogPost {
  // Parse content if it's a string
  let parsedContent = apiPost.content;
  if (typeof apiPost.content === "string" && apiPost.content) {
    try {
      parsedContent = JSON.parse(apiPost.content);
    } catch {
      parsedContent = null;
    }
  }

  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    category: apiPost.category as BlogCategory,
    excerpt: apiPost.excerpt,
    content: parsedContent,
    image: apiPost.imageUrl || "",
    imageUrl: apiPost.imageUrl,
    author: apiPost.author || { id: "unknown", name: "Unknown Author" },
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    published: apiPost.published,
    publishedAt: apiPost.publishedAt,
  };
}

export function BlogProvider({ children }: { children: ReactNode }) {
  // Fetch all published posts
  const { data, isLoading, error, refetch } = useQuery<BlogPostsResponse>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog?pageSize=100", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  const posts: BlogPost[] = data?.posts?.map(transformPost) || [];

  const getPost = useCallback((idOrSlug: string | number) => {
    if (typeof idOrSlug === "number") {
      return posts.find(post => post.id === idOrSlug);
    }
    // Try to find by slug first, then by string id for backward compatibility
    return posts.find(post => post.slug === idOrSlug) || 
           posts.find(post => post.id.toString() === idOrSlug);
  }, [posts]);

  const getPostBySlug = useCallback(async (slug: string): Promise<BlogPost | null> => {
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      const apiPost = await res.json();
      return transformPost(apiPost);
    } catch {
      return null;
    }
  }, []);

  const getPostsByCategory = useCallback((category: BlogCategory | "all") => {
    if (category === "all") {
      return posts.filter(post => post.published);
    }
    return posts.filter(post => post.category === category && post.published);
  }, [posts]);

  const getPostsByAuthor = useCallback((authorId: string) => {
    return posts.filter(post => post.author.id === authorId);
  }, [posts]);

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdatePostData }) => {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
  });

  const addPost = useCallback(async (postData: CreatePostData): Promise<BlogPost> => {
    const result = await createMutation.mutateAsync(postData);
    // Return a placeholder post with the new ID
    return {
      id: result.id,
      title: postData.title,
      slug: result.slug,
      category: (postData.category || "solo-travel") as BlogCategory,
      excerpt: postData.excerpt || "",
      content: postData.content ? JSON.parse(postData.content) : null,
      image: postData.imageUrl || "",
      author: { id: postData.authorId || "unknown", name: "Unknown" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: postData.published || false,
    };
  }, [createMutation]);

  const updatePost = useCallback(async (id: number, updates: UpdatePostData): Promise<BlogPost | undefined> => {
    await updateMutation.mutateAsync({ id, updates });
    return getPost(id);
  }, [updateMutation, getPost]);

  const deletePost = useCallback(async (id: number): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  }, [deleteMutation]);

  return (
    <BlogContext.Provider
      value={{
        posts,
        isLoading,
        error: error as Error | null,
        getPost,
        getPostBySlug,
        getPostsByCategory,
        getPostsByAuthor,
        addPost,
        updatePost,
        deletePost,
        refetch,
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
