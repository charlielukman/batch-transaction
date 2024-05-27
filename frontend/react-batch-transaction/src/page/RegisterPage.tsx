import RegisterForm from "../components/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
