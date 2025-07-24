import React, { useState } from "react";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  error?: string;
}

export default function AuthForm({
  mode,
  onSubmit,
  loading,
  error,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 flex flex-col gap-6 border border-zinc-200 dark:border-zinc-800"
    >
      <h2 className="text-2xl font-bold text-center text-zinc-800 dark:text-zinc-100 mb-2">
        {mode === "signup" ? "Sign Up" : "Log In"}
      </h2>
      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? "Loading..." : mode === "signup" ? "Sign Up" : "Log In"}
      </button>
      {error && (
        <div className="text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300 rounded-lg px-4 py-2 text-center text-sm font-medium">
          {error}
        </div>
      )}
    </form>
  );
}
