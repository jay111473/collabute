"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction } from "@/types/convex";
import { Calendar, DollarSign, CreditCard, Users, Receipt, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface TransactionEditDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
}

export function TransactionEditDialog({ transaction, isOpen, onOpenChange, mode }: TransactionEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: transaction?.amount || 0,
    type: transaction?.type || "",
    method: transaction?.method || "",
    status: transaction?.status || "PENDING",
    reference: transaction?.reference || "",
    description: transaction?.description || "",
  });

  const updateTransaction = useMutation(api.transactions.update);

  // Update form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount || 0,
        type: transaction.type || "",
        method: transaction.method || "",
        status: transaction.status || "PENDING",
        reference: transaction.reference || "",
        description: transaction.description || "",
      });
    }
  }, [transaction]);

  const handleSave = async () => {
    if (!transaction || mode === "view") return;
    
    setIsLoading(true);
    try {
      console.log("Updating transaction with data:", {
        id: transaction._id,
        updates: formData,
      });

      await updateTransaction({
        id: transaction._id,
        ...formData,
      });
      
      toast.success("Transaction updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      
      let errorMessage = "Failed to update transaction";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline" className="bg-darkGray2 text-gray-300 border-grayBorders">N/A</Badge>;
    
    const badgeConfig = {
      PENDING: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      COMPLETED: { variant: "default" as const, className: "bg-green-600 text-white" },
      FAILED: { variant: "destructive" as const, className: "bg-red-600 text-white" },
      CANCELLED: { variant: "outline" as const, className: "bg-gray-100 text-gray-300 border-grayBorders" },
      REFUNDED: { variant: "outline" as const, className: "bg-purple-100 text-purple-700 border-purple-300" },
    };
    
    const config = badgeConfig[status as keyof typeof badgeConfig] || { variant: "outline" as const, className: "bg-darkGray2 text-gray-300 border-grayBorders" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string | undefined) => {
    if (!type) return <Badge variant="outline" className="bg-darkGray2 text-gray-300 border-grayBorders">N/A</Badge>;
    
    const badgeConfig = {
      PAYMENT: { variant: "default" as const, className: "bg-blue-600 text-white" },
      REFUND: { variant: "outline" as const, className: "bg-purple-100 text-purple-700 border-purple-300" },
      DEPOSIT: { variant: "default" as const, className: "bg-green-600 text-white" },
      WITHDRAWAL: { variant: "destructive" as const, className: "bg-red-600 text-white" },
      TRANSFER: { variant: "secondary" as const, className: "bg-orange-100 text-orange-800 border-orange-200" },
    };
    
    const config = badgeConfig[type as keyof typeof badgeConfig] || { variant: "outline" as const, className: "bg-darkGray2 text-gray-300 border-grayBorders" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {type}
      </Badge>
    );
  };

  const getMethodBadge = (method: string | undefined) => {
    if (!method) return <Badge variant="outline" className="bg-darkGray2 text-gray-300 border-grayBorders">N/A</Badge>;
    
    const badgeConfig = {
      CREDIT_CARD: { variant: "default" as const, className: "bg-blue-600 text-white" },
      DEBIT_CARD: { variant: "secondary" as const, className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      BANK_TRANSFER: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-300" },
      PAYPAL: { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-300" },
      STRIPE: { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-300" },
      WALLET: { variant: "secondary" as const, className: "bg-gray-100 text-gray-300 border-grayBorders" },
    };
    
    const config = badgeConfig[method as keyof typeof badgeConfig] || { variant: "outline" as const, className: "bg-darkGray2 text-gray-300 border-grayBorders" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {mode === "view" ? "Transaction Details" : "Edit Transaction"}
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
                <Label htmlFor="amount">Amount</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <p className="text-lg font-semibold text-white">${transaction.amount}</p>
                  </div>
                ) : (
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="bg-darkGray border-grayBorders text-white"
                    placeholder="0.00"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {mode === "view" ? (
                  <div>{getStatusBadge(transaction.status)}</div>
                ) : (
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                {mode === "view" ? (
                  <div>{getTypeBadge(transaction.type)}</div>
                ) : (
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="REFUND">Refund</SelectItem>
                      <SelectItem value="DEPOSIT">Deposit</SelectItem>
                      <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                {mode === "view" ? (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <div>{getMethodBadge(transaction.method)}</div>
                  </div>
                ) : (
                  <Select 
                    value={formData.method} 
                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                      <SelectItem value="WALLET">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {mode === "view" ? (
                <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border min-h-[60px]">
                  {transaction.description || "N/A"}
                </p>
              ) : (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-darkGray border-grayBorders text-white min-h-[60px]"
                  placeholder="Transaction description..."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                {mode === "view" ? (
                  <p className="text-sm text-white bg-darkGray2 px-3 py-2 rounded-md border font-mono">
                    {transaction.reference || "N/A"}
                  </p>
                ) : (
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="bg-darkGray border-grayBorders text-white font-mono"
                    placeholder="REF-12345"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Transaction Summary</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Amount:</span>
                    <span className="text-lg font-semibold text-white">${transaction.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Type:</span>
                    <div>{getTypeBadge(transaction.type)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Method:</span>
                    <div>{getMethodBadge(transaction.method)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Status:</span>
                    <div>{getStatusBadge(transaction.status)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>User Information</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">{transaction.userId}</p>
                </div>
              </div>

              {transaction.projectId && (
                <div className="space-y-2">
                  <Label>Associated Project</Label>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">{transaction.projectId}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Transaction Status</Label>
                <div>{getStatusBadge(transaction.status)}</div>
              </div>

              <div className="space-y-2">
                <Label>User</Label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">{transaction.userId}</p>
                </div>
              </div>

              {transaction.projectId && (
                <div className="space-y-2">
                  <Label>Project</Label>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-white">{transaction.projectId}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Created</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-white">
                    {new Date(transaction._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <p className="text-xs text-gray-400 font-mono bg-darkGray2 px-2 py-1 rounded border">
                  {transaction._id}
                </p>
              </div>

              <div className="space-y-2">
                <Label>System Information</Label>
                <div className="bg-darkGray2 p-4 rounded-md border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Created At:</span>
                    <span className="text-white">{new Date(transaction._creationTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white">{transaction.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{transaction.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Method:</span>
                    <span className="text-white">{transaction.method}</span>
                  </div>
                  {transaction.reference && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Reference:</span>
                      <span className="text-white font-mono">{transaction.reference}</span>
                    </div>
                  )}
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