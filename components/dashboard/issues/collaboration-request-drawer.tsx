"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import {
  Users,
  Percent,
  FileText,
  ChevronLeft,
  X,
  CircleDot,
  Clock,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Issue } from "@/types/convex";

const collaborationRequestSchema = z.object({
  percentageShare: z
    .number()
    .min(1, "Percentage share must be at least 1%")
    .max(100, "Percentage share cannot exceed 100%"),
  taskDefinition: z
    .string()
    .min(20, "Task definition must be at least 20 characters")
    .max(1000, "Task definition cannot exceed 1000 characters"),
});

interface CollaborationRequestDrawerProps {
  issue: Issue;
  onRequest: (data: {
    percentageShare: number;
    taskDefinition: string;
  }) => void;
}

export function CollaborationRequestDrawer({
  issue,
  onRequest,
}: CollaborationRequestDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof collaborationRequestSchema>>({
    resolver: zodResolver(collaborationRequestSchema),
    defaultValues: {
      percentageShare: 25,
      taskDefinition: "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof collaborationRequestSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await onRequest(values);
      setIsOpen(false);
      form.reset();
      toast.success("Collaboration request submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit collaboration request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          className="text-white border-white/20 hover:bg-white/10"
        >
          <Users className="h-4 w-4 mr-2" />
          Ask for Collaboration
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full px-4 flex flex-col gap-4 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-1">
              <button className="p-2 hover:bg-white">
                <ChevronLeft size={20} color="black" />
              </button>
              <h3 className="text-lg font-medium">
                Request Issue Collaboration
              </h3>
            </div>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-white">
                <X size={20} color="black" />
              </button>
            </DrawerClose>
          </div>

          {/* Issue Details Card */}
          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <div className="flex justify-start items-center gap-3 text-sm">
              <CircleDot size={24} className="text-darkPrimary" />
              <p className="text-lg font-medium">{issue.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                icon={<Clock className="h-4 w-4 text-darkPrimary" />}
                className="font-medium text-xs"
                variant="outline"
              >
                {format(new Date(issue._creationTime), "MMM dd, yyyy")}
              </Badge>
              <Badge
                icon={<DollarSign className="text-darkPrimary" size={14} />}
                className="font-medium text-xs"
                variant="outline"
              >
                ${issue.budget}
              </Badge>
            </div>

            <div className="text-sm text-gray-600 line-clamp-3">
              {issue.description}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="percentageShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Percentage Share (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskDefinition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Task Definition
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="As a project collaborator, describe the specific tasks and responsibilities you want to take on for this particular issue..."
                        rows={6}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <DrawerClose asChild>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
