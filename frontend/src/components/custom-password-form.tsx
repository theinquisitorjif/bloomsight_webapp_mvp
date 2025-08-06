import { useState } from "react";
import { useFormContext } from "react-hook-form";
import z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(40, "Password must be less than 40 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
});

/**
 * A custom password form component for use with `react-hook-form`.
 *
 * This component renders a password input field with a visibility toggle button,
 * a password strength indicator, and a list of password requirements.
 *
 * The component uses the `useFormContext` hook from `react-hook-form` to access
 * the form context and retrieve the values of the password and confirm password
 * fields.
 *
 * The component also uses the `useWatch` hook from `react-hook-form` to watch
 * the values of the password field and update the password strength indicator
 * and requirements list accordingly.
 *
 * The component accepts no props.
 *
 * @example
 * import { CustomPasswordForm } from "@app/components/custom-password-form";
 *
 * <CustomPasswordForm />
 */
export const CustomPasswordForm = () => {
  const form = useFormContext<z.infer<typeof NewPasswordSchema>>();

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const togglePasswordVisibility = () =>
    setIsPasswordVisible((prevState) => !prevState);

  const checkPasswordStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const password = form.watch("password");
  const passwordStrength = checkPasswordStrength(password);
  const strengthScore = passwordStrength.filter((req) => req.met).length;

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    return "Strong password";
  };

  return (
    <>
      <div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={isPasswordVisible ? "text" : "password"}
                    {...field}
                  />
                  <button
                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                    aria-pressed={isPasswordVisible}
                  >
                    {isPasswordVisible ? (
                      <EyeOffIcon size={16} aria-hidden="true" />
                    ) : (
                      <EyeIcon size={16} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password strength indicator */}
        <div
          className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={strengthScore}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label="Password strength"
        >
          <div
            className={`h-full ${getStrengthColor(
              strengthScore
            )} transition-all duration-500 ease-out`}
            style={{ width: `${(strengthScore / 4) * 100}%` }}
          ></div>
        </div>

        {/* Password strength description */}
        <p className="text-foreground mb-2 text-sm font-medium">
          {getStrengthText(strengthScore)}. Must contain:
        </p>

        {/* Password requirements list */}
        <ul className="space-y-1.5" aria-label="Password requirements">
          {passwordStrength.map((req, index) => (
            <li key={index} className="flex items-center gap-2">
              {req.met ? (
                <CheckIcon
                  size={16}
                  className="text-emerald-500"
                  aria-hidden="true"
                />
              ) : (
                <XIcon
                  size={16}
                  className="text-muted-foreground/80"
                  aria-hidden="true"
                />
              )}
              <span
                className={`text-xs ${
                  req.met ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                {req.text}
                <span className="sr-only">
                  {req.met ? " - Requirement met" : " - Requirement not met"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3">
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
