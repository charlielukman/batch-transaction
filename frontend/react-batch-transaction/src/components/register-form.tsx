import { Link, useNavigate } from "react-router-dom";
import { FC, FormEvent, useState } from "react";
import { z } from "zod";

interface FormData {
  account_number: string;
  account_name: string;
  user_id: string;
  user_name: string;
  password: string;
  phone_number: string;
  role: "Maker" | "Approver";
  email: string;
  otp_code: string;
}

const registerFormSchema = z.object({
  account_number: z.string().min(1, "Required"),
  account_name: z.string().min(1, "Required"),
  user_id: z.string().min(1, "Required"),
  user_name: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
  country_code: z.string().optional(),
  phone_number: z.string().min(1, "Required"),
  role: z.enum(["Maker", "Approver"]),
  email: z.string().email("Invalid email"),
  otp_code: z.string().min(1, "Required"),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;
type Errors = Partial<Record<keyof RegisterFormData, string>>;

const RegisterForm: FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    account_number: "",
    account_name: "",
    user_id: "",
    user_name: "",
    password: "",
    country_code: "+62",
    phone_number: "",
    role: "Maker",
    email: "",
    otp_code: "",
  });
  const [otpResponse, setOtpResponse] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});
  const [responseError, setResponseError] = useState<string>("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      setErrors({ email: "Required" });
      return;
    }
    try {
      const response = await fetch("http://localhost:1323/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResponseError(data.message);
        return;
      }

      setOtpResponse(data.otp);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async (formData: FormData) => {
    const { success, error } = registerFormSchema.safeParse(formData);
    if (!success) {
      const newErrors: Errors = {};
      for (const [field, issue] of Object.entries(
        error.formErrors.fieldErrors
      )) {
        newErrors[field as keyof RegisterFormData] = issue?.[0] || "";
      }
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const response = await fetch("http://localhost:1323/api/auth/register", {
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

      alert("User registered successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const phoneNumber = formData.country_code + formData.phone_number;
    const data = {
      account_number: formData.account_number,
      account_name: formData.account_name,
      user_id: formData.user_id,
      user_name: formData.user_name,
      password: formData.password,
      phone_number: phoneNumber,
      role: formData.role,
      email: formData.email,
      otp_code: formData.otp_code,
    };
    handleRegister(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="account_number"
            className="block text-sm font-medium text-gray-700"
          >
            Corporate Account No.
          </label>
          <input
            type="number"
            id="account_number"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Corporate Account No."
            min="1"
            value={formData.account_number}
            onChange={handleChange}
          />
          {errors.account_number && (
            <div className="text-red-500">{errors.account_number}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="account_name"
            className="block text-sm font-medium text-gray-700"
          >
            Corporate Name
          </label>
          <input
            type="text"
            id="account_name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Corporate Name"
            value={formData.account_name}
            onChange={handleChange}
          />
          {errors.account_name && (
            <div className="text-red-500">{errors.account_name}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="user_id"
            className="block text-sm font-medium text-gray-700"
          >
            User ID
          </label>
          <input
            type="text"
            id="user_id"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="User ID"
            value={formData.user_id}
            onChange={handleChange}
          />
          {errors.user_id && (
            <div className="text-red-500">{errors.user_id}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="user_name"
            className="block text-sm font-medium text-gray-700"
          >
            User Name
          </label>
          <input
            type="text"
            id="user_name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="User Name"
            value={formData.user_name}
            onChange={handleChange}
          />
          {errors.user_name && (
            <div className="text-red-500">{errors.user_name}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="text-red-500">{errors.password}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            id="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Maker">Maker</option>
            <option value="Approver">Approver</option>
          </select>
          {errors.role && <div className="text-red-500">{errors.role}</div>}
        </div>
        <div className="mb-4">
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone No.
          </label>
          <div className="flex items-center">
            <select
              id="country_code"
              className="w-1/5 px-3 py-2 border border-r-0 border-gray-300 bg-gray-200 rounded-l-md rounded-r-none shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.country_code}
              onChange={handleChange}
            >
              <option value="+62">+62</option>
            </select>
            <input
              type="number"
              id="phone_number"
              className="w-4/5 px-3 py-2 border border-gray-300 rounded-l-none rounded-r-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Phone No."
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          {errors.phone_number && (
            <div className="text-red-500">{errors.phone_number}</div>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="text-red-500">{errors.email}</div>}
        </div>
        <div className="mb-4">
          <label
            htmlFor="otp_code"
            className="block text-sm font-medium text-gray-700"
          >
            Verification Code
          </label>
          <div className="flex">
            <input
              type="text"
              id="otp_code"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-l-md rounded-r-none shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Verification Code"
              value={formData.otp_code}
              onChange={handleChange}
            />
            <button
              type="button"
              className="mt-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md rounded-l-none shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSendOTP}
            >
              Send OTP Code
            </button>
          </div>
          {otpResponse && (
            <div className="text-green-500">OTP code: {otpResponse}</div>
          )}

          {errors.otp_code && (
            <div className="text-red-500">{errors.otp_code}</div>
          )}
        </div>
        <div>
          {responseError && <div className="text-red-500">{responseError}</div>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </div>
      </form>
      <div className="mt-6 text-center">
        <div className="flex justify-around">
          <span className="text-sm">Already have an account?</span>
          <Link
            to="/login"
            className="text-sm text-yellow-500 hover:text-indigo-500"
          >
            Login Now &gt;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
