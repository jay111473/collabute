"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Users, FolderOpen, Bug, MessageSquare, CreditCard, Building } from "lucide-react";

export function AdminDashboard() {
  // Get counts for different entities
  const userCount = useQuery(api.users.count);
  const projectCount = useQuery(api.projects.count);
  const issueCount = useQuery(api.issues.count);
  const messageCount = useQuery(api.messages.count);
  
  const stats = [
    {
      title: "Total Users",
      value: userCount ?? 0,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Projects",
      value: projectCount ?? 0,
      icon: FolderOpen,
      description: "Active projects",
    },
    {
      title: "Issues",
      value: issueCount ?? 0,
      icon: Bug,
      description: "Open issues",
    },
    {
      title: "Messages",
      value: messageCount ?? 0,
      icon: MessageSquare,
      description: "Total messages",
    },
    {
      title: "Transactions",
      value: 0, // Will implement count query
      icon: CreditCard,
      description: "Payment transactions",
    },
    {
      title: "Products",
      value: 0, // Will implement count query
      icon: Building,
      description: "Available products",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your platform data and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Activity logs will be displayed here...
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Database</span>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">API</span>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Storage</span>
                <span className="text-sm text-green-600">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}