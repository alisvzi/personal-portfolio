"use client";

import { loginAdmin } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.success) {
        // Navigate to admin after successful login
        router.push("/admin");
      } else if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <div className="bg-gray-600 h-screen w-screen flex items-center justify-center">
      <form
        action={handleSubmit}
        className="space-y-4 max-w-md mx-auto p-6 border rounded shadow bg-white"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
