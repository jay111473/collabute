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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Trash2, Plus, Search, DollarSign, Calendar, CreditCard } from "lucide-react";
import { Transaction } from "@/types/convex";
import { TransactionEditDialog } from "./transaction-edit-dialog";

export function TransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    projectId: "",
    amount: 0,
    type: "payment",
    method: "credit_card",
    status: "pending",
    reference: "",
    description: "",
  });
  
  const transactions = useQuery(api.transactions.list, {}) as Transaction[] | undefined;
  const createTransaction = useMutation(api.transactions.create);

  const filteredTransactions = transactions?.filter((transaction) =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badgeConfig = {
      completed: { variant: "default" as const, className: "bg-green-600 text-white" },
      pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      failed: { variant: "destructive" as const, className: "bg-red-600 text-white" },
      cancelled: { variant: "outline" as const, className: "bg-gray-100 text-gray-300 border-grayBorders" },
    };
    
    const config = badgeConfig[status as keyof typeof badgeConfig] || { variant: "outline" as const, className: "bg-darkGray2 text-gray-300 border-grayBorders" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const badgeConfig = {
      payment: { variant: "default" as const, className: "bg-blue-600 text-white" },
      refund: { variant: "secondary" as const, className: "bg-purple-100 text-purple-800 border-purple-200" },
      withdrawal: { variant: "outline" as const, className: "bg-orange-100 text-orange-800 border-orange-200" },
      deposit: { variant: "default" as const, className: "bg-green-600 text-white" },
    };
    
    const config = badgeConfig[type as keyof typeof badgeConfig] || { variant: "outline" as const, className: "bg-darkGray2 text-gray-300 border-grayBorders" };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleCreateTransaction = async () => {
    if (!formData.userId.trim() || formData.amount <= 0) return;
    
    setIsLoading(true);
    try {
      await createTransaction({
        userId: formData.userId.trim() as any,
        amount: formData.amount,
        type: formData.type,
        method: formData.method,
        status: formData.status,
        reference: formData.reference.trim() || undefined,
        description: formData.description.trim() || undefined,
        projectId: formData.projectId.trim() ? (formData.projectId.trim() as any) : undefined,
      });
      
      setIsCreateOpen(false);
      setFormData({
        userId: "",
        projectId: "",
        amount: 0,
        type: "payment",
        method: "credit_card",
        status: "pending",
        reference: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogMode("view");
    setIsDetailsOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogMode("edit");
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-darkGray border-grayBorders text-white placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <DollarSign className="h-4 w-4" />
            {filteredTransactions?.length || 0} transactions
          </div>
          
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="bg-darkGray border border-grayBorders rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-darkGray2 border-b border-grayBorders">
              <TableHead className="text-gray-300 font-medium px-6 py-4">Amount</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Type</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Method</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Status</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Reference</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">User ID</TableHead>
              <TableHead className="text-gray-300 font-medium px-4 py-4">Date</TableHead>
              <TableHead className="text-right text-gray-300 font-medium px-6 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-darkGray">
            {filteredTransactions?.map((transaction) => (
              <TableRow key={transaction._id} className="border-b border-grayBorders hover:bg-darkGray2 transition-colors duration-150">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div className="font-medium text-white">
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                  {transaction.description && (
                    <div className="text-sm text-gray-400 truncate max-w-xs mt-1">
                      {transaction.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-4">{getTypeBadge(transaction.type)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-300 capitalize">{transaction.method}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">{getStatusBadge(transaction.status)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300 font-mono">
                    {transaction.reference || "N/A"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="text-sm text-gray-300">
                    {transaction.userId}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Calendar className="h-3 w-3" />
                    {formatDate(transaction._creationTime)}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-blue-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-amber-400 hover:bg-darkGray2 transition-colors duration-150"
                      onClick={() => handleEditTransaction(transaction)}
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

      {filteredTransactions?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No transactions found
        </div>
      )}
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID (Optional)</Label>
              <Input
                id="projectId"
                placeholder="Enter project ID"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-darkGray border-grayBorders text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Transaction reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="bg-darkGray border-grayBorders text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Transaction description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-darkGray border-grayBorders min-h-[80px]"
              />
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
              onClick={handleCreateTransaction}
              disabled={!formData.userId.trim() || formData.amount <= 0 || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransactionEditDialog
        transaction={selectedTransaction}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        mode={dialogMode}
      />
    </div>
  );
}