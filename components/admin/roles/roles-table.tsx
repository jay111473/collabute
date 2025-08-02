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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Eye, Edit, Trash2, Plus, Search, Shield, Users } from "lucide-react";
import { Role } from "@/types/convex";
import { RoleEditDialog } from "./role-edit-dialog";

export function RolesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    isActive: true,
    permissions: "" as string,
  });
  
  const roles = useQuery(api.roles.list) as Role[] | undefined;
  const createRole = useMutation(api.roles.create);

  const filteredRoles = roles?.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge
        variant={isActive ? "default" : "destructive"}
        className={isActive ? "bg-green-600 text-white" : "bg-red-600 text-white"}
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim() || !formData.displayName.trim()) return;
    
    setIsLoading(true);
    try {
      const permissions = formData.permissions
        .split(",")
        .map(p => p.trim())
        .filter(p => p.length > 0);
        
      await createRole({
        name: formData.name.trim(),
        displayName: formData.displayName.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
        permissions,
      });
      
      setIsCreateOpen(false);
      setFormData({
        name: "",
        displayName: "",
        description: "",
        isActive: true,
        permissions: "",
      });
    } catch (error) {
      console.error("Failed to create role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-darkGray border-grayBorders text-white placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="h-4 w-4" />
            {filteredRoles?.length || 0} roles
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
      </div>

      <div className="bg-darkGray border border-grayBorders rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-darkGray2 border-b border-grayBorders">
              <TableHead className="text-gray-300 font-medium px-6 py-4">Name</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Display Name</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Description</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Status</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Permissions</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Created</TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredRoles?.map((role) => (
              <TableRow key={role._id} className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <div className="font-medium text-white">{role.name}</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-gray-300">{role.displayName}</div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-400 max-w-xs truncate">
                    {role.description || "No description"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">{getStatusBadge(role.isActive)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 2).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {permission}
                      </Badge>
                    ))}
                    {role.permissions && role.permissions.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-300 border-grayBorders">
                        +{role.permissions.length - 2}
                      </Badge>
                    )}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <Badge variant="outline" className="text-xs bg-darkGray2 text-gray-400 border-grayBorders">
                        No permissions
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    {formatDate(role._creationTime)}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewRole(role)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-300 hover:bg-darkGray2 transition-colors duration-150">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRoles?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No roles found
        </div>
      )}
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                placeholder="e.g., admin, moderator"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="e.g., Administrator, Moderator"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Role description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-darkGray border-grayBorders min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="permissions">Permissions (comma-separated)</Label>
              <Input
                id="permissions"
                placeholder="e.g., read, write, delete"
                value={formData.permissions}
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
              onClick={handleCreateRole}
              disabled={!formData.name.trim() || !formData.displayName.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RoleEditDialog
        role={selectedRole}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}