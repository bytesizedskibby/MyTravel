import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  PenTool,
  CheckCircle,
  Clock,
  Plus,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type BlogAuthor = {
  id: string;
  name: string;
};

type BlogPost = {
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
};

type BlogPostsResponse = {
  posts: BlogPost[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type BlogStats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  postsThisWeek: number;
  postsThisMonth: number;
  postsByCategory: { category: string; count: number }[];
};

type SortField = "title" | "category" | "createdAt" | "published" | "publishedAt";
type SortOrder = "asc" | "desc";

const categoryLabels: Record<string, string> = {
  "solo-travel": "Solo Travel",
  "family-trips": "Family Trips",
  "luxury-travel": "Luxury Travel",
};

const categoryColors: Record<string, "default" | "secondary" | "outline"> = {
  "solo-travel": "default",
  "family-trips": "secondary",
  "luxury-travel": "outline",
};

export default function AdminBlog() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Modal states
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state for create
  const [newPost, setNewPost] = useState({
    title: "",
    category: "solo-travel",
    excerpt: "",
    imageUrl: "",
    published: false,
  });

  // Fetch blog posts
  const { data, isLoading, refetch, isFetching } = useQuery<BlogPostsResponse>({
    queryKey: ["/api/admin/blog", page, pageSize, search, categoryFilter, statusFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
      });
      if (search) params.append("search", search);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const res = await fetch(`/api/admin/blog?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return res.json();
    },
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<BlogStats>({
    queryKey: ["/api/admin/blog/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/blog/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
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
      toast({
        title: "Post Created",
        description: `"${newPost.title}" has been created successfully.`,
      });
      setIsCreateDialogOpen(false);
      setNewPost({
        title: "",
        category: "solo-travel",
        excerpt: "",
        imageUrl: "",
        published: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/admin/blog/${postId}/toggle-publish`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "The blog post has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsViewDialogOpen(true);
  };

  const handleDeletePost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "MMM d, yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage blog posts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPosts ?? 0}</div>
                <p className="text-xs text-muted-foreground">All blog posts</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.publishedPosts ?? 0}</div>
                <p className="text-xs text-muted-foreground">Live articles</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.draftPosts ?? 0}</div>
                <p className="text-xs text-muted-foreground">Unpublished posts</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.postsThisMonth ?? 0}</div>
                <p className="text-xs text-muted-foreground">New posts</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find blog posts by title or excerpt</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or excerpt..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
              {search && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </form>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="solo-travel">Solo Travel</SelectItem>
                <SelectItem value="family-trips">Family Trips</SelectItem>
                <SelectItem value="luxury-travel">Luxury Travel</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            {search ? `Showing results for "${search}"` : "All blog posts"}
            {categoryFilter !== "all" && ` • Category: ${categoryLabels[categoryFilter] || categoryFilter}`}
            {statusFilter !== "all" && ` • Status: ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-8 p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("title")}
                    >
                      Title
                      <SortIcon field="title" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-8 p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("category")}
                    >
                      Category
                      <SortIcon field="category" />
                    </Button>
                  </TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-8 p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("published")}
                    >
                      Status
                      <SortIcon field="published" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-8 p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created
                      <SortIcon field="createdAt" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.posts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No blog posts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.posts?.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-mono">#{post.id}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium truncate">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryColors[post.category] || "outline"}>
                          {categoryLabels[post.category] || post.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.author?.name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={post.published ? "default" : "secondary"} className="gap-1">
                          {post.published ? (
                            <><CheckCircle className="h-3 w-3" /> Published</>
                          ) : (
                            <><PenTool className="h-3 w-3" /> Draft</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(post.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewPost(post)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug}`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View on Site
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/editor/${post.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Post
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => togglePublishMutation.mutate(post.id)}>
                              {post.published ? (
                                <><PenTool className="mr-2 h-4 w-4" /> Unpublish</>
                              ) : (
                                <><CheckCircle className="mr-2 h-4 w-4" /> Publish</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePost(post)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {page} of {data?.totalPages ?? 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= (data?.totalPages ?? 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(data?.totalPages ?? 1)}
                  disabled={page >= (data?.totalPages ?? 1)}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Post Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              #{selectedPost?.id} • {selectedPost?.published ? "Published" : "Draft"}
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="grid gap-4 py-4">
              {selectedPost.imageUrl && (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={selectedPost.imageUrl} 
                    alt={selectedPost.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium text-lg">{selectedPost.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <div className="mt-1">
                    <Badge variant={categoryColors[selectedPost.category] || "outline"}>
                      {categoryLabels[selectedPost.category] || selectedPost.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Author</Label>
                  <p>{selectedPost.author?.name || "—"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Excerpt</Label>
                <p className="text-sm">{selectedPost.excerpt || "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Slug</Label>
                <p className="font-mono text-sm">/blog/{selectedPost.slug}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedPost.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Published</Label>
                  <p className="text-sm">{formatDate(selectedPost.publishedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href={`/blog/editor/${selectedPost?.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Create a new blog post. You can edit the full content in the editor after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="Enter post title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newPost.category}
                onValueChange={(value) => setNewPost({ ...newPost, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo-travel">Solo Travel</SelectItem>
                  <SelectItem value="family-trips">Family Trips</SelectItem>
                  <SelectItem value="luxury-travel">Luxury Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={newPost.excerpt}
                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                placeholder="Brief description of the post"
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={newPost.imageUrl}
                onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={newPost.published}
                onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="published" className="font-normal">
                Publish immediately
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
              {createPostMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedPost?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPost && deletePostMutation.mutate(selectedPost.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePostMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
