"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { registerStudentSession } from "@/services/session.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      alert("Email мекенжайын жазыңыз.");
      return;
    }

    if (!password) {
      alert("Құпия сөзді жазыңыз.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: loginData,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      const userId = loginData.user?.id;

      if (!userId) {
        throw new Error("Қолданушы анықталмады.");
      }
      const mustChangePassword =
  loginData.user?.user_metadata
    ?.must_change_password === true;

if (mustChangePassword) {
  router.replace("/change-password");
  router.refresh();
  return;
}

      // 1. Алдымен студент екенін тексереміз
      const {
        data: student,
        error: studentError,
      } = await supabase
        .from("students")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (studentError) {
        throw new Error(
          `Студентті тексеру қатесі: ${studentError.message}`
        );
      }

      if (student) {
  await registerStudentSession(
    student.id,
    userId
  );

  router.replace("/student");
  router.refresh();
  return;
}

      // 2. Студент болмаса, админ екенін тексереміз
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (profileError) {
        throw new Error(
          `Профильді тексеру қатесі: ${profileError.message}`
        );
      }

      if (profile?.role === "admin") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      // Студент те, админ де болмаса
      await supabase.auth.signOut();

      alert(
        "Бұл қолданушыға платформаға кіру рұқсаты берілмеген."
      );
    } catch (error) {
      console.error("Кіру қатесі:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Жүйеге кіру кезінде белгісіз қате шықты.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-green-700">
          AKNUR Academy
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Жеке кабинетке кіру
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleLogin();
            }
          }}
          disabled={loading}
          className="mt-6 w-full rounded-lg border p-3 outline-none focus:border-green-600 disabled:bg-gray-100"
        />

        <input
          type="password"
          placeholder="Құпия сөз"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleLogin();
            }
          }}
          disabled={loading}
          className="mt-4 w-full rounded-lg border p-3 outline-none focus:border-green-600 disabled:bg-gray-100"
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-green-700 p-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Кіріп жатыр..." : "Кіру"}
        </button>
      </div>
    </main>
  );
}