import { mapClerkError, type AuthFieldErrors } from "@/lib/auth";

type SetErrors = (value: AuthFieldErrors | ((current: AuthFieldErrors) => AuthFieldErrors)) => void;
type SetPending = (value: boolean) => void;

type RunAuthActionOptions = {
  setErrors: SetErrors;
  action: () => Promise<void>;
  setPending?: SetPending;
};

type RunValidatedAuthActionOptions = RunAuthActionOptions & {
  validationErrors: AuthFieldErrors;
};

export const hasAuthErrors = (errors: AuthFieldErrors): boolean =>
  Object.values(errors).some(Boolean);

export const resetAuthErrors = (setErrors: SetErrors) => {
  setErrors({});
};

export const runAuthAction = async ({
  setErrors,
  action,
  setPending,
}: RunAuthActionOptions) => {
  resetAuthErrors(setErrors);
  setPending?.(true);

  try {
    await action();
  } catch (error) {
    setErrors(mapClerkError(error));
  } finally {
    setPending?.(false);
  }
};

export const runValidatedAuthAction = async ({
  validationErrors,
  setErrors,
  action,
  setPending,
}: RunValidatedAuthActionOptions) => {
  if (hasAuthErrors(validationErrors)) {
    setErrors(validationErrors);
    return;
  }

  await runAuthAction({
    setErrors,
    action,
    setPending,
  });
};
