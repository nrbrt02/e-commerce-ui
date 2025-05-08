import React, { useState } from "react";
import useToast from "../../utils/toast";
import customerApi from "../../utils/customerApi";
import Button from "../../components/ui/Button";
import { EyeIcon, EyeOffIcon, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const UpdatePassword: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Card subcomponents
  const Card = ({
    className = "",
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const CardHeader = ({
    className = "",
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const CardTitle = ({
    className = "",
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <h3
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );

  const CardDescription = ({
    className = "",
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <p className={`mt-1 text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  );

  const CardContent = ({
    className = "",
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );

  const CardFooter = ({
    className = "",
    children,
    ...props
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={`px-6 py-4 border-t border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );

  const validatePassword = (password: string) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    return {
      ...validations,
      isValid: Object.values(validations).every(Boolean),
    };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const passwordValidations = validatePassword(formData.newPassword);

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (!passwordValidations.isValid) {
      newErrors.newPassword = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword =
        "New password cannot be the same as current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await customerApi.updatePassword(
        formData.currentPassword,
        formData.newPassword
      );

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Success",
        description: "Your password has been successfully updated",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Password update error:", error);

      if (error.response && error.response.status === 401) {
        toast({
          title: "Error",
          description: "Your current password is incorrect",
          variant: "destructive",
        });
        setErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update password",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidations = validatePassword(formData.newPassword);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>
          Choose a strong password and don't reuse it for other accounts
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className={`block w-full px-3 py-2 border ${
                  errors.currentPassword ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
              />
              <Button
                type="button"
                variant="text"
                size="small"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={`block w-full px-3 py-2 border ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
              />
              <Button
                type="button"
                variant="text"
                size="small"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={`block w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
              />
              <Button
                type="button"
                variant="text"
                size="small"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">
              Password Requirements:
            </p>
            <ul className="text-xs space-y-1 text-gray-500">
              <li className="flex items-center space-x-2">
                {passwordValidations.minLength ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>At least 8 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                {passwordValidations.hasUpper ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>At least one uppercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                {passwordValidations.hasLower ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>At least one lowercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                {passwordValidations.hasNumber ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>At least one number</span>
              </li>
              <li className="flex items-center space-x-2">
                {passwordValidations.hasSpecial ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-gray-400" />
                )}
                <span>At least one special character</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UpdatePassword;
