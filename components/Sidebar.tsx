"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
  if (path === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname.startsWith(path);
};

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
  }

  return (
    <aside className="min-h-screen w-72 bg-green-700 p-6 text-white">
      <h1 className="text-3xl font-bold">
        AKNUR Academy
      </h1>

      <p className="mt-2 text-green-100">
        Онлайн оқу платформасы
      </p>

      <nav className="mt-10 flex flex-col gap-3">
        <Link
          href="/dashboard"
          className={`rounded-lg p-3 transition ${
  isActive("/dashboard")
    ? "bg-green-500 font-bold"
    : "hover:bg-green-600"
}`}
        >
          🏠 Басты бет
        </Link>

        <Link
          href="/dashboard/courses"
          className={`rounded-lg p-3 transition ${
  isActive("/dashboard/courses") ||
  isActive("/dashboard/modules")
    ? "bg-green-500 font-bold"
    : "hover:bg-green-600"
}`}
        >
          📚 Курстар
        </Link>

        <Link
          href="/dashboard/videos"
          className={`rounded-lg p-3 transition ${
  isActive("/dashboard/videos")
    ? "bg-green-500 font-bold"
    : "hover:bg-green-600"
}`}
        >
          🎥 Видео сабақтар
        </Link>

        <Link
          href="/dashboard/students"
          className={`rounded-lg p-3 transition ${
  isActive("/dashboard/students")
    ? "bg-green-500 font-bold"
    : "hover:bg-green-600"
}`}
        >
          👨‍🎓 Студенттер
        </Link>

        <Link
         href="/dashboard/materials"
          className={`rounded-lg p-3 transition ${
  isActive("/dashboard/materials")
    ? "bg-green-500 font-bold"
    : "hover:bg-green-600"
}`}
        >
          📄 PDF материалдар
        </Link>

        <Link
          href="/dashboard/settings"
          className={`rounded-lg p-3 transition ${
  isActive("/dashboard/settings")
    ? "bg-green-500 font-bold"
    : "hover:bg-green-600"
}`}
        >
          ⚙️ Баптаулар
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-10 w-full rounded-lg bg-red-500 p-3 text-left hover:bg-red-600"
      >
        🚪 Шығу
      </button>
    </aside>
  );
}