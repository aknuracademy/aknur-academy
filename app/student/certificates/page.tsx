
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BackButton from "@/components/student/BackButton";

export default function StudentCertificatesPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 pb-6 pt-20 md:p-10 lg:pt-10">
      <div className="mx-auto max-w-6xl">

       <BackButton href="/student" />

        <h1 className="text-3xl font-bold text-gray-900">
          📜 Менің сертификаттарым
        </h1>

        <p className="mt-2 text-gray-500">
          Аяқталған курстар бойынша алған сертификаттарыңыз.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                ИП нөлден Комбо курс
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Берілген күні: 26.07.2026
              </p>

              <p className="mt-1 text-sm text-gray-500">
                № AKNUR-2026-1785085840467
              </p>
            </div>

            <div className="flex gap-3">
              <Link
  href="/certificate"
  className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700"
>
  👁 Қарау
</Link>

              <button className="rounded-lg border border-gray-300 px-5 py-2 transition hover:bg-gray-100">
                ⬇ PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}