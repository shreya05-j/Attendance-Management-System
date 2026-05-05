import { z } from "zod";

const ROLE_DOMAIN_MAP: Record<string, "admin" | "faculty" | "student"> = {
  "admin.in": "admin",
  "faculty.in": "faculty",
  "jlu.edu.in": "student",
};

function validateEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain !== undefined && ROLE_DOMAIN_MAP[domain] !== undefined;
}

function detectRole(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase();
  return ROLE_DOMAIN_MAP[domain] ?? "student";
}

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(validateEmailDomain, {
      message: "Email must be from @admin.in, @faculty.in, or @jlu.edu.in",
    }),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(150),
    email: z
      .string()
      .email("Invalid email address")
      .refine(validateEmailDomain, {
        message: "Email must be from @admin.in, @faculty.in, or @jlu.edu.in",
      }),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .transform((data) => ({
    ...data,
    role: detectRole(data.email),
  }));

export const updateUserSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  email: z
    .string()
    .email()
    .refine(validateEmailDomain, {
      message: "Email must be from @admin.in, @faculty.in, or @jlu.edu.in",
    })
    .optional(),
  is_active: z.boolean().optional(),
});

export { ROLE_DOMAIN_MAP, detectRole, validateEmailDomain };
