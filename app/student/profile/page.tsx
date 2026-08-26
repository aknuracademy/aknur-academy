"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getCurrentStudent } from "@/services/student.service";

type StudentProfile = {
  id: number;
  full_name: string;
  email: string;
  auth_user_id: string;
};

export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMessage("");

        const currentStudent = await getCurrentStudent();

        setStudent(currentStudent);
      } catch (error) {
        console.error("Профильді жүктеу қатесі:", error);

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Профильді жүктеу кезінде белгісіз қате шықты."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

          <p className="mt-4 text-xl font-medium text-gray-700">
            Профиль жүктеліп жатыр...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-xl font-bold text-red-600">
            Профильді жүктеу мүмкін болмады
          </p>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
          >
            Қайта жүктеу
          </button>
        </div>
      </main>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 pb-6 pt-20 md:p-10 lg:pt-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            👤 Профиль
          </h1>

          <p className="mt-2 text-gray-600">
            Аккаунт мәліметтері
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Аты-жөні
              </p>

              <p className="mt-2 text-xl font-semibold text-gray-900">
                {student.full_name}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-500">
                Email
              </p>

              <p className="mt-2 text-lg text-gray-900">
                {student.email}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-500">
                Қауіпсіздік
              </p>

              <Link
                href="/change-password"
                className="mt-3 inline-block rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
              >
                🔐 Парольді ауыстыру
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}