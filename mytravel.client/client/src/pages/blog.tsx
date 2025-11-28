import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, PenSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useBlog, getAuthorInitials, BlogCategory } from "@/context/blog-context";
import { blogCategoryLabels } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

type FilterCategory = BlogCategory | "all";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const { getPostsByCategory } = useBlog();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const posts = getPostsByCategory(activeCategory);

  const categories: { value: FilterCategory; label: string }[] = [
    { value: "all", label: "All Posts" },
    { value: "solo-travel", label: "Solo Travel" },
    { value: "family-trips", label: "Family Trips" },
    { value: "luxury-travel", label: "Luxury Travel" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Travel Stories & Tips</h1>
        <p className="text-muted-foreground mb-8">Get inspired by amazing travel experiences from our community.</p>
        
        {/* Write a Post Button - Only visible when authenticated */}
        {user?.isAuthenticated && (
          <Button 
            onClick={() => setLocation("/blog/new")} 
            className="gap-2 mb-8"
          >
            <PenSquare className="h-4 w-4" />
            Write a Post
          </Button>
        )}
        
        {/* Category Filter Tabs */}
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as FilterCategory)} className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs sm:text-sm">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No posts found in this category.</p>
          {user?.isAuthenticated && (
            <Button onClick={() => setLocation("/blog/new")} variant="link" className="mt-4">
              Be the first to write one!
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-none shadow-lg group h-full flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {blogCategoryLabels[post.category]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
                <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm mb-4">
                  {post.excerpt}
                </p>
                {/* Author Info */}
                <div className="flex items-center gap-2 mt-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getAuthorInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{post.author.name}</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button asChild variant="link" className="p-0 h-auto text-primary font-semibold group-hover:translate-x-1 transition-transform">
                  <Link href={`/blog/${post.id}`}>
                    Read Story <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
