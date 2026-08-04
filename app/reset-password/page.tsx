"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (password.length < 6) {
      alert("Пароль кемінде 6 символ болуы керек.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Парольдер сәйкес емес.");
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      alert("Пароль сәтті өзгертілді.");

      router.push("/login");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Қате шықты.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">

        <h1 className="text-3xl font-bold text-center">
          🔑 Жаңа пароль
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Жаңа пароль енгізіңіз
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <input
            type="password"
            placeholder="Жаңа пароль"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            type="password"
            placeholder="Парольді қайталаңыз"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full rounded-xl border p-3"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
          >
            {loading
              ? "Сақталуда..."
              : "Парольді сақтау"}
          </button>
        </form>

      </div>
    </main>
  );
}