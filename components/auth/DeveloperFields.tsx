import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import type { CreateAccountFormData, DeveloperRole } from "@/types/auth.types";
import { useEffect } from "react";

const DEVELOPER_ROLES: DeveloperRole[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "QA Engineer",
  "Other",
];

interface DeveloperFieldsProps {
  form: UseFormReturn<CreateAccountFormData>;
}

export const DeveloperFields = ({ form }: DeveloperFieldsProps) => {
  // Remove initialization with default role
  useEffect(() => {
    // Only initialize the structure if missing, but don't set a default value
    if (!form.getValues("developerFields")) {
      form.setValue("developerFields", { primaryRole: null });
    }
  }, [form]);

  return (
    <FormField
      control={form.control}
      name="developerFields.primaryRole"
      render={({ field }) => (
        <FormItem className="col-span-full">
          <FormLabel>Primary Role</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || ""}
            name="primaryRole"
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary role (required)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {DEVELOPER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Select the role that best describes your expertise</p>
        </FormItem>
      )}
    />
  );
}; 