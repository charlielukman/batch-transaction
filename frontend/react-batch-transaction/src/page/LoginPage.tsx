import LoginForm from "../components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
