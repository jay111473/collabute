import { MessagesTable } from "@/components/admin/messages/messages-table";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages Management</h1>
        <p className="text-gray-600">Monitor and manage platform communications</p>
      </div>
      
      <MessagesTable />
    </div>
  );
}