import { CreateAccountFormData, LoginFormData } from "@/types/auth.types";
import { User } from "@/types/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type AuthResponse = {
  user: User;
  token: string;
  exp?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Define cookie options
const TOKEN_COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

export async function login({
  email,
  password,
}: LoginFormData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log(response);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }
  const data: AuthResponse = await response.json();
  return {
    user: data.user,
    token: data.token,
  };
}

export async function signup(
  payload: Partial<CreateAccountFormData>
): Promise<User> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to sign up");
  }

  const data: AuthResponse = await response.json();
  return data.user;
}

export async function logout(): Promise<void> {
  // Delete the auth token cookie
  const cookiesInstance = await cookies();
  cookiesInstance.delete(TOKEN_COOKIE_NAME);

  // Also hit the backend logout endpoint to invalidate the token server-side
  await fetch(`${API_URL}/users/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export async function getUser(): Promise<User | null> {
  // Get the token from cookies
  const cookiesInstance = await cookies();
  const token = cookiesInstance.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Failed to process forgot password request"
    );
  }
}

export async function resetPassword(
  token: string,
  password: string
): Promise<User> {
  const response = await fetch(`${API_URL}/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reset password");
  }

  const data: AuthResponse = await response.json();

  // Set the auth token cookie
  const cookiesInstance = await cookies();
  cookiesInstance.set(TOKEN_COOKIE_NAME, data.token, COOKIE_OPTIONS);

  return data.user;
}

// Authentication middleware for route protection
export async function requireAuth() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
