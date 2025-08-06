import * as z from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["developer", "startup"]),
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
    .min(1, "Phone number is required")
    .regex(
      /^[\+]?[1-9][\d]{0,15}$/,
      "Please enter a valid phone number (7-16 digits)"
    ),
  countryCode: z.string().min(1, "Country code is required"),
  developerFields: z
    .object({
      primaryRole: z.array(z.enum([
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
      ] as const)).min(1, "At least one primary role must be selected"),
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
}).superRefine((data, ctx) => {
  if (data.type === "developer") {
    if (!data.developerFields?.primaryRole || data.developerFields.primaryRole.length === 0) {
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
});
