"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import DocumentExample from "./document-example";

// Schema for banking info validation
export const bankingInfoSchema = z.object({
  accountNumber: z
    .string()
    .min(5, "Account number must be at least 5 characters"),
  bankName: z.string().min(2, "Bank name is required"),
  routingCode: z.string().min(4, "Routing or Swift code is required"),
});

export type BankingInfoFormData = z.infer<typeof bankingInfoSchema>;

interface BankingInfoFormProps {
  defaultValues?: Partial<BankingInfoFormData>;
  onSubmit: (data: BankingInfoFormData) => void;
  bankFormat: {
    accountFormat: string;
    routingFormat: string;
    name: string;
  };
}

export const BankingInfoForm = ({
  defaultValues = {
    accountNumber: "",
    bankName: "",
    routingCode: "",
  },
  onSubmit,
  bankFormat,
}: BankingInfoFormProps) => {
  const form = useForm<BankingInfoFormData>({
    resolver: zodResolver(bankingInfoSchema),
    defaultValues,
  });

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // Handle file upload to server
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-5 rounded-[8px] border border-white/10 bg-darkGray/50 mb-8">
          <h4 className="font-medium mb-3 text-white">
            Banking Format for {bankFormat.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-gray-300 mb-1">
                Account Number Format:
              </p>
              <p className="text-sm font-mono text-gray-400">
                {bankFormat.accountFormat}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300 mb-1">
                Routing/Swift Code Format:
              </p>
              <p className="text-sm font-mono text-gray-400">
                {bankFormat.routingFormat}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Account Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Account Number (e.g., ${bankFormat.accountFormat})`}
                    {...field}
                    className="bg-transparent placeholder:text-gray-500 border-white/10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Bank Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bank Name"
                    {...field}
                    className="bg-transparent placeholder:text-gray-500 border-white/10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="routingCode"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Routing/Swift Code
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Routing/Swift Code (e.g., ${bankFormat.routingFormat})`}
                    {...field}
                    className="bg-transparent placeholder:text-gray-500 border-white/10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white">
            Tax Documentation (Optional)
          </label>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentExample 
              title="W-9 Example (US)" 
              description="Or equivalent for your country" 
            />
          </div>
          
          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={1}
            acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
          />
          <p className="text-xs text-gray-400 mt-2">
            W-9 for U.S. citizens, TIN for other regions
          </p>
        </div>

        <Button type="submit" className="mt-4">Submit Verification</Button>
      </form>
    </Form>
  );
};

export default BankingInfoForm; 