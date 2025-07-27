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
import { Eye, Edit, Trash2, Plus, Search, Package, DollarSign, Calendar } from "lucide-react";
import { Product } from "@/types/convex";
import { ProductEditDialog } from "./product-edit-dialog";

export function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "" as string,
    isActive: true,
  });
  
  const products = useQuery(api.products.list, {}) as Product[] | undefined;
  const createProduct = useMutation(api.products.create);

  const filteredProducts = products?.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getCategoryBadge = (category?: string) => {
    if (!category) return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">No Category</Badge>;
    
    const categoryColors: Record<string, string> = {
      "software": "bg-blue-100 text-blue-800 border-blue-200",
      "hardware": "bg-green-100 text-green-800 border-green-200",
      "service": "bg-purple-100 text-purple-800 border-purple-200",
      "subscription": "bg-orange-100 text-orange-800 border-orange-200",
      "digital": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "physical": "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    
    const colorClass = categoryColors[category.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-300";
    
    return (
      <Badge variant="outline" className={`text-xs ${colorClass}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "Free";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleCreateProduct = async () => {
    if (!formData.name.trim()) return;
    
    setIsLoading(true);
    try {
      const price = formData.price ? parseFloat(formData.price) : undefined;
      
      await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category.trim() || undefined,
        price: price,
        isActive: formData.isActive,
      });
      
      setIsCreateOpen(false);
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        isActive: true,
      });
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            {filteredProducts?.length || 0} products
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-medium px-6 py-4">Name</TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">Category</TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">Price</TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">Status</TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">Description</TableHead>
              <TableHead className="text-gray-700 font-medium px-4 py-4">Created</TableHead>
              <TableHead className="text-right text-gray-700 font-medium px-6 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {filteredProducts?.map((product) => (
              <TableRow key={product._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">{getCategoryBadge(product.category)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 font-medium text-gray-900">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    {formatPrice(product.price)}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">{getStatusBadge(product.isActive)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {product.description || "No description"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Calendar className="h-3 w-3" />
                    {formatDate(product._creationTime)}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-blue-700 hover:bg-blue-100 transition-colors duration-150"
                      onClick={() => handleViewProduct(product)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-amber-700 hover:bg-amber-100 transition-colors duration-150"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors duration-150">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProducts?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found
        </div>
      )}
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., software, hardware, service"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white border-gray-300 min-h-[80px]"
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
              onClick={handleCreateProduct}
              disabled={!formData.name.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductEditDialog
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}