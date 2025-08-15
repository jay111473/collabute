import * as z from "zod";

export const teamLeadBasicInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().optional(),
});

export const teamLeadProfilesSchema = z.object({
  personalWebsite: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  github: z.string().min(1, "GitHub profile is required"),
  xProfile: z.string().min(1, "X profile is required"),
});

export const teamLeadExperienceSchema = z.object({
  professionalPMExperience: z.enum([
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "4-5 years",
    "6-7 years",
    "8-10 years",
    "+10 years",
  ]),
  startupExperience: z.enum([
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "4-5 years",
    "6-7 years",
    "8-10 years",
    "+10 years",
  ]),
  resume: z.instanceof(File).optional().nullable(),
  projectSpecialties: z
    .array(
      z.enum([
        "SaaS Platform Design",
        "E-commerce Design",
        "Mobile App Design",
        "Landing Page Design",
        "Brand Identity Design",
        "Dashboard/Data Visualization",
        "Marketplace Design",
      ])
    )
    .min(1, "At least one project specialty must be selected"),
});

export const teamLeadAvailabilitySchema = z.object({
  availabilityHours: z.enum([
    "1-2 hours",
    "3-4 hours",
    "5-6 hours",
    "7-8 hours",
    "Full-time availability (8+ hours)",
  ]),
  greatSoftwareDefinition: z
    .string()
    .min(10, "Please provide a detailed description (at least 10 characters)")
    .max(150, "Description must be 150 words or less"),
  projectManagementDescription: z
    .string()
    .min(10, "Please provide a detailed description (at least 10 characters)")
    .max(150, "Description must be 150 words or less"),
});

export const teamLeadFormSchema = z.object({
  basicInfo: teamLeadBasicInfoSchema,
  profiles: teamLeadProfilesSchema,
  experience: teamLeadExperienceSchema,
  availability: teamLeadAvailabilitySchema,
});

export const designerBasicInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Country is required"),
  phoneNumber: z.string().optional(),
});

export const designerProfilesSchema = z.object({
  portfolioType: z.enum(["Personal Website (Preferred)", "PDF Portfolio", "Figma/Adobe XD Link"]),
  portfolioUrl: z.string().min(1, "Portfolio URL is required").url("Enter a valid url"),
  dribbbleProfile: z.string().optional().or(z.literal("")),
  behanceProfile: z.string().optional().or(z.literal("")),
  layersProfile: z.string().optional().or(z.literal("")),
});

export const designerExperienceSchema = z.object({
  professionalDesignExperience: z.enum([
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "4-5 years",
    "6-7 years",
    "8-10 years",
    "+10 years",
  ]),
  startupExperience: z.enum([
    "0-1 years",
    "1-2 years",
    "2-3 years",
    "4-5 years",
    "6-7 years",
    "8-10 years",
    "+10 years",
  ]),
  resume: z.instanceof(File).optional().nullable(),
  designWorkTypes: z
    .array(
      z.enum([
        "SaaS Platform Design",
        "E-commerce Design",
        "Mobile App Design",
        "Landing Page Design",
        "Brand Identity Design",
        "Dashboard/Data Visualization",
        "Marketplace Design",
      ])
    )
    .min(1, "At least one design work type must be selected"),
});

export const designerAvailabilitySchema = z.object({
  availabilityHours: z.enum([
    "1-2 hours",
    "3-4 hours",
    "5-6 hours",
    "7-8 hours",
    "Full-time availability (8+ hours)",
  ]),
  qualityOverDelivery: z
    .string()
    .min(10, "Please provide a detailed description (at least 10 characters)")
    .max(150, "Description must be 150 words or less"),
  favoriteProducts: z
    .string()
    .min(10, "Please provide a detailed description (at least 10 characters)"),
});

export const designerFormSchema = z.object({
  basicInfo: designerBasicInfoSchema,
  profiles: designerProfilesSchema,
  experience: designerExperienceSchema,
  availability: designerAvailabilitySchema,
});

export const createAccountSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["developer", "startup", "project_manager", "designer"]),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    phoneNumber: z
      .string()
      .regex(
        /^\+?[1-9]\d{6,15}$/,
        "Please enter a valid phone number (7-16 digits)"
      )
      .optional()
      .or(z.literal("")),
    countryCode: z.string().min(1, "Country code is required"),
    developerFields: z
      .object({
        primaryRole: z
          .array(
            z.enum([
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
            ] as const)
          )
          .min(1, "At least one primary role must be selected"),
      })
      .optional()
      .nullable(),
    startupFields: z
      .object({
        companyName: z
          .string()
          .min(2, "Company name must be at least 2 characters")
          .nullable(),
        teamSize: z
          .enum(["1-10", "10-50", "50-100", "100+"] as const)
          .optional()
          .nullable(),
      })
      .optional()
      .nullable(),
    teamLeadFields: teamLeadFormSchema.optional(),
    designerFields: designerFormSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate phone number for non-project-manager types
    if (data.type !== "project_manager") {
      if (!data.phoneNumber || !/^\+?[1-9]\d{6,15}$/.test(data.phoneNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A valid phone number (7-16 digits) is required",
          path: ["phoneNumber"],
        });
      }
    }
    
    // Only validate fields for the selected account type
    if (data.type === "developer") {
      if (
        !data.developerFields?.primaryRole ||
        data.developerFields.primaryRole.length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one primary role must be selected for developer accounts",
          path: ["developerFields", "primaryRole"],
        });
      }
    }
    
    if (data.type === "startup") {
      const companyName = data.startupFields?.companyName;
      if (typeof companyName !== "string" || companyName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is required for startup accounts and must be at least 2 characters",
          path: ["startupFields", "companyName"],
        });
      }
      if (!data.startupFields?.teamSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team size is required for startup accounts",
          path: ["startupFields", "teamSize"],
        });
      }
    }
    
    // Note: We don't validate teamLeadFields and designerFields here since they use wizards
    // and handle their own validation. For initial form submission, we only need basic info.
  });

export const stepValidationSchemas = {
  step1: teamLeadBasicInfoSchema,
  step2: teamLeadProfilesSchema,
  step3: teamLeadExperienceSchema,
  step4: teamLeadAvailabilitySchema,
};

export const designerStepValidationSchemas = {
  step1: designerBasicInfoSchema,
  step2: designerProfilesSchema,
  step3: designerExperienceSchema,
  step4: designerAvailabilitySchema,
};

export type TeamLeadBasicInfo = z.infer<typeof teamLeadBasicInfoSchema>;
export type TeamLeadProfiles = z.infer<typeof teamLeadProfilesSchema>;
export type TeamLeadExperience = z.infer<typeof teamLeadExperienceSchema>;
export type TeamLeadAvailability = z.infer<typeof teamLeadAvailabilitySchema>;
export type TeamLeadFormData = z.infer<typeof teamLeadFormSchema>;
export type DesignerBasicInfo = z.infer<typeof designerBasicInfoSchema>;
export type DesignerProfiles = z.infer<typeof designerProfilesSchema>;
export type DesignerExperience = z.infer<typeof designerExperienceSchema>;
export type DesignerAvailability = z.infer<typeof designerAvailabilitySchema>;
export type DesignerFormData = z.infer<typeof designerFormSchema>;
export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
