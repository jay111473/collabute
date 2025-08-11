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

const PROJECT_MANAGER_SKILLS: DeveloperRole[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "QA Engineer",
  "Systems Engineer",
  "Other",
];

interface DeveloperFieldsProps {
  form: UseFormReturn<CreateAccountFormData>;
  isProjectManager?: boolean;
}

export const DeveloperFields = ({
  form,
  isProjectManager = false,
}: DeveloperFieldsProps) => {
  // Initialize the structure if missing
  useEffect(() => {
    if (!form.getValues("developerFields")) {
      form.setValue("developerFields", { primaryRole: [] });
    }
  }, [form]);

  const roles = isProjectManager ? PROJECT_MANAGER_SKILLS : DEVELOPER_ROLES;
  const roleOptions: MultiSelectOption[] = roles.map((role) => ({
    label: role,
    value: role,
  }));

  return (
    <FormField
      control={form.control}
      name="developerFields.primaryRole"
      render={({ field }) => (
        <FormItem className="col-span-full">
          <FormLabel className="text-sm font-medium">
            {isProjectManager ? "Technical Skills" : "Primary Roles"}
          </FormLabel>
          <FormControl>
            <MultiSelect
              options={roleOptions}
              selected={field.value || []}
              onChange={field.onChange}
              placeholder={
                isProjectManager
                  ? "Select your technical skills (at least one required)"
                  : "Select your primary roles (at least one required)"
              }
              className="bg-transparent border-grayBorders"
            />
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground mt-1">
            {isProjectManager
              ? "Select technical areas you can manage and understand. This helps us match you with suitable projects."
              : "Select all roles that describe your expertise. You can choose multiple options."}
          </p>
        </FormItem>
      )}
    />
  );
};
