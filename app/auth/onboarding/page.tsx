"use client";

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CreateAccount from "@/components/auth/components/create-account";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { login } from "@/lib/login";
import axios from "axios";
import { getCookie } from "cookies-next";
import {
  Laptop,
  Code,
  Github,
  Users,
  Target,
  Briefcase,
  DollarSign,
} from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";


// Create a context for onboarding data
type OnboardingContextType = {
  userType: "developer" | "startup" | null;
  setUserType: React.Dispatch<
    React.SetStateAction<"developer" | "startup" | null>
  >;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
};

const OnboardingContext = createContext<OnboardingContextType>({
  userType: null,
  setUserType: () => {},
  userId: null,
  setUserId: () => {},
});

// Hook to use the onboarding context
const useOnboardingContext = () => useContext(OnboardingContext);

// Step indicator component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index < currentStep
              ? "bg-accent w-8"
              : index === currentStep
              ? "bg-accent/50 w-8"
              : "bg-[#141414] w-8"
          )}
        />
      ))}
    </div>
  );
};

// Welcome step content
const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <>
    {/* Logo */}
    <div className="relative w-24 h-24 mb-2">
      <Image
        src="/logo.svg"
        alt="Collabute Logo"
        fill
        className="rounded-md"
        priority
      />
    </div>

    {/* Welcome Text */}
    <h1 className="text-5xl font-bold text-center w-full break-words">
      Welcome to Collabute
    </h1>

    {/* Description */}
    <div className="text-center text-zinc-400 space-y-2 w-full">
      <p className="text-sm">
        Collabute is an AI driven solution for startups to build and launch
        products faster and <br /> it helps developers to find their next
        opportunity.
      </p>
    </div>

    {/* Get Started Button */}
    <Button
      variant="primary"
      size="lg"
      className="w-[200px] mt-8"
      onClick={onNext}
    >
      Get started
    </Button>
  </>
);

// Account setup step content
const AccountSetupStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUserType, setUserId } = useOnboardingContext();
  const router = useRouter();

  // Add event listener for form error
  useEffect(() => {
    const formElement = formRef.current;

    const handleFormError = () => {
      setIsSubmitting(false);
    };

    if (formElement) {
      formElement.addEventListener("form:error", handleFormError);
    }

    return () => {
      if (formElement) {
        formElement.removeEventListener("form:error", handleFormError);
      }
    };
  }, [formRef]);

  const handleContinue = () => {
    // Set loading state
    setIsSubmitting(true);

    // Submit the form programmatically
    if (formRef.current) {
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      formRef.current.dispatchEvent(submitEvent);

      // If the form submission fails, we need to reset the loading state
      // This timeout is a fallback in case the onSuccessfulSubmit is never called
      setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleFormSuccess = async (
    accountType: "developer" | "startup",
    userId: string,
    email: string,
    password: string
  ) => {
    setUserType(accountType);
    setUserId(userId);
    
    // Login the user after successful account creation
    // Pass skipRedirect: true to prevent redirection to dashboard
    try {
      await login({ email, password }, router, { skipRedirect: true });
    } catch (error) {
      console.error("Login error:", error);
      // Continue with onboarding even if login fails
    }
    
    setIsSubmitting(false);
    onNext();
  };

  return (
    <>
      <Toaster />
      {/* Logo */}
      <div className="relative w-16 h-16 mb-2">
        <Image
          src="/logo.svg"
          alt="Collabute Logo"
          fill
          className="rounded-md"
          priority
        />
      </div>

      {/* Step Title */}
      <h1 className="text-3xl font-bold text-center w-full break-words">
        Set up your account
      </h1>

      {/* Description */}
      <div className="text-center text-zinc-400 space-y-2 w-full">
        <p className="text-sm">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {/* Form would go here */}
      <div className="w-full flex justify-center items-center mt-6">
        <CreateAccount
          formRef={formRef}
          onSuccessfulSubmit={handleFormSuccess}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </>
  );
};

// Developer Preferences Schema
const developerPreferencesSchema = z.object({
  experienceLevel: z.enum(
    ["junior", "mid_level", "senior", "lead", "architect"],
    {
      required_error: "Please select your experience level",
    }
  ),
  interests: z.array(z.string()).min(1, {
    message: "Please select at least one interest",
  }),
  skills: z.array(z.string()).min(1, {
    message: "Please add at least one skill",
  }),
  availability: z.enum(
    ["full_time", "part_time", "contract", "freelance", "not_available"],
    {
      required_error: "Please select your availability",
    }
  ),
  preferredWorkType: z.enum(["remote", "on_site", "hybrid"], {
    required_error: "Please select your preferred work type",
  }),
});

// Startup Preferences Schema
const startupPreferencesSchema = z.object({
  productStage: z.enum(
    ["Idea", "Prototype", "MVP", "Beta", "Launched", "Growth"],
    {
      required_error: "Please select your product stage",
    }
  ),
  teamSize: z.enum(["1-10", "10-50", "50-100", "+100"], {
    required_error: "Please select your team size",
  }),
  fundingStage: z.enum(
    ["Pre-seed", "Seed", "Series A", "Series B", "Series C+"],
    {
      required_error: "Please select your funding stage",
    }
  ),
});

// tech interests array for developers
const TECH_INTERESTS = [
  { id: "frontend", label: "Frontend Development" },
  { id: "backend", label: "Backend Development" },
  { id: "mobile", label: "Mobile Development" },
  { id: "ai", label: "AI/Machine Learning" },
  { id: "devops", label: "DevOps" },
  { id: "blockchain", label: "Blockchain" },
  { id: "data", label: "Data Science" },
  { id: "design", label: "UI/UX Design" },
];

// Function to update user preferences on the backend
const updateUserPreferences = async (userId: string, data: any) => {
  try {
    const token = getCookie("token") as string;
    
    if (!token) {
      throw new Error("Authentication token not found");
    }
    
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

// Preferences step content
const PreferencesStep = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const { userType, userId } = useOnboardingContext();

  // Developer form
  const developerForm = useForm<z.infer<typeof developerPreferencesSchema>>({
    resolver: zodResolver(developerPreferencesSchema),
    defaultValues: {
      interests: [],
      skills: [],
    },
  });

  // Startup form
  const startupForm = useForm<z.infer<typeof startupPreferencesSchema>>({
    resolver: zodResolver(startupPreferencesSchema),
  });

  const handleDeveloperSubmit = async (
    data: z.infer<typeof developerPreferencesSchema>
  ) => {
    if (!userId) {
      toast.error("User ID not found. Please try again.");
      return;
    }

    try {
      // Prepare the data for the API request
      const preferencesData = {
        developer: {
          experienceLevel: data.experienceLevel,
          interests: data.interests,
          skills: data.skills,
          availability: data.availability,
          preferredWorkType: data.preferredWorkType,
        },
      };

      // Update user preferences on the backend
      await updateUserPreferences(userId, preferencesData);
      toast.success("Preferences saved successfully!");
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  const handleStartupSubmit = async (
    data: z.infer<typeof startupPreferencesSchema>
  ) => {
    if (!userId) {
      toast.error("User ID not found. Please try again.");
      return;
    }

    try {
      // Prepare the data for the API request
      const preferencesData = {
        startup: {
          productStage: data.productStage,
          teamSize: data.teamSize,
          fundingStage: data.fundingStage,
        },
      };

      // Update user preferences on the backend
      await updateUserPreferences(userId, preferencesData);
      toast.success("Preferences saved successfully!");
      
      // Move to next step
      onNext();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="relative w-16 h-16 mb-2">
        <Image
          src="/logo.svg"
          alt="Collabute Logo"
          fill
          className="rounded-md"
          priority
        />
      </div>

      {/* Step Title */}
      <h1 className="text-3xl font-bold text-center w-full break-words">
        Your preferences
      </h1>

      {/* Description */}
      <div className="text-center text-zinc-400 space-y-2 w-full">
        <p className="text-sm">Help us understand your interests and goals.</p>
      </div>

      {/* Preferences Form */}
      <div className="w-full max-w-3xl mt-6 space-y-8">
        {userType === "developer" ? (
          <Form {...developerForm}>
            <form
              onSubmit={developerForm.handleSubmit(handleDeveloperSubmit)}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Level */}
                <FormField
                  control={developerForm.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Code className="h-4 w-4" />
                        Experience Level
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 ">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="junior">
                            Junior (0-2 years)
                          </SelectItem>
                          <SelectItem value="mid_level">
                            Mid-level (3-5 years)
                          </SelectItem>
                          <SelectItem value="senior">
                            Senior (5+ years)
                          </SelectItem>
                          <SelectItem value="lead">Tech Lead</SelectItem>
                          <SelectItem value="architect">Architect</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tech Interests */}
                <FormField
                  control={developerForm.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Laptop className="h-4 w-4" />
                        What are you interested in?
                      </FormLabel>
                      <div className="relative">
                        <Select
                          onValueChange={(value) => {
                            // If interest is already selected, remove it, otherwise add it
                            if (field.value.includes(value)) {
                              field.onChange(
                                field.value.filter((item) => item !== value)
                              );
                            } else {
                              field.onChange([...field.value, value]);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 ">
                              <SelectValue
                                placeholder={
                                  field.value.length > 0
                                    ? `${field.value.length} interests selected`
                                    : "Select your interests"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TECH_INTERESTS.map((interest) => (
                              <SelectItem
                                key={interest.id}
                                value={interest.id}
                                className={
                                  field.value.includes(interest.id)
                                    ? "bg-gray-800 text-white"
                                    : ""
                                }
                              >
                                {interest.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((interestId) => {
                          const interest = TECH_INTERESTS.find(
                            (i) => i.id === interestId
                          );
                          return interest ? (
                            <div
                              key={interestId}
                              className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">{interest.label}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter(
                                      (id) => id !== interestId
                                    )
                                  );
                                }}
                                className="text-white hover:text-red-400 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Availability for Projects */}
                <FormField
                  control={developerForm.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Users className="h-4 w-4" />
                        Availability for Projects
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 ">
                            <SelectValue placeholder="Select your availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full_time">
                            Full-time (40+ hours/week)
                          </SelectItem>
                          <SelectItem value="part_time">
                            Part-time (10-30 hours/week)
                          </SelectItem>
                          <SelectItem value="contract">
                            Contract-based
                          </SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="not_available">
                            Not Available
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills */}
                <FormField
                  control={developerForm.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Code className="h-4 w-4" />
                        Skills
                      </FormLabel>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {field.value?.map((skill, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">{skill}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSkills = [...field.value];
                                  newSkills.splice(index, 1);
                                  field.onChange(newSkills);
                                }}
                                className="text-white hover:text-red-400 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter a skill (e.g., React, TypeScript, UI Design)"
                            className="bg-transparent border-grayBorders h-12"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const value = input.value.trim();
                                if (value && !field.value.includes(value)) {
                                  field.onChange([...field.value, value]);
                                  input.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousSibling as HTMLInputElement;
                              const value = input.value.trim();
                              if (value && !field.value.includes(value)) {
                                field.onChange([...field.value, value]);
                                input.value = "";
                              }
                            }}
                            className="h-12"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                      <p className="text-xs text-zinc-500 mt-1">
                        Press Enter or click Add to add a skill
                      </p>
                    </FormItem>
                  )}
                />

                {/* Preferred Work Type */}
                <FormField
                  control={developerForm.control}
                  name="preferredWorkType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Laptop className="h-4 w-4" />
                        Preferred Work Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 ">
                            <SelectValue placeholder="Select your preferred work type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="on_site">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onBack}
                  type="button"
                  className="border-grayBorders h-12 px-8"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="h-12 px-10"
                >
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        ) : userType === "startup" ? (
          <Form {...startupForm}>
            <form
              onSubmit={startupForm.handleSubmit(handleStartupSubmit)}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Stage */}
                <FormField
                  control={startupForm.control}
                  name="productStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Target className="h-4 w-4" />
                        Product Stage
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 focus:border-accent">
                            <SelectValue placeholder="Select your product stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Idea">Idea</SelectItem>
                          <SelectItem value="Prototype">Prototype</SelectItem>
                          <SelectItem value="MVP">MVP</SelectItem>
                          <SelectItem value="Beta">Beta</SelectItem>
                          <SelectItem value="Launched">Launched</SelectItem>
                          <SelectItem value="Growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Team Size */}
                <FormField
                  control={startupForm.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <Briefcase className="h-4 w-4" />
                        Team Size
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 focus:border-accent">
                            <SelectValue placeholder="Select your team size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="10-50">10-50</SelectItem>
                          <SelectItem value="50-100">50-100</SelectItem>
                          <SelectItem value="+100">+100</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Funding Stage */}
                <FormField
                  control={startupForm.control}
                  name="fundingStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base mb-2">
                        <DollarSign className="h-4 w-4" />
                        Funding Stage
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-grayBorders h-12 focus:outline-none focus:ring-0 focus:border-accent">
                            <SelectValue placeholder="Select your funding stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                          <SelectItem value="Seed">Seed</SelectItem>
                          <SelectItem value="Series A">Series A</SelectItem>
                          <SelectItem value="Series B">Series B</SelectItem>
                          <SelectItem value="Series C+">Series C+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onBack}
                  type="button"
                  className="border-grayBorders h-12 px-8"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  className="h-12 px-10"
                >
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-zinc-400">
              Please go back and complete the account setup first
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// Complete step content
const CompleteStep = ({ onFinish }: { onFinish: () => void }) => (
  <>
    {/* Logo */}
    <div className="relative w-16 h-16 mb-2">
      <Image
        src="/logo.svg"
        alt="Collabute Logo"
        fill
        className="rounded-md"
        priority
      />
    </div>

    {/* Step Title */}
    <h1 className="text-3xl font-bold text-center w-full break-words">
      You&apos;re all set!
    </h1>

    {/* Description */}
    <div className="text-center text-zinc-400 space-y-2 w-full">
      <p className="text-sm">
        Your account has been set up successfully. You&apos;re ready to start
        using Collabute.
      </p>
    </div>

    {/* Success Icon */}
    <div className="mt-6 mb-6">
      <div className="w-20 h-20 bg-purple/20 rounded-full flex items-center justify-center mx-auto">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="#A855F7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>

    {/* Finish Button */}
    <Button
      variant="primary"
      size="lg"
      className="w-[200px] mt-4"
      onClick={onFinish}
    >
      Go to dashboard
    </Button>
  </>
);

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const router = useRouter();

  // Setup the onboarding context state
  const [userType, setUserType] = useState<"developer" | "startup" | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Navigate to dashboard or home page
    router.push("/dashboard");
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return <AccountSetupStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <PreferencesStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <CompleteStep onFinish={handleFinish} />;
      default:
        return <WelcomeStep onNext={handleNext} />;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ userType, setUserType, userId, setUserId }}
    >
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-4">
        <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
          {renderStepContent()}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>
    </OnboardingContext.Provider>
  );
};

export default Onboarding;
