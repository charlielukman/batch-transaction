import { Link } from "react-router-dom";
import { FC, FormEvent, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

interface FormData {
  account_number: string;
  user_id: string;
  password: string;
}

interface AuthUserData {
  token: string;
  userId: string;
  userName: string;
  role: string;
  accountNo: string;
  lastLoginAt: string;
}

const loginFormSchema = z.object({
  account_number: z.string().min(1, "Required"),
  user_id: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;
type Errors = Partial<Record<keyof LoginFormData, string>>;

const LoginForm: FC = () => {
  const auth = useAuth();
  const login = auth?.login;

  const [showPassword, setShowPassword] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [responseError, setResponseError] = useState<string>("");

  const handleLogin = async (formData: FormData) => {
    const { success, error } = loginFormSchema.safeParse(formData);
    if (!success) {
      const newErrors: Errors = {};
      for (const [field, issue] of Object.entries(
        error.formErrors.fieldErrors
      )) {
        newErrors[field as keyof LoginFormData] = issue?.[0] || "";
      }
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setResponseError(data.message);
        return;
      }

      const user: AuthUserData = {
        token: data.token,
        userId: data.user.user_id,
        userName: data.user.user_name,
        role: data.user.role,
        accountNo: data.corporate.account_number,
        lastLoginAt: data.user.last_login_at,
      };
      
      if (login) {
        await login(user);
      } else {
        console.error('Login function is not defined');
      }
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const formData = {
      account_number: accountNumber,
      user_id: userId,
      password: password,
    };
    handleLogin(formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="corporateAccountNo"
            className="block text-sm font-medium text-gray-700"
          >
            Corporate Account No.
          </label>
          <input
            type="number"
            id="corporateAccountNo"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Corporate Account No."
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          {errors.account_number && (
            <div className="text-red-500">{errors.account_number}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700"
          >
            User ID
          </label>
          <input
            type="text"
            id="userId"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          {errors.user_id && (
            <div className="text-red-500">{errors.user_id}</div>
          )}
        </div>
        <div className="mb-6 relative">
          <label
            htmlFor="loginPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Login password
          </label>
          <div className="mt-1 relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              id="loginPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon
                  className="h-5 w-5 text-gray-400"
                  width={20}
                  height={20}
                />
              ) : (
                <EyeIcon
                  className="h-5 w-5 text-gray-400"
                  width={20}
                  height={20}
                />
              )}
            </div>
          </div>
          {errors.password && (
            <div className="text-red-500">{errors.password}</div>
          )}
        </div>
        <div>
          {responseError && <div className="text-red-500">{responseError}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <div className="flex justify-evenly">
          <span className="text-sm">Without Account?</span>
          <Link
            to="/register"
            className="text-sm text-yellow-500 hover:text-indigo-500"
          >
            Register Now &gt;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
