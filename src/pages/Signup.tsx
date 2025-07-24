import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { signUpWithEmail } from "../services/authService";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError("");
    const { error } = await signUpWithEmail(email, password);
    setLoading(false);
    if (error) setError(error.message);
    else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 p-4">
      <AuthForm
        mode="signup"
        onSubmit={handleSignup}
        loading={loading}
        error={error}
      />
      <p className="mt-6 text-center text-zinc-600 dark:text-zinc-300">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-semibold"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
