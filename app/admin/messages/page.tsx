import { MessagesTable } from "@/components/admin/messages/messages-table";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Messages Management</h1>
        <p className="text-gray-400">Monitor and manage platform communications</p>
      </div>
      
      <MessagesTable />
    </div>
  );
}