import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useBlog, getAuthorInitials, BlogPost } from "@/context/blog-context";
import { blogCategoryLabels } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Edit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { nodes } from "@/components/blocks/editor-md/nodes";

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const [, setLocation] = useLocation();
  const { getPostBySlug, getPost, isLoading: contextLoading } = useBlog();
  const { user } = useAuth();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!params?.slug) return;
      setIsLoading(true);
      
      // First try to get from cache/context
      const cachedPost = getPost(params.slug);
      if (cachedPost) {
        setPost(cachedPost);
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from API
      const fetchedPost = await getPostBySlug(params.slug);
      setPost(fetchedPost);
      setIsLoading(false);
    };
    
    fetchPost();
  }, [params?.slug, getPostBySlug, getPost]);

  if (isLoading || contextLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Skeleton className="h-[50vh] w-full" />
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-xl shadow-lg p-8 md:p-12">
              <Skeleton className="h-8 w-24 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Blog post not found</h2>
        <Button onClick={() => setLocation("/blog")} className="mt-4">
          Back to Blog
        </Button>
      </div>
    );
  }

  const isAuthor = user?.isAuthenticated && user.name === post.author.name;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-6 left-4 md:left-8">
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2"
            onClick={() => setLocation("/blog")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <article className="max-w-3xl mx-auto">
          {/* Post Header */}
          <div className="bg-card rounded-xl shadow-lg p-8 md:p-12 mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {blogCategoryLabels[post.category]}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
              {post.title}
            </h1>
            
            {/* Author & Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getAuthorInitials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(post.createdAt), "MMMM dd, yyyy")}
                  </div>
                </div>
              </div>
              
              {isAuthor && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setLocation(`/blog/editor/${post.id}`)}
                >
                  <Edit className="h-4 w-4" /> Edit Post
                </Button>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="bg-card rounded-xl shadow-lg p-8 md:p-12">
            {post.content ? (
              <LexicalComposer
                initialConfig={{
                  namespace: "BlogReader",
                  theme: editorTheme,
                  nodes,
                  editable: false,
                  editorState: JSON.stringify(post.content),
                  onError: (error: Error) => {
                    console.error(error);
                  },
                }}
              >
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable 
                      placeholder="" 
                      className="min-h-0 prose prose-lg max-w-none focus:outline-none px-0"
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
              </LexicalComposer>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Back to Blog */}
          <div className="text-center mt-12">
            <Button variant="outline" onClick={() => setLocation("/blog")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to all posts
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
