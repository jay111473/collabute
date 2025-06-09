import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { CreateAccountFormData, DeveloperRole } from "@/types/auth.types";
import { useEffect } from "react";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";

const DEVELOPER_ROLES: DeveloperRole[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "QA Engineer",
  "Game Developer",
  "Embedded Developer",
  "Scientific Computing",
  "Systems Engineer",
  "Data Engineer",
  "Other",
];

const ROLE_OPTIONS: MultiSelectOption[] = DEVELOPER_ROLES.map((role) => ({
  label: role,
  value: role,
}));

interface DeveloperFieldsProps {
  form: UseFormReturn<CreateAccountFormData>;
  errors?: { [key: string]: string | undefined };
}

export const DeveloperFields = ({ form, errors }: DeveloperFieldsProps) => {
  // Initialize the structure if missing
  useEffect(() => {
    if (!form.getValues("developerFields")) {
      form.setValue("developerFields", { primaryRole: [] });
    }
  }, [form]);

  return (
    <FormField
      control={form.control}
      name="developerFields.primaryRole"
      render={({ field }) => (
        <FormItem className="col-span-full">
          <FormLabel className="text-sm font-medium">Primary Roles</FormLabel>
          <FormControl>
            <MultiSelect
              options={ROLE_OPTIONS}
              selected={field.value || []}
              onChange={field.onChange}
              placeholder="Select your primary roles (at least one required)"
              className={`bg-transparent ${
                errors?.["developerFields.primaryRole"]
                  ? "border-red-500"
                  : "border-grayBorders"
              }`}
            />
          </FormControl>
          {errors?.["developerFields.primaryRole"] ? (
            <div className="text-red-500 text-xs mt-1">
              {errors["developerFields.primaryRole"]}
            </div>
          ) : (
            <FormMessage />
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Select all roles that describe your expertise. You can choose
            multiple options.
          </p>
        </FormItem>
      )}
    />
  );
};
