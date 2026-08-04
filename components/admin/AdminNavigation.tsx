"use client";

import { useRouter } from "next/navigation";

export default function AdminNavigation() {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
      >
        ← Артқа қайту
      </button>

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-green-700"
      >
        🏠 Басты бет
      </button>
    </div>
  );
}