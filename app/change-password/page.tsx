"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { registerStudentSession } from "@/services/session.service";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 6) {
      alert(
        "Жаңа пароль кемінде 6 таңбадан тұруы керек."
      );
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
          data: {
            must_change_password: false,
          },
        });

      if (error) {
  throw error;
}

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  throw new Error(
    userError?.message ||
      "Қолданушы анықталмады."
  );
}

const {
  data: student,
  error: studentError,
} = await supabase
  .from("students")
  .select("id")
  .eq("auth_user_id", user.id)
  .single();

if (studentError) {
  throw new Error(
    `Студентті табу қатесі: ${studentError.message}`
  );
}

await registerStudentSession(
  student.id,
  user.id
);

alert("Пароль сәтті өзгертілді.");

router.replace("/student");
router.refresh();
    } catch (error) {
      console.error(
        "Парольді өзгерту қатесі:",
        error
      );

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
        <div className="text-center">
          <div className="text-5xl">🔐</div>

          <h1 className="mt-4 text-3xl font-bold text-green-700">
            Жаңа пароль орнатыңыз
          </h1>

          <p className="mt-3 text-gray-600">
            Қауіпсіздік үшін уақытша парольді
            ауыстыру қажет.
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
                setConfirmPassword(
                  event.target.value
                )
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