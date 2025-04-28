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
}

export const StartupFields = ({ form }: StartupFieldsProps) => {
  // When this component mounts, ensure startup fields are initialized
  useEffect(() => {
    console.log("StartupFields mounted");
    if (!form.getValues("startupFields")) {
      console.log("Initializing startup fields in StartupFields component");
      form.setValue("startupFields", { companyName: "", teamSize: null });
    } else {
      console.log("Existing startup fields:", form.getValues("startupFields"));
    }
  }, [form]);

  return (
    <>
      <FormField
        control={form.control}
        name="startupFields.companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your company name"
                {...field}
                className="bg-transparent placeholder:bg-transparent border-grayBorders"
                value={field.value ?? ""}
                onChange={(e) => {
                  console.log("Company name changed:", e.target.value);
                  field.onChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="startupFields.teamSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Size</FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TEAM_SIZES.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center justify-center px-2 py-3 text-xs rounded-md border cursor-pointer",
                      field.value === option.value
                        ? "border-darkPrimary border-2 bg-darkPrimary/10 font-bold"
                        : "border-grayBorders bg-popover"
                    )}
                    onClick={() => {
                      console.log("Team size selected:", option.value);
                      field.onChange(option.value);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}; 