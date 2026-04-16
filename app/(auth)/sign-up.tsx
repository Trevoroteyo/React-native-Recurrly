import AuthShell from "@/components/auth/AuthShell";
import AuthTextField from "@/components/auth/AuthTextField";
import {
  mapClerkError,
  normalizeEmail,
  type AuthFieldErrors,
  validateCode,
  validateConfirmation,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

const defaultErrors: AuthFieldErrors = {};

export default function SignUpScreen() {
  const { isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>(defaultErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const needsVerification = Boolean(
    signUp?.unverifiedFields.includes("email_address") &&
      signUp?.missingFields.length === 0,
  );
  const submittedEmail = normalizeEmail(emailAddress);

  const clearFieldError = (field: keyof AuthFieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors: AuthFieldErrors = {
      emailAddress: validateEmail(emailAddress),
      password: validatePassword(password),
      confirmPassword: validateConfirmation(password, confirmPassword),
    };

    if (nextErrors.emailAddress || nextErrors.password || nextErrors.confirmPassword) {
      setErrors(nextErrors);
      return;
    }

    if (!signUp) return;

    setErrors(defaultErrors);
    setIsSubmitting(true);

    try {
      const { error } = await signUp.password({
        emailAddress: submittedEmail,
        password,
      });

      if (error) {
        setErrors(mapClerkError(error));
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: () => {
            router.replace("/(tabs)");
          },
        });
        return;
      }

      if (
        signUp.unverifiedFields.includes("email_address") &&
        signUp.missingFields.length === 0
      ) {
        await signUp.verifications.sendEmailCode();
        return;
      }

      setErrors({
        form: "Your account needs one more step. Please review your details and try again.",
      });
    } catch (error) {
      setErrors(mapClerkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    const nextCodeError = validateCode(code);
    if (nextCodeError) {
      setErrors({ code: nextCodeError });
      return;
    }

    if (!signUp) return;

    setErrors(defaultErrors);
    setIsSubmitting(true);

    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: () => {
            router.replace("/(tabs)");
          },
        });
        return;
      }

      setErrors({
        form: "Your account still needs attention. Please request a new code and try again.",
      });
    } catch (error) {
      setErrors(mapClerkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    setErrors(defaultErrors);
    setIsResendingCode(true);

    try {
      await signUp.verifications.sendEmailCode();
    } catch (error) {
      setErrors(mapClerkError(error));
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleStartOver = async () => {
    if (!signUp) return;
    await signUp.reset();
    setCode("");
    setErrors(defaultErrors);
  };

  if (signUp?.status === "complete" || isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <AuthShell
      title={needsVerification ? "Verify your email" : "Create your account"}
      subtitle={
        needsVerification
          ? "One final step and your secure Recurly workspace is ready."
          : "Set up your account to track recurring payments with clarity and control."
      }
    >
      <View className="auth-form">
        {needsVerification ? (
          <>
            <View className="auth-status-card">
              <View className="auth-chip">
                <Text className="auth-chip-text">Secure setup</Text>
              </View>
              <Text className="auth-status-title">Verify your inbox</Text>
              <Text className="auth-status-copy">
                We sent a confirmation code to {submittedEmail || "your email"}.
                Enter it below to activate your account.
              </Text>
            </View>

            <AuthTextField
              label="Verification code"
              value={code}
              onChangeText={(value) => {
                setCode(value);
                clearFieldError("code");
              }}
              error={errors.code}
              helper="You can request another code if this one expires."
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoCapitalize="none"
              autoComplete="one-time-code"
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />

            {errors.form ? <Text className="auth-error">{errors.form}</Text> : null}

            <Pressable
              className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
              disabled={isSubmitting}
              onPress={handleVerify}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Verify and continue</Text>
              )}
            </Pressable>

            <Pressable
              className="auth-secondary-button"
              disabled={isResendingCode || isSubmitting}
              onPress={handleResendCode}
            >
              <Text className="auth-secondary-button-text">
                {isResendingCode ? "Sending a new code..." : "Send a new code"}
              </Text>
            </Pressable>

            <Pressable className="auth-secondary-button" onPress={handleStartOver}>
              <Text className="auth-secondary-button-text">Edit account details</Text>
            </Pressable>
          </>
        ) : (
          <>
            <AuthTextField
              label="Email"
              value={emailAddress}
              onChangeText={(value) => {
                setEmailAddress(value);
                clearFieldError("emailAddress");
              }}
              error={errors.emailAddress}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
              helper="We will send verification updates to this inbox."
            />

            <AuthTextField
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearFieldError("password");
                clearFieldError("confirmPassword");
              }}
              error={errors.password}
              helper="Use 8+ characters with uppercase, lowercase, and a number."
              placeholder="Create a password"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="password-new"
              returnKeyType="next"
            />

            <AuthTextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                clearFieldError("confirmPassword");
              }}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {errors.form ? <Text className="auth-error">{errors.form}</Text> : null}

            <Pressable
              className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff9e3" />
              ) : (
                <Text className="auth-button-text">Create account</Text>
              )}
            </Pressable>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </>
        )}
      </View>
    </AuthShell>
  );
}
