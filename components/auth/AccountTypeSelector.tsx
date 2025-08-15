import { Building, Code2, Shapes, UserIcon, Users } from "lucide-react";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import type { CreateAccountFormData } from "@/types/auth.types";
import { useEffect } from "react";

interface AccountTypeSelectorProps {
  form: UseFormReturn<CreateAccountFormData>;
  invitationData?: {
    token?: string;
    type?: string;
    email?: string;
  } | null;
}

export const AccountTypeSelector = ({
  form,
  invitationData,
}: AccountTypeSelectorProps) => {
  // Initialize fields based on the current form type when component mounts
  useEffect(() => {
    const currentType = form.getValues("type");
    if (currentType === "developer" || currentType === "project_manager") {
      if (!form.getValues("developerFields")) {
        form.setValue("developerFields", { primaryRole: [] });
      }
    } else if (currentType === "startup") {
      if (!form.getValues("startupFields")) {
        form.setValue("startupFields", { companyName: "", teamSize: null });
      }
    }
  }, [form]);

  const handleAccountTypeChange = (value: string) => {
    form.setValue(
      "type",
      value as "developer" | "startup" | "project_manager" | "designer"
    );
    // Ensure the appropriate fields structure is initialized
    if (value === "startup") {
      // Initialize startup fields if they don't exist
      if (!form.getValues("startupFields")) {
        form.setValue("startupFields", { companyName: "", teamSize: null });
      }
      // Reset developer fields
      form.setValue("developerFields", undefined);
    } else if (value === "developer" || value === "project_manager") {
      // Initialize developer fields if they don't exist
      if (!form.getValues("developerFields")) {
        form.setValue("developerFields", { primaryRole: [] });
      }
      // Reset startup fields
      form.setValue("startupFields", undefined);
    }
  };

  const isProjectManagerInvite = invitationData?.type === "PROJECT_MANAGER";
  const gridCols = isProjectManagerInvite
    ? "grid-cols-1"
    : "md:grid-cols-4 grid-cols-2";

  return (
    <FormItem className="col-span-full">
      <FormLabel>Account Type</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={handleAccountTypeChange}
          defaultValue={form.getValues("type") || "developer"}
          className={`grid ${gridCols} gap-4`}
        >
          {isProjectManagerInvite ? (
            <FormItem>
              <FormControl>
                <RadioGroupItem
                  value="project_manager"
                  className="peer sr-only"
                  id="project_manager"
                />
              </FormControl>
              <Label
                htmlFor="project_manager"
                className="flex items-center justify-center gap-2 rounded-md border-2 border-darkPrimary bg-purple/10 py-4 px-4 font-bold"
              >
                <Users className="h-4 w-4" />
                <div className="text-center text-sm">Project Manager</div>
              </Label>
            </FormItem>
          ) : (
            <>
              <FormItem>
                <FormControl>
                  <RadioGroupItem
                    value="developer"
                    className="peer sr-only"
                    id="developer"
                  />
                </FormControl>
                <Label
                  htmlFor="developer"
                  className="flex items-center justify-center gap-2 rounded-md border-2 border-grayBorders bg-popover py-4 px-4 peer-data-[state=checked]:border-darkPrimary peer-data-[state=checked]:bg-purple/10 peer-data-[state=checked]:font-bold [&:has([data-state=checked])]:border-darkPrimary [&:has([data-state=checked])]:bg-purple/10 [&:has([data-state=checked])]:font-bold"
                >
                  <Code2 className="h-4 w-4" />
                  <div className="text-center text-sm">Developer</div>
                </Label>
              </FormItem>
              <FormItem>
                <FormControl>
                  <RadioGroupItem
                    value="startup"
                    className="peer sr-only"
                    id="startup"
                  />
                </FormControl>
                <Label
                  htmlFor="startup"
                  className="flex items-center justify-center gap-2 rounded-md border-2 border-grayBorders bg-popover py-4 px-4 peer-data-[state=checked]:border-darkPrimary peer-data-[state=checked]:bg-purple/10 peer-data-[state=checked]:font-bold [&:has([data-state=checked])]:border-darkPrimary [&:has([data-state=checked])]:bg-purple/10 [&:has([data-state=checked])]:font-bold"
                >
                  <Building className="h-4 w-4" />
                  <div className="text-center text-sm">Founder</div>
                </Label>
              </FormItem>
              <FormItem>
                <FormControl>
                  <RadioGroupItem
                    value="project_manager"
                    className="peer sr-only"
                    id="project_manager"
                  />
                </FormControl>
                <Label
                  htmlFor="project_manager"
                  className="flex items-center justify-center gap-2 rounded-md border-2 border-grayBorders bg-popover py-4 px-4 peer-data-[state=checked]:border-darkPrimary peer-data-[state=checked]:bg-purple/10 peer-data-[state=checked]:font-bold [&:has([data-state=checked])]:border-darkPrimary [&:has([data-state=checked])]:bg-purple/10 [&:has([data-state=checked])]:font-bold"
                >
                  <UserIcon className="h-4 w-4" />
                  <div className="text-center text-sm">Eng Lead</div>
                </Label>
              </FormItem>
              <FormItem>
                <FormControl>
                  <RadioGroupItem
                    value="designer"
                    className="peer sr-only"
                    id="designer"
                  />
                </FormControl>
                <Label
                  htmlFor="designer"
                  className="flex items-center justify-center gap-2 rounded-md border-2 border-grayBorders bg-popover py-4 px-4 peer-data-[state=checked]:border-darkPrimary peer-data-[state=checked]:bg-purple/10 peer-data-[state=checked]:font-bold [&:has([data-state=checked])]:border-darkPrimary [&:has([data-state=checked])]:bg-purple/10 [&:has([data-state=checked])]:font-bold"
                >
                  <Shapes className="h-4 w-4" />
                  <div className="text-center text-sm">Designer</div>
                </Label>
              </FormItem>
            </>
          )}
        </RadioGroup>
      </FormControl>
    </FormItem>
  );
};
