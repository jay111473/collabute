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

// Schema for business info validation
export const businessInfoSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  taxId: z.string().min(1, "Tax ID is required"),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface BusinessInfoFormProps {
  defaultValues?: Partial<BusinessInfoFormData>;
  onSubmit: (data: BusinessInfoFormData) => void;
}

export const BusinessInfoForm = ({
  defaultValues = {
    companyName: "",
    registrationNumber: "",
    taxId: "",
  },
  onSubmit,
}: BusinessInfoFormProps) => {
  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues,
  });

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // Handle file upload to server
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Company Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your registered company name"
                    {...field}
                    className="bg-transparent placeholder:text-gray-500 border-white/10"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Registration Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter company registration or incorporation number"
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
            Business License/Certificate of Incorporation
          </label>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentExample 
              title="Certificate Example" 
              description="Must be official document" 
            />
          </div>
          
          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={1}
            acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="taxId"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Tax Identification Number (TIN)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your company's tax ID"
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
            Proof of Business Address
          </label>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentExample 
              title="Business Address Example" 
              description="Must show company name and address" 
            />
          </div>
          
          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={1}
            acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
          />
          <p className="text-xs text-gray-400 mt-2">
            Utility bill or bank statement under company&apos;s name
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white">
            Authorized Signatory Document
          </label>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentExample 
              title="Signatory Document Example" 
              description="Board resolution or power of attorney" 
            />
          </div>
          
          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={1}
            acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
          />
          <p className="text-xs text-gray-400 mt-2">
            Board resolution or power of attorney
          </p>
        </div>

        <Button type="submit" className="mt-4">Submit Verification</Button>
      </form>
    </Form>
  );
};

export default BusinessInfoForm; 