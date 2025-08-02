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
  const transactionCount = useQuery(api.transactions.count);
  const productCount = useQuery(api.products.count);
  
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
      value: transactionCount ?? 0,
      icon: CreditCard,
      description: "Payment transactions",
    },
    {
      title: "Products",
      value: productCount ?? 0,
      icon: Building,
      description: "Available products",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">Manage your platform data and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-darkGray border border-grayBorders shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-gray-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-darkGray border border-grayBorders shadow-sm">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">
              Activity logs will be displayed here...
            </div>
          </CardContent>
        </Card>

        <Card className="bg-darkGray border border-grayBorders shadow-sm">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Database</span>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">API</span>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Storage</span>
                <span className="text-sm text-green-600">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}