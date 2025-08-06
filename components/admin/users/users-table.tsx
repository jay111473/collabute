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
import { Eye, EyeOff, Edit, Trash2, Plus, Search, RefreshCw } from "lucide-react";
import { User } from "@/types/convex";
import { UserEditDialog } from "./user-edit-dialog";

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "" as string,
    isActive: true,
    phoneNumber: "",
    country: "",
    industry: "",
    isAdmin: false,
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
        className="bg-darkGray2 text-gray-300 border-grayBorders"
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
          className="bg-darkGray2 text-gray-300 border-grayBorders"
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
      className: "bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {type}
      </Badge>
    );
  };

  const handleCreateUser = async () => {
    if (
      !formData.email.trim() ||
      !formData.name.trim() ||
      !formData.password.trim()
    )
      return;

    setIsLoading(true);
    try {
      await createUser({
        email: formData.email.trim(),
        name: formData.name.trim(),
        password: formData.password.trim(),
        role: (formData.role as any) || undefined,
        isActive: formData.isActive,
        isAdmin: formData.isAdmin,
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
        password: "",
        role: "",
        isActive: true,
        phoneNumber: "",
        country: "",
        industry: "",
        isAdmin: false,
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
            className="bg-darkGray border-grayBorders text-white placeholder-gray-400"
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

      <div className="bg-darkGray border border-grayBorders rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-darkGray2 border-b border-grayBorders">
              <TableHead className="text-gray-300 font-medium px-6 py-4">
                Name
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Email
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Type
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Country
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Status
              </TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">
                Wallet
              </TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredUsers?.map((user) => (
              <TableRow
                key={user._id}
                className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150"
              >
                <TableCell className="font-medium text-white px-6 py-4">
                  {user.name || "N/A"}
                </TableCell>
                <TableCell className="text-gray-300 px-4 py-4">
                  {user.email}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getUserTypeBadge(user.type)}
                </TableCell>
                <TableCell className="text-gray-300 px-4 py-4">
                  {user.country || "N/A"}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(user)}
                </TableCell>
                <TableCell className="text-gray-300 px-4 py-4">
                  ${user.wallet || 0}
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-darkGray2 transition-colors duration-150"
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
        <div className="text-center py-8 text-gray-400">No users found</div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-darkGray border-grayBorders">
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
                className="bg-darkGray border-grayBorders text-white"
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
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Generate secure password
                    const chars =
                      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                    let password = "";
                    for (let i = 0; i < 12; i++) {
                      password += chars.charAt(
                        Math.floor(Math.random() * chars.length)
                      );
                    }
                    setFormData({ ...formData, password });
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-darkGray border-grayBorders text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Password must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
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
                className="bg-darkGray border-grayBorders text-white"
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
                className="bg-darkGray border-grayBorders text-white"
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
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>

            <div className="flex items-center justify-between">
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
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAdmin: checked })
                  }
                />
                <Label htmlFor="isAdmin" className="text-orange-400">
                  Admin Role
                </Label>
              </div>
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
                !formData.email.trim() ||
                !formData.name.trim() ||
                !formData.password.trim() ||
                isLoading
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
