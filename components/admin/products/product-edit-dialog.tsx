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
import { Product } from "@/types/convex";
import { Package, DollarSign, Tag, Calendar, Monitor, HardDrive, Settings, CreditCard, Power, PowerOff } from "lucide-react";

interface ProductEditDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function ProductEditDialog({
  product,
  isOpen,
  onOpenChange,
  mode,
}: ProductEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "",
    price: product?.price || 0,
    isActive: product?.isActive || false,
  });

  const updateProduct = useMutation(api.products.updateProduct);

  const handleSave = async () => {
    if (!product || mode === "view") return;

    setIsLoading(true);
    try {
      await updateProduct({
        productId: product._id,
        updates: {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: formData.price,
          isActive: formData.isActive,
        },
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for icons
  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return <Tag className="h-4 w-4 text-gray-400" />;
    
    const iconMap = {
      software: { icon: Monitor, className: "text-blue-500" },
      hardware: { icon: HardDrive, className: "text-purple-500" },
      services: { icon: Settings, className: "text-green-500" },
      subscription: { icon: CreditCard, className: "text-orange-500" }
    };
    
    const normalizedCategory = category.toLowerCase();
    const config = iconMap[normalizedCategory as keyof typeof iconMap] || { icon: Tag, className: "text-gray-400" };
    const IconComponent = config.icon;
    
    return <IconComponent className={`h-4 w-4 ${config.className}`} />;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <Power className="h-4 w-4 text-green-500" />
    ) : (
      <PowerOff className="h-4 w-4 text-gray-500" />
    );
  };

  const getStatusBadge = (product: Product) => {
    if (product.isActive) {
      return (
        <Badge variant="default" className="bg-green-600 text-white flex items-center gap-1">
          {getStatusIcon(product.isActive)}
          Active
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-darkGray2 text-gray-300 border-grayBorders flex items-center gap-1"
      >
        {getStatusIcon(product.isActive)}
        Inactive
      </Badge>
    );
  };

  const getCategoryBadge = (category: string | undefined) => {
    if (!category)
      return (
        <Badge
          variant="outline"
          className="bg-darkGray2 text-gray-300 border-grayBorders"
        >
          N/A
        </Badge>
      );

    const badgeConfig = {
      SOFTWARE: {
        variant: "default" as const,
        className: "bg-blue-600 text-white",
      },
      HARDWARE: {
        variant: "secondary" as const,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      SERVICES: {
        variant: "outline" as const,
        className: "bg-green-50 text-green-700 border-green-300",
      },
      SUBSCRIPTION: {
        variant: "destructive" as const,
        className: "bg-orange-600 text-white",
      },
    };

    const config = badgeConfig[category as keyof typeof badgeConfig] || {
      variant: "outline" as const,
      className: "bg-darkGray2 text-gray-300 border-grayBorders",
    };

    return (
      <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
        {getCategoryIcon(category)}
        {category}
      </Badge>
    );
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-darkGray border-grayBorders">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === "view" ? "Product Details" : "Edit Product"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-darkGray2/50 border border-grayBorders/30 rounded-xl p-1 h-12">
            <TabsTrigger 
              value="basic" 
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="text-gray-400 text-sm font-medium data-[state=active]:bg-darkGray data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-200 hover:bg-darkGray/30 px-3 py-2"
            >
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Product Name</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders">
                    {product.name}
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
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                {mode === "view" ? (
                  <div>{getCategoryBadge(product.category)}</div>
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(formData.category)}
                        <SelectValue placeholder="Select category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-darkGray border-grayBorders">
                      <SelectItem value="SOFTWARE" className="text-white hover:bg-darkGray2">
                        Software
                      </SelectItem>
                      <SelectItem value="HARDWARE" className="text-white hover:bg-darkGray2">
                        Hardware
                      </SelectItem>
                      <SelectItem value="SERVICES" className="text-white hover:bg-darkGray2">
                        Services
                      </SelectItem>
                      <SelectItem value="SUBSCRIPTION" className="text-white hover:bg-darkGray2">
                        Subscription
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border border-grayBorders min-h-[80px]">
                  {product.description || "No description provided"}
                </p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-darkGray border-grayBorders text-white min-h-[80px]"
                  placeholder="Product description..."
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-gray-300">Price ($)</Label>
              {mode === "view" ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white font-medium">
                    {product.price ? `$${product.price}` : "Free"}
                  </p>
                </div>
              ) : (
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
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
                <div>{getStatusBadge(product)}</div>
              </div>

              {mode === "edit" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive" className="text-gray-300">Active Product</Label>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-gray-300">Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(product._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Product ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border border-grayBorders">
                  {product._id}
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
