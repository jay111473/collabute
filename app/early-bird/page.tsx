"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { DownloadIcon } from "lucide-react";
import { toPng } from "html-to-image";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["developer", "designer", "startup", "lead", "projectManager"], {
    required_error: "Please select what best describes you",
  }),
  phoneNumber: z.string().optional(),
  countryCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type UserData = FormValues & {
  id?: string;
};

const EarlyBird = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      type: undefined,
      phoneNumber: "",
      countryCode: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/users/early-bird`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          type: values.type,
          ...(values.phoneNumber && { phoneNumber: values.phoneNumber }),
          ...(values.countryCode && { countryCode: values.countryCode }),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - show confirmation message
        setUserData({
          ...values,
          id: result.userId,
        });
        setSubmissionSuccess(true);
        form.reset();
        toast.success("Successfully submitted! Your badge is ready.");
      } else {
        // Handle specific errors
        let errorMessage = "Failed to submit. Please try again.";

        switch (response.status) {
          case 400:
            errorMessage =
              result.message || "Please check your form data and try again.";
            break;
          case 409:
            errorMessage =
              "This email is already registered. Please use a different email.";
            break;
          case 401:
            errorMessage = "Authentication failed. Please try again.";
            break;
          default:
            errorMessage = result.message || "An unexpected error occurred.";
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Format date for the badge
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-black">
      <Toaster />

      {submissionSuccess && userData ? (
        <div className="relative w-full min-h-screen">
          {/* Background image - Mobile (hidden on md and above) */}
          <div className="absolute inset-0 z-0 block md:hidden">
            <Image
              src="/build-now-and-forever-mobile.png"
              alt="Background"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Background image - Desktop (hidden on smaller than md) */}
          <div className="absolute inset-0 z-0 hidden md:block">
            <Image
              src="/background-coming-soon.jpg"
              alt="Background"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Dark overlay for better visibility */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>

          {/* Badge content */}
          <div className="relative z-20 flex flex-col items-center justify-center min-h-screen gap-10">
            {/* Badge */}
            <div
              ref={badgeRef}
              className="w-[384px] h-[384px] rounded-full bg-black overflow-hidden relative p-1"
              style={{
                boxShadow: `0 0 30px rgba(255,255,255,0.15), 0 0 12px #C69DF8`,
              }}
            >
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center px-10 py-10 relative overflow-hidden">
                {/* Inner glow effect */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at center, #C69DF8 0%, transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="z-10 flex flex-col items-center max-w-[85%]">
                  <Image
                    src="/logo.svg"
                    alt="Collabute Logo"
                    width={54}
                    height={54}
                    className="mb-4"
                  />
                  <h3 className="text-xl font-bold text-white mb-1">
                    EARLY BIRD
                  </h3>
                  {userData.id && (
                    <div className="text-sm text-purple-300 mb-2">
                      #{userData.id}
                    </div>
                  )}
                  <div className="w-40 h-[1px] bg-white/30 mb-5"></div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {userData.name}
                  </h2>
                  <div className="text-sm text-gray-400 mt-4">
                    JOINED {formatDate()}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {userData.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="
            flex flex-col items-center justify-center 
            gap-y-10 px-6 sm:px-12 w-full max-w-[500px] py-10 
            text-center rounded-md bg-black/80 
            shadow-[0_0_25px_rgba(255,255,255,0.15),0_0_10px_rgba(255,255,255,0.1),0_0_5px_rgba(187,134,252,0.25)]
            relative
            before:content-[''] before:absolute before:inset-0 
            before:rounded-md before:shadow-[0_0_15px_5px_rgba(187,134,252,0.1)] 
            before:opacity-70 before:blur-[2px]
          "
        >
          <div className="flex flex-col items-center justify-center gap-y-2 relative z-10">
            <Image
              src="/logo.svg"
              alt="Collabute Logo"
              width={66}
              height={66}
            />
            <h1 className="text-3xl font-bold text-white">Collabute</h1>
            <p className="text-sm text-gray-400 mt-3">
              Get exclusive access and benefits by signing up early
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full text-white relative z-10"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start justify-center">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start justify-center">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        {...field}
                        className="text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start justify-center w-full">
                    <FormLabel>What best describes you</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-base md:text-sm">
                          <SelectValue placeholder="Select what best describes you" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="startup">Founder</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="projectManager">
                          Project Manager
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start justify-center">
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        {...field}
                        className="text-base md:text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Join Early Bird Program"}
              </Button>
            </form>
          </Form>

          <p className="text-sm text-gray-500 relative z-10">
            Be the first to access our platform when we launch
          </p>
        </div>
      )}
    </div>
  );
};

export default EarlyBird;
