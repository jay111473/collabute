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
  phoneNumber: z.string().optional().nullable(),
  developerFields: z
    .object({
      primaryRole: z.enum([
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Mobile Developer",
        "DevOps Engineer",
        "Data Scientist",
        "UI/UX Designer",
        "QA Engineer",
        "Other",
      ] as const),
    })
    .optional(),
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
    .optional(),
});
