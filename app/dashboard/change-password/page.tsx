"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AdminChangePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 6) {
      alert("Жаңа пароль кемінде 6 таңбадан тұруы керек.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Парольдер сәйкес емес.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      alert("Пароль сәтті өзгертілді.");

      router.replace("/dashboard/settings");
      router.refresh();
    } catch (error) {
      console.error("Парольді өзгерту қатесі:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Парольді өзгерту кезінде белгісіз қате шықты."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <button
  type="button"
  onClick={() => router.push("/dashboard/settings")}
  className="mb-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
>
  ← Баптауларға қайту
</button>
        <div className="text-center">
          <div className="text-5xl">🔐</div>

          <h1 className="mt-4 text-3xl font-bold text-green-700">
            Админ паролін өзгерту
          </h1>

          <p className="mt-3 text-gray-600">
            Жаңа парольді екі рет енгізіңіз.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Жаңа пароль
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Кемінде 6 таңба"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Парольді қайталаңыз
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Жаңа парольді қайта жазыңыз"
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "Сақталып жатыр..."
              : "Парольді сақтау"}
          </button>
        </form>
      </div>
    </main>
  );
}