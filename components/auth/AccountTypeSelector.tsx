import { Building, Code2 } from "lucide-react";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import type { CreateAccountFormData } from "@/types/auth.types";

interface AccountTypeSelectorProps {
  form: UseFormReturn<CreateAccountFormData>;
}

export const AccountTypeSelector = ({ form }: AccountTypeSelectorProps) => {
  return (
    <FormItem className="col-span-full">
      <FormLabel>Account Type</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={(value) => form.setValue("type", value as "developer" | "startup")}
          defaultValue={form.getValues("type")}
          className="grid grid-cols-2 gap-4"
        >
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
        </RadioGroup>
      </FormControl>
    </FormItem>
  );
}; 