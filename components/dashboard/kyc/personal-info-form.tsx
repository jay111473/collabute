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

// Schema for personal info validation
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
  defaultValues?: Partial<PersonalInfoFormData>;
  onSubmit: (data: PersonalInfoFormData) => void;
  isStartup?: boolean;
}

export const PersonalInfoForm = ({
  defaultValues = { fullName: "" },
  onSubmit,
  isStartup = false,
}: PersonalInfoFormProps) => {
  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
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
            name="fullName"
            render={({ field }) => (
              <FormItem className="mb-8">
                <FormLabel className="block text-sm font-medium mb-2 text-white">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full legal name"
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
            Government-Issued ID (Passport, driver&apos;s license, or national ID)
          </label>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentExample 
              title="Passport Example" 
              description="Front side" 
            />
            <DocumentExample 
              title="Driver&apos;s License Example" 
              description="Both sides needed" 
            />
            <DocumentExample 
              title="ID Card Example" 
              description="Both sides needed" 
            />
          </div>

          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={2}
            acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
          />
          <p className="text-xs text-gray-400 mt-2">
            Please upload front and back images of your ID. Make sure all text is clearly visible.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white">
            Proof of Address (Utility bill, bank statement, lease agreement)
          </label>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocumentExample 
              title="Utility Bill Example" 
              description="Must be recent (3 months)" 
            />
            <DocumentExample 
              title="Bank Statement Example" 
              description="Must show your address" 
            />
          </div>

          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={1}
            acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf"]}
          />
          <p className="text-xs text-gray-400 mt-2">
            Document must be issued within the last 3 months and clearly show your name and address
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 text-white">
            Selfie Verification
          </label>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocumentExample 
              title="Selfie with ID Example" 
              description="Hold your ID next to your face" 
            />
          </div>

          <FileUpload
            onFilesSelected={handleFileUpload}
            maxFiles={1}
            acceptedTypes={[".jpg", ".jpeg", ".png"]}
          />
          <p className="text-xs text-gray-400 mt-2">
            Please upload a clear selfie holding your ID next to your face. Ensure your face and ID are clearly visible.
          </p>
        </div>

        <Button type="submit" className="mt-4">
          {isStartup ? "Continue to Business Verification" : "Continue to Banking Information"}
        </Button>
      </form>
    </Form>
  );
};

export default PersonalInfoForm; 