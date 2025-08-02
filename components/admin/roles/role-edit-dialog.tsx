"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from "@/types/convex";
import { Calendar, Shield, Activity, Tag, Users } from "lucide-react";

interface RoleEditDialogProps {
  role: Role | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function RoleEditDialog({ role, isOpen, onOpenChange, mode }: RoleEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: role?.name || "",
    displayName: role?.displayName || "",
    description: role?.description || "",
    isActive: role?.isActive ?? true,
    permissions: role?.permissions || [],
  });

  const updateRole = useMutation(api.roles.update);

  const handleSave = async () => {
    if (!role || mode === "view") return;
    
    setIsLoading(true);
    try {
      await updateRole({
        id: role._id,
        ...formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-600 text-white">Active</Badge>
    ) : (
      <Badge variant="outline" className="bg-darkGray2 text-gray-300 border-grayBorders">Inactive</Badge>
    );
  };

  const getPermissionBadge = (permission: string) => {
    const badgeConfig = {
      'admin': { variant: "destructive" as const, className: "bg-red-600 text-white" },
      'create': { variant: "default" as const, className: "bg-green-600 text-white" },
      'read': { variant: "secondary" as const, className: "bg-blue-100 text-blue-800 border-blue-200" },
      'update': { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      'delete': { variant: "destructive" as const, className: "bg-red-600 text-white" },
      'manage': { variant: "default" as const, className: "bg-purple-600 text-white" },
    };

    // Check if permission contains any of the key words
    const permissionLower = permission.toLowerCase();
    let config: { variant: "outline" | "default" | "secondary" | "destructive", className: string } = { 
      variant: "outline" as const, 
      className: "bg-darkGray2 text-gray-300 border-grayBorders" 
    };
    
    for (const [key, value] of Object.entries(badgeConfig)) {
      if (permissionLower.includes(key)) {
        config = value;
        break;
      }
    }

    return (
      <Badge variant={config.variant} className={config.className}>
        {permission}
      </Badge>
    );
  };

  const handlePermissionsChange = (value: string) => {
    const permissionsArray = value.split(',').map(perm => perm.trim()).filter(Boolean);
    setFormData({ ...formData, permissions: permissionsArray });
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === "view" ? "Role Details" : "Edit Role"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="meta">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border">
                    {role.name}
                  </p>
                ) : (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-darkGray border-grayBorders text-white"
                    placeholder="admin, user, moderator..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border">
                    {role.displayName}
                  </p>
                ) : (
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="bg-darkGray border-grayBorders text-white"
                    placeholder="Administrator, User, Moderator..."
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border min-h-[80px]">
                  {role.description || "N/A"}
                </p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-darkGray border-grayBorders text-white min-h-[80px]"
                  placeholder="Describe the role's purpose and responsibilities..."
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div>{getStatusBadge(role.isActive)}</div>
            </div>

            {mode === "edit" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Active Role
                </Label>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="permissions">Permissions</Label>
                {mode === "view" ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map((permission: string) => (
                          getPermissionBadge(permission)
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No permissions assigned</p>
                      )}
                    </div>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="bg-darkGray2 p-3 rounded-md border">
                        <p className="text-xs text-gray-400 mb-2">Permission List:</p>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {role.permissions.map((permission: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              {permission}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="permissions"
                      value={formData.permissions.join(', ')}
                      onChange={(e) => handlePermissionsChange(e.target.value)}
                      className="bg-darkGray border-grayBorders text-white"
                      placeholder="admin, create_users, delete_posts (comma separated)"
                    />
                    {formData.permissions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {formData.permissions.map((permission: string) => (
                            getPermissionBadge(permission)
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">
                          {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''} assigned
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role Information</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Name:</span>
                    <span className="text-sm font-medium text-white">{role.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Display Name:</span>
                    <span className="text-sm text-white">{role.displayName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Status:</span>
                    <div>{getStatusBadge(role.isActive)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Permissions:</span>
                    <span className="text-sm text-white">{role.permissions?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role Hierarchy</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {role.name === 'admin' ? 'Administrator (Highest Level)' : 
                     role.name === 'moderator' ? 'Moderator (Medium Level)' : 
                     'User (Standard Level)'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role Status</Label>
                <div>{getStatusBadge(role.isActive)}</div>
              </div>

              <div className="space-y-2">
                <Label>Role Identifier</Label>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white font-mono">{role.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permission Count</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">{role.permissions?.length || 0} permissions</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(role._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border">
                  {role._id}
                </p>
              </div>

              <div className="space-y-2">
                <Label>System Information</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Created At:</span>
                    <span className="text-white">{new Date(role._creationTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white">{role.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-mono">{role.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Display Name:</span>
                    <span className="text-white">{role.displayName}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-white"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode === "edit" && (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}