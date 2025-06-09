import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import type { CreateAccountFormData, TeamSize } from "@/types/auth.types";
import { useEffect } from "react";

const TEAM_SIZES: { label: string; value: TeamSize }[] = [
  { label: "1-10", value: "1-10" },
  { label: "10-50", value: "10-50" },
  { label: "50-100", value: "50-100" },
  { label: "100+", value: "100+" },
];

interface StartupFieldsProps {
  form: UseFormReturn<CreateAccountFormData>;
  errors?: { [key: string]: string | undefined };
}

export const StartupFields = ({ form, errors }: StartupFieldsProps) => {
  // When this component mounts, ensure startup fields are initialized
  useEffect(() => {
    if (!form.getValues("startupFields")) {
      form.setValue("startupFields", { companyName: "", teamSize: null });
    }
  }, [form]);

  return (
    <>
      <FormField
        control={form.control}
        name="startupFields.companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your company name"
                {...field}
                className={`bg-transparent placeholder:bg-transparent ${
                  errors?.["startupFields.companyName"] ? "border-red-500" : "border-grayBorders"
                }`}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </FormControl>
            {errors?.["startupFields.companyName"] ? (
              <div className="text-red-500 text-xs mt-1">
                {errors["startupFields.companyName"]}
              </div>
            ) : (
              <FormMessage />
            )}
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="startupFields.teamSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Company Size <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TEAM_SIZES.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center justify-center px-2 py-3 text-xs rounded-md border cursor-pointer transition-colors",
                      field.value === option.value
                        ? "border-darkPrimary border-2 bg-darkPrimary/10 font-bold"
                        : "border-grayBorders bg-popover hover:bg-muted/50",
                      errors?.["startupFields.teamSize"] && "border-red-500"
                    )}
                    onClick={() => {
                      field.onChange(option.value);
                      // Add a hidden input with the team size value for FormData
                      const hiddenInput = document.createElement('input');
                      hiddenInput.type = 'hidden';
                      hiddenInput.name = 'teamSize';
                      hiddenInput.value = option.value;
                      
                      // Remove any existing hidden inputs with the same name
                      document.querySelectorAll('input[name="teamSize"]').forEach(el => el.remove());
                      
                      // Add the new hidden input to the form
                      document.querySelector('form')?.appendChild(hiddenInput);
                    }}
                    data-value={option.value}
                    role="button"
                    aria-pressed={field.value === option.value}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </FormControl>
            {errors?.["startupFields.teamSize"] ? (
              <div className="text-red-500 text-xs mt-1">
                {errors["startupFields.teamSize"]}
              </div>
            ) : (
              <FormMessage />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Select the size that best describes your team.
            </p>
          </FormItem>
        )}
      />
    </>
  );
}; 