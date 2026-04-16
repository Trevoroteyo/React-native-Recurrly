import { isClerkAPIResponseError } from "@clerk/expo";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

export type AuthFieldErrors = Partial<
  Record<"emailAddress" | "password" | "confirmPassword" | "code" | "form", string>
>;

const clerkFieldMap: Record<string, keyof AuthFieldErrors> = {
  email_address: "emailAddress",
  identifier: "emailAddress",
  emailAddress: "emailAddress",
  password: "password",
  code: "code",
};

export const validateEmail = (value: string): string | undefined => {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
  return undefined;
};

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const validatePassword = (value: string): string | undefined => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Include at least one lowercase letter.";
  if (!/\d/.test(value)) return "Include at least one number.";
  return undefined;
};

export const validateConfirmation = (
  password: string,
  confirmation: string,
): string | undefined => {
  if (!confirmation) return "Confirm your password.";
  if (password !== confirmation) return "Passwords do not match.";
  return undefined;
};

export const validateCode = (value: string): string | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) return "Enter the verification code from your inbox.";
  if (!VERIFICATION_CODE_PATTERN.test(normalizedValue)) {
    return "Enter the 6-digit verification code from your inbox.";
  }
  return undefined;
};

export const mapClerkError = (error: unknown): AuthFieldErrors => {
  if (!isClerkAPIResponseError(error) || error.errors.length === 0) {
    return { form: "Something went wrong. Please try again." };
  }

  return error.errors.reduce<AuthFieldErrors>((result, issue) => {
    const pathValue = issue.meta?.paramName || issue.meta?.name || issue.longMessage;
    const field = pathValue ? clerkFieldMap[String(pathValue)] : undefined;
    const message = issue.longMessage || issue.message || "Something went wrong.";

    if (field) {
      result[field] = message;
    } else if (!result.form) {
      result.form = message;
    }

    return result;
  }, {});
};

export const hasFieldErrors = (errors: AuthFieldErrors): boolean =>
  Object.values(errors).some(Boolean);
