"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { BlogEditDialog } from "./blog-edit-dialog";
import { BlogWithDetails } from "@/types/convex";

export function BlogsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<BlogWithDetails | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const blogs = useQuery(api.blogs.listAllBlogs) as
    | BlogWithDetails[]
    | undefined;
  const deleteBlog = useMutation(api.blogs.deleteBlog);

  const filteredBlogs = blogs?.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="bg-darkGray2 text-gray-300 border-grayBorders"
          >
            Archived
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-darkGray2 text-gray-300 border-grayBorders"
          >
            Unknown
          </Badge>
        );
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  const handleCreateBlog = () => {
    setSelectedBlog(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleViewBlog = (blog: BlogWithDetails) => {
    setSelectedBlog(blog);
    setDialogMode("view");
    setIsDialogOpen(true);
  };

  const handleEditBlog = (blog: BlogWithDetails) => {
    setSelectedBlog(blog);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog({ id: blogId as any });
      } catch (error) {
        console.error("Failed to delete blog:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-darkGray border-grayBorders text-white placeholder-gray-400"
          />
        </div>

        <Button
          onClick={handleCreateBlog}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Blog
        </Button>
      </div>

      <div className="bg-darkGray border border-grayBorders rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-darkGray2 border-b border-grayBorders">
              <TableHead className="text-gray-300 font-medium px-6 py-4 w-1/4">
                Title
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Category
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Status
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Published
              </TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredBlogs?.map((blog) => (
              <TableRow
                key={blog._id}
                className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150"
              >
                <TableCell className="font-medium text-white px-6 py-4 w-1/4">
                  <div className="max-w-full">
                    <div className="font-medium truncate" title={blog.title}>
                      {blog.title}
                    </div>
                    {blog.description && (
                      <div className="text-sm text-gray-400 mt-1 truncate" title={blog.description}>
                        {blog.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-gray-300 px-4 py-4">
                  {blog.category?.name || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(blog.status)}
                </TableCell>
                <TableCell className="text-gray-300 px-4 py-4">
                  {formatDate(blog.publishedAt)}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewBlog(blog)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditBlog(blog)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleDeleteBlog(blog._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBlogs?.length === 0 && (
        <div className="text-center py-8 text-gray-400">No blogs found</div>
      )}

      <BlogEditDialog
        blog={selectedBlog}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
      />
    </div>
  );
}
