import { blogPosts } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Travel Stories & Tips</h1>
        <p className="text-muted-foreground">Get inspired by amazing travel experiences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
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
                <span className="text-xs font-bold text-primary uppercase tracking-wider">{post.category}</span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm mb-4">
                {post.excerpt}
              </p>
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
    </div>
  );
}
