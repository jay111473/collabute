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
              className="flex flex-col items-center justify-between rounded-md border-2 border-background bg-popover py-2 px-4 peer-data-[state=checked]:border-white [&:has([data-state=checked])]:border-white"
            >
              <Code2 className="mb-2 h-6 w-6" />
              <div className="text-center">Developer</div>
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
              className="flex flex-col items-center justify-between rounded-md border-2 border-background bg-popover py-2 px-4 peer-data-[state=checked]:border-white [&:has([data-state=checked])]:border-white"
            >
              <Building className="mb-2 h-6 w-6" />
              <div className="text-center">Startup</div>
            </Label>
          </FormItem>
        </RadioGroup>
      </FormControl>
    </FormItem>
  );
}; 