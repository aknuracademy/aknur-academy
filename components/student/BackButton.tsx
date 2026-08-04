"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  href: string;
  text?: string;
};

export default function BackButton({
  href,
  text = "← Артқа",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
    >
      {text}
    </button>
  );
}