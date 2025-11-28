import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useBlog, BlogCategory, EditorContent } from "@/context/blog-context";
import { blogCategoryLabels } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export default function BlogEditor() {
  const [, params] = useRoute("/blog/edit/:id");
  const [, setLocation] = useLocation();
  const { getPost, addPost, updatePost } = useBlog();
  const { user } = useAuth();
  const { toast } = useToast();

  const isEditMode = !!params?.id;
  const existingPost = isEditMode ? getPost(params.id) : undefined;

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState<BlogCategory>("solo-travel");
  const [content, setContent] = useState<EditorContent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user?.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create or edit blog posts.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [user, setLocation, toast]);

  // Load existing post data in edit mode
  useEffect(() => {
    if (isEditMode && existingPost) {
      // Check if user is the author
      if (user?.name !== existingPost.author.name) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own posts.",
          variant: "destructive",
        });
        setLocation("/blog");
        return;
      }
      setTitle(existingPost.title);
      setExcerpt(existingPost.excerpt);
      setImage(existingPost.image);
      setCategory(existingPost.category);
      setContent(existingPost.content);
    }
  }, [isEditMode, existingPost, user, setLocation, toast]);

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

    setIsSubmitting(true);

    try {
      if (isEditMode && existingPost) {
        updatePost(existingPost.id, {
          title,
          excerpt,
          image: image || existingPost.image,
          category,
          content,
          published: publish,
        });
        toast({
          title: "Post updated",
          description: publish ? "Your post has been published." : "Your draft has been saved.",
        });
      } else {
        const newPost = addPost({
          title,
          excerpt,
          image: image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
          category,
          content,
          published: publish,
          author: {
            id: `user-${Date.now()}`,
            name: user?.name || "Anonymous",
          },
        });
        toast({
          title: "Post created",
          description: publish ? "Your post has been published." : "Your draft has been saved.",
        });
        setLocation(`/blog/${newPost.id}`);
        return;
      }

      if (publish) {
        setLocation(`/blog/${existingPost?.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = (serializedState: SerializedEditorState) => {
    setContent(serializedState);
  };

  if (!user?.isAuthenticated) {
    return null;
  }

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
                  {isEditMode && existingPost?.content ? (
                    <Editor
                      editorSerializedState={existingPost.content}
                      onSerializedChange={handleEditorChange}
                    />
                  ) : (
                    <Editor
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
