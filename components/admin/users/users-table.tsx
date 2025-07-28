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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { User } from "@/types/convex";
import { UserEditDialog } from "./user-edit-dialog";

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "" as string,
    isActive: true,
    phoneNumber: "",
    country: "",
    industry: "",
  });

  const users = useQuery(api.users.list, {}) as User[] | undefined;
  const createUser = useMutation(api.users.create);

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (user: User) => {
    if (user.isVerified) {
      return (
        <Badge variant="default" className="bg-green-600 text-white">
          Verified
        </Badge>
      );
    }
    if (user.kycStatus === "PENDING") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          KYC Pending
        </Badge>
      );
    }
    if (user.kycStatus === "REJECTED") {
      return <Badge variant="destructive">KYC Rejected</Badge>;
    }
    return (
      <Badge
        variant="outline"
        className="bg-gray-50 text-gray-700 border-gray-300"
      >
        Unverified
      </Badge>
    );
  };

  const getUserTypeBadge = (type: string | undefined) => {
    if (!type)
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-300"
        >
          N/A
        </Badge>
      );

    const badgeConfig = {
      DEVELOPER: {
        variant: "default" as const,
        className: "bg-blue-600 text-white",
      },
      STARTUP: {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      DESIGNER: {
        variant: "outline" as const,
        className: "bg-pink-50 text-pink-700 border-pink-300",
      },
      LEAD: {
        variant: "destructive" as const,
        className: "bg-red-600 text-white",
      },
      PROJECT_MANAGER: {
        variant: "default" as const,
        className: "bg-indigo-600 text-white",
      },
    };

    const config = badgeConfig[type as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-gray-50 text-gray-700 border-gray-300",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {type}
      </Badge>
    );
  };

  const handleCreateUser = async () => {
    if (!formData.email.trim() || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      await createUser({
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: (formData.role as any) || undefined,
        isActive: formData.isActive,
        profileData: {
          phoneNumber: formData.phoneNumber.trim() || undefined,
          country: formData.country.trim() || undefined,
          industry: formData.industry.trim() || undefined,
        },
      });

      setIsCreateOpen(false);
      setFormData({
        email: "",
        name: "",
        role: "",
        isActive: true,
        phoneNumber: "",
        country: "",
        industry: "",
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium px-6 py-4">
                Name
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Email
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Type
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Country
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Status
              </TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">
                Wallet
              </TableHead>
              <TableHead className="text-right text-gray-700 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {filteredUsers?.map((user) => (
              <TableRow
                key={user._id}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150"
              >
                <TableCell className="font-medium text-gray-900 px-6 py-4">
                  {user.name || "N/A"}
                </TableCell>
                <TableCell className="text-gray-700 px-4 py-4">
                  {user.email}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getUserTypeBadge(user.type)}
                </TableCell>
                <TableCell className="text-gray-700 px-4 py-4">
                  {user.country || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(user)}
                </TableCell>
                <TableCell className="text-gray-700 px-4 py-4">
                  ${user.wallet || 0}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-amber-700 hover:bg-amber-100 transition-colors duration-150"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors duration-150"
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

      {filteredUsers?.length === 0 && (
        <div className="text-center py-8 text-gray-500">No users found</div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEVELOPER">Developer</SelectItem>
                  <SelectItem value="STARTUP">Startup</SelectItem>
                  <SelectItem value="DESIGNER">Designer</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="PROJECT_MANAGER">
                    Project Manager
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="United States"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="Technology"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                !formData.email.trim() || !formData.name.trim() || isLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserEditDialog
        user={selectedUser}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}
