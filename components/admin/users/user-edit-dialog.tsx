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
          className="bg-yellow-900 text-yellow-300 border-yellow-700"
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
        className: "bg-purple-900 text-purple-300 border-purple-700",
      },
      DESIGNER: {
        variant: "outline" as const,
        className: "bg-pink-900 text-pink-300 border-pink-700",
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

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darkGray border-grayBorders">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {mode === "view" ? "User Details" : "Edit User"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-darkGray2">
            <TabsTrigger value="basic" className="text-gray-300 data-[state=active]:bg-darkGray data-[state=active]:text-white">Basic Info</TabsTrigger>
            <TabsTrigger value="profile" className="text-gray-300 data-[state=active]:bg-darkGray data-[state=active]:text-white">Profile</TabsTrigger>
            <TabsTrigger value="system" className="text-gray-300 data-[state=active]:bg-darkGray data-[state=active]:text-white">System</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                    {user.name || "N/A"}
                  </p>
                ) : (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                ) : (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">User Type</Label>
                {mode === "view" ? (
                  <div>{getUserTypeBadge(user.type)}</div>
                ) : (
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
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
                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
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
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-300">Country</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">
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
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                    {user.industry || "N/A"}
                  </p>
                ) : (
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="bg-darkGray border-grayBorders text-white"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-gray-300">Wallet Balance</Label>
              {mode === "view" ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white font-medium">
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
                  className="bg-darkGray border-grayBorders text-white"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <div>{getStatusBadge(user)}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kycStatus" className="text-gray-300">KYC Status</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                    {user.kycStatus || "UNVERIFIED"}
                  </p>
                ) : (
                  <Select
                    value={formData.kycStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, kycStatus: value })
                    }
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
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
                  <Label htmlFor="isVerified" className="text-gray-300">Verified User</Label>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-300">Account Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(user._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">User ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border">
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
            className="text-white bg-darkGray border-grayBorders hover:bg-darkGray2"
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
