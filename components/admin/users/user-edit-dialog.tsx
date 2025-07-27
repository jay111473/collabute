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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/convex";
import {
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";

interface UserEditDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function UserEditDialog({
  user,
  isOpen,
  onOpenChange,
  mode,
}: UserEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "",
    type: user?.type || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    industry: user?.industry || "",
    wallet: user?.wallet || 0,
    isVerified: user?.isVerified || false,
    kycStatus: user?.kycStatus || "UNVERIFIED",
  });

  const updateUser = useMutation(api.users.updateUserProfile);

  const handleSave = async () => {
    if (!user || mode === "view") return;

    setIsLoading(true);
    try {
      await updateUser({
        userId: user._id,
        updates: {
          ...formData,
          type: formData.type as any,
          kycStatus: formData.kycStatus as any,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {mode === "view" ? "User Details" : "Edit User"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                    {user.name || "N/A"}
                  </p>
                ) : (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                ) : (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">User Type</Label>
                {mode === "view" ? (
                  <div>{getUserTypeBadge(user.type)}</div>
                ) : (
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select type" />
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
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">
                      {user.phoneNumber || "N/A"}
                    </p>
                  </div>
                ) : (
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">
                      {user.country || "N/A"}
                    </p>
                  </div>
                ) : (
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                {mode === "view" ? (
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                    {user.industry || "N/A"}
                  </p>
                ) : (
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="bg-white border-gray-300 text-gray-900"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Balance</Label>
              {mode === "view" ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900 font-medium">
                    ${user.wallet || 0}
                  </p>
                </div>
              ) : (
                <Input
                  id="wallet"
                  type="number"
                  value={formData.wallet}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet: Number(e.target.value) })
                  }
                  className="bg-white border-gray-300 text-gray-900"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <div>{getStatusBadge(user)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kycStatus">KYC Status</Label>
                {mode === "view" ? (
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                    {user.kycStatus || "UNVERIFIED"}
                  </p>
                ) : (
                  <Select
                    value={formData.kycStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, kycStatus: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select KYC status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {mode === "edit" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isVerified: checked })
                    }
                  />
                  <Label htmlFor="isVerified">Verified User</Label>
                </div>
              )}

              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-900">
                    {new Date(user._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>User ID</Label>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                  {user._id}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-gray-900"
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
