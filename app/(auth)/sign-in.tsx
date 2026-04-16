import AuthShell from "@/components/auth/AuthShell";
import AuthTextField from "@/components/auth/AuthTextField";
import {
  mapClerkError,
  normalizeEmail,
  type AuthFieldErrors,
  validateCode,
  validateEmail,
} from "@/lib/auth";
import {
  runAuthAction,
  runValidatedAuthAction,
} from "@/lib/auth-flow";
import { useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const needsEmailCode = signIn?.status === "needs_client_trust";
  const submittedEmail = normalizeEmail(emailAddress);

  const clearFieldError = (field: keyof AuthFieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors: AuthFieldErrors = {
      emailAddress: validateEmail(emailAddress),
      password: password ? undefined : "Password is required.",
    };

    if (!signIn) return;

    await runValidatedAuthAction({
      validationErrors: nextErrors,
      setErrors,
      setPending: setIsSubmitting,
      action: async () => {
        const { error } = await signIn.password({
          emailAddress: submittedEmail,
          password,
        });

        if (error) {
          setErrors(mapClerkError(error));
          return;
        }

        if (signIn.status === "complete") {
          await signIn.finalize({
            navigate: () => {
              router.replace("/(tabs)");
            },
          });
          return;
        }

        if (signIn.status === "needs_client_trust") {
          await signIn.mfa.sendEmailCode();
          return;
        }

        setErrors({
          form: "We couldn't complete sign in yet. Please review your details and try again.",
        });
      },
    });
  };

  const handleVerify = async () => {
    const nextCodeError = validateCode(code);
    if (!signIn) return;

    await runValidatedAuthAction({
      validationErrors: { code: nextCodeError },
      setErrors,
      setPending: setIsSubmitting,
      action: async () => {
        await signIn.mfa.verifyEmailCode({ code: code.trim() });

        if (signIn.status === "complete") {
          await signIn.finalize({
            navigate: () => {
              router.replace("/(tabs)");
            },
          });
          return;
        }

        setErrors({
          form: "That code did not finish sign in. Request a fresh code and try again.",
        });
      },
    });
  };

  const handleResendCode = async () => {
    if (!signIn) return;

    await runAuthAction({
      setErrors,
      setPending: setIsResendingCode,
      action: async () => {
        await signIn.mfa.sendEmailCode();
      },
    });
  };

  const handleStartOver = async () => {
    if (!signIn) return;

    await runAuthAction({
      setErrors,
      action: async () => {
        await signIn.reset();
        setCode("");
      },
    });
  };

  return (
    <AuthShell
      title={needsEmailCode ? "Check your email" : "Welcome back"}
      subtitle={
        needsEmailCode
          ? "Use the verification code we sent to keep your account secure."
          : "Sign in to continue managing subscriptions with confidence."
      }
    >
      <View className="auth-form">
        {needsEmailCode ? (
          <>
            <View className="auth-status-card">
              <View className="auth-chip">
                <Text className="auth-chip-text">Identity check</Text>
              </View>
              <Text className="auth-status-title">Confirm it&apos;s really you</Text>
              <Text className="auth-status-copy">
                We sent a one-time code to {submittedEmail || "your email"}.
                Enter it below to finish signing in.
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
              helper="Codes expire quickly for your protection."
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              autoCapitalize="none"
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
              <Text className="auth-secondary-button-text">Start over</Text>
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
              textContentType="username"
              autoComplete="email"
              returnKeyType="next"
              helper="Use the email connected to your Recurly account."
            />

            <AuthTextField
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearFieldError("password");
              }}
              error={errors.password}
              placeholder="Enter your password"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              helper="Your session stays encrypted on this device."
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
                <Text className="auth-button-text">Sign in</Text>
              )}
            </Pressable>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </>
        )}
      </View>
    </AuthShell>
  );
}
