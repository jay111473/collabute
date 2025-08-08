import { BlogsTable } from "@/components/admin/blogs/blogs-table";

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Blog Management</h1>
        <p className="text-gray-400">Manage blog posts, categories, and tags</p>
      </div>
      
      <BlogsTable />
    </div>
  );
}