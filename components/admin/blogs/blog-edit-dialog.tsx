"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { X, Plus } from "lucide-react";
import { BlogWithDetails } from "@/types/convex";
import { toast } from "sonner";

interface BlogEditDialogProps {
  blog: BlogWithDetails | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit" | "create";
}

export function BlogEditDialog({
  blog,
  isOpen,
  onOpenChange,
  mode,
}: BlogEditDialogProps) {
  const { user } = useAdminAuth();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: null as any,
    thumbnailId: "",
    status: "draft" as "draft" | "published" | "archived",
    categoryId: "",
    tagIds: [] as string[],
    authorId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const categories = useQuery(api.blogs.getCategories);
  const tags = useQuery(api.blogs.getTags);
  const users = useQuery(api.users.list, { limit: 10 });
  const createBlog = useMutation(api.blogs.createBlog);
  const updateBlog = useMutation(api.blogs.updateBlog);
  const createCategory = useMutation(api.blogs.createCategory);
  const createTag = useMutation(api.blogs.createTag);

  useEffect(() => {
    if (blog && (mode === "edit" || mode === "view")) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        description: blog.description || "",
        content: blog.content || null,
        thumbnailId: blog.thumbnail?._id || "",
        status: blog.status || "draft",
        categoryId: blog.category?._id || "none",
        tagIds: tags?.filter(Boolean).map((tag) => tag._id) || [],
        authorId: blog.author?._id || "none",
      });
    } else if (mode === "create") {
      setFormData({
        title: "",
        slug: "",
        description: "",
        content: null,
        thumbnailId: "",
        status: "draft",
        categoryId: "none",
        tagIds: [],
        authorId: "none",
      });
    }
  }, [blog, mode, tags]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const categoryId = await createCategory({
        name: newCategoryName.trim(),
        slug: generateSlug(newCategoryName.trim()),
      });
      
      setFormData((prev) => ({ ...prev, categoryId }));
      setNewCategoryName("");
      setShowNewCategory(false);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const tagId = await createTag({
        name: newTagName.trim(),
        slug: generateSlug(newTagName.trim()),
      });
      
      setFormData((prev) => ({
        ...prev,
        tagIds: [...prev.tagIds, tagId],
      }));
      setNewTagName("");
      setShowNewTag(false);
      toast.success("Tag created successfully!");
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) return;

    setIsLoading(true);
    try {
      if (mode === "create") {
        await createBlog({
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || undefined,
          content: formData.content || undefined,
          thumbnail: formData.thumbnailId
            ? (formData.thumbnailId as any)
            : undefined,
          status: formData.status,
          category:
            formData.categoryId !== "none"
              ? (formData.categoryId as any)
              : undefined,
          tags:
            formData.tagIds.length > 0 ? (formData.tagIds as any[]) : undefined,
          authorId:
            formData.authorId !== "none"
              ? (formData.authorId as any)
              : undefined,
        });
      } else if (mode === "edit" && blog) {
        await updateBlog({
          id: blog._id as any,
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || undefined,
          content: formData.content || undefined,
          thumbnail: formData.thumbnailId
            ? (formData.thumbnailId as any)
            : undefined,
          status: formData.status,
          category:
            formData.categoryId !== "none"
              ? (formData.categoryId as any)
              : undefined,
          tags:
            formData.tagIds.length > 0 ? (formData.tagIds as any[]) : undefined,
          authorId:
            formData.authorId !== "none"
              ? (formData.authorId as any)
              : undefined,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${mode} blog:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Blog Post";
      case "edit":
        return "Edit Blog Post";
      case "view":
        return "View Blog Post";
      default:
        return "Blog Post";
    }
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto !bg-darkGray border-grayBorders">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Blog post title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={isReadOnly}
              className="bg-darkGray border-grayBorders text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              placeholder="blog-post-slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              disabled={isReadOnly}
              className="bg-darkGray border-grayBorders text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the blog post"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isReadOnly}
              className="bg-darkGray border-grayBorders text-white min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              placeholder="Write your blog post content here..."
              readOnly={isReadOnly}
              userId={user?.id}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="text-gray-300">
              Thumbnail Image
            </Label>
            {user && (
              <ImageUploader
                currentImageUrl={blog?.thumbnail?.url}
                currentImageId={blog?.thumbnail?._id}
                onUploadComplete={(mediaId: string) => {
                  if (!isReadOnly) {
                    setFormData((prev) => ({ ...prev, thumbnailId: mediaId }));
                  }
                }}
                onUploadError={(error: string) => {
                  console.error("Upload error:", error);
                }}
                onRemove={() => {
                  if (!isReadOnly) {
                    setFormData((prev) => ({ ...prev, thumbnailId: "" }));
                  }
                }}
                userId={user.id}
                className="max-w-md"
                disabled={isReadOnly}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "published" | "archived") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select
                value={formData.authorId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, authorId: value }))
                }
                disabled={isReadOnly}
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No author</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category</Label>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-blue-400 hover:text-blue-300 h-auto p-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              )}
            </div>
            
            {showNewCategory && !isReadOnly && (
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-darkGray border-grayBorders text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateCategory();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, categoryId: value }))
              }
              disabled={isReadOnly}
            >
              <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tags</Label>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewTag(!showNewTag)}
                  className="text-blue-400 hover:text-blue-300 h-auto p-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tag
                </Button>
              )}
            </div>
            
            {showNewTag && !isReadOnly && (
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="bg-darkGray border-grayBorders text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewTag(false);
                    setNewTagName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 p-3 bg-darkGray2 border border-grayBorders rounded-md min-h-[60px]">
              {tags?.map((tag) => {
                const isSelected = formData.tagIds.includes(tag._id);
                return (
                  <Badge
                    key={tag._id}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "hover:bg-gray-100"
                    } ${isReadOnly ? "pointer-events-none" : ""}`}
                    onClick={() => !isReadOnly && handleTagToggle(tag._id)}
                  >
                    {tag.name}
                    {isSelected && !isReadOnly && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                );
              })}
              {tags?.length === 0 && (
                <span className="text-gray-400 text-sm">No tags available</span>
              )}
            </div>
          </div>

          {mode === "view" && blog && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-grayBorders">
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Published
                </Label>
                <p className="text-sm text-gray-400">
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleString()
                    : "Not published"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-300">
                  Last Updated
                </Label>
                <p className="text-sm text-gray-400">
                  {new Date(blog.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode !== "view" && (
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.title.trim() || !formData.slug.trim() || isLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Blog"
                  : "Update Blog"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
