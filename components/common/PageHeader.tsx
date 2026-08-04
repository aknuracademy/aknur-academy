"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type PageHeaderProps = {
  title: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
};

export default function PageHeader({
  title,
  description,
  homeHref = "/dashboard",
  homeLabel = "Басты бет",
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          ← Кері қайту
        </button>

        <Link
          href={homeHref}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
        >
          🏠 {homeLabel}
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

        {description && (
          <p className="mt-2 text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
}