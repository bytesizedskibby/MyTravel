import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, PenTool, Eye, MessageSquare, Tag, Image } from "lucide-react";

export default function AdminBlog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage blog posts, categories, and comments.
          </p>
        </div>
      </div>

      {/* Placeholder Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Unpublished posts</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Preview</CardTitle>
          <CardDescription>
            This module will be available in a future update
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold">Content Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Create and edit blog posts with rich text editor
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Schedule posts for future publication
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Manage categories and tags
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  SEO optimization tools
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Moderate comments
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Content Types</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Blog Posts</div>
                    <div className="text-sm text-muted-foreground">Travel guides and articles</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                  <Tag className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Categories & Tags</div>
                    <div className="text-sm text-muted-foreground">Organize content by topic</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                  <Image className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Media Library</div>
                    <div className="text-sm text-muted-foreground">Manage images and files</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
