import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BlogCategory, EditorContent, BlogPost } from "@/context/blog-context";
import { blogCategoryLabels } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Editor } from "@/components/blocks/editor-md/editor";
import { SerializedEditorState } from "lexical";

type BlogPostResponse = {
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
  author: { id: string; name: string } | null;
};

export default function BlogEditor() {
  const [, params] = useRoute("/blog/editor/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();

  const isEditMode = !!params?.id;
  const postId = params?.id ? parseInt(params.id, 10) : null;

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState<BlogCategory>("solo-travel");
  const [content, setContent] = useState<EditorContent | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  // Fetch existing post in edit mode
  const { data: existingPost, isLoading: isLoadingPost } = useQuery<BlogPostResponse>({
    queryKey: ["/api/admin/blog", postId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: isEditMode && !!postId,
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      category: string;
      excerpt: string;
      content: string | null;
      imageUrl: string;
      published: boolean;
    }) => {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      setLocation(`/blog/${data.slug}`);
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async (postData: {
      id: number;
      title: string;
      category: string;
      excerpt: string;
      content: string | null;
      imageUrl: string;
      published: boolean;
    }) => {
      const res = await fetch(`/api/admin/blog/${postData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user?.isAuthenticated && !isAdmin) {
      toast({
        title: "Authentication required",
        description: "Please log in to create or edit blog posts.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [user, isAdmin, setLocation, toast]);

  // Load existing post data in edit mode
  useEffect(() => {
    if (isEditMode && existingPost) {
      setTitle(existingPost.title);
      setExcerpt(existingPost.excerpt);
      setImage(existingPost.imageUrl || "");
      setCategory(existingPost.category as BlogCategory);
      
      // Parse content if it's a string
      if (existingPost.content) {
        try {
          const parsedContent = typeof existingPost.content === "string" 
            ? JSON.parse(existingPost.content) 
            : existingPost.content;
          setContent(parsedContent);
          setEditorKey(prev => prev + 1); // Force editor re-render
        } catch {
          setContent(null);
        }
      }
    }
  }, [isEditMode, existingPost]);

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your post.",
        variant: "destructive",
      });
      return;
    }

    if (!excerpt.trim()) {
      toast({
        title: "Excerpt required",
        description: "Please enter a short excerpt for your post.",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        title,
        category,
        excerpt,
        content: content ? JSON.stringify(content) : null,
        imageUrl: image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        published: publish,
      };

      if (isEditMode && postId) {
        await updateMutation.mutateAsync({ ...postData, id: postId });
        toast({
          title: "Post updated",
          description: publish ? "Your post has been published." : "Your draft has been saved.",
        });
        if (publish && existingPost) {
          setLocation(`/blog/${existingPost.slug}`);
        }
      } else {
        const result = await createMutation.mutateAsync(postData);
        toast({
          title: "Post created",
          description: publish ? "Your post has been published." : "Your draft has been saved.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditorChange = (serializedState: SerializedEditorState) => {
    setContent(serializedState);
  };

  if (!user?.isAuthenticated && !isAdmin) {
    return null;
  }

  if (isEditMode && isLoadingPost) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-10 w-48" />
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => setLocation("/blog")}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Draft
              </Button>
              <Button 
                size="sm"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-8">
            {isEditMode ? "Edit Post" : "Create New Post"}
          </h1>

          <div className="space-y-8">
            {/* Post Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter your post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Write a short summary of your post..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This will appear on the blog listing page
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as BlogCategory)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(blogCategoryLabels) as [BlogCategory, string][]).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Cover Image URL</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for default image
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editor Card */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px]">
                  {isEditMode && content ? (
                    <Editor
                      key={editorKey}
                      editorSerializedState={content}
                      onSerializedChange={handleEditorChange}
                    />
                  ) : (
                    <Editor
                      key={editorKey}
                      onSerializedChange={handleEditorChange}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
