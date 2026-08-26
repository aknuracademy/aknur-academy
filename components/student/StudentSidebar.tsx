"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

const menuItems = [
  {
    href: "/student",
    label: "Басты бет",
    icon: "🏠",
  },
  {
    href: "/student/courses",
    label: "Менің курстарым",
    icon: "📚",
  },
  {
    href: "/student/materials",
    label: "Материалдар",
    icon: "📄",
  },
  {
  href: "/student/ai",
  label: "AKNUR AI",
  icon: "✨",
},
  {
    href: "/student/certificates",
    label: "Сертификаттар",
    icon: "🏆",
  },
  {
    href: "/student/profile",
    label: "Профиль",
    icon: "👤",
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentHash, setCurrentHash] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    function updateHash() {
      setCurrentHash(window.location.hash);
    }

    updateHash();

    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    const [itemPath, itemHash = ""] = href.split("#");

    if (itemPath === "/student") {
      if (itemHash === "courses") {
        return (
          pathname === "/student" &&
          currentHash === "#courses"
        );
      }

      return (
        pathname === "/student" &&
        currentHash !== "#courses"
      );
    }

    return pathname.startsWith(itemPath);
  };

  function handleMenuClick(href: string) {
    if (href === "/student") {
      setCurrentHash("");
    }

    if (href === "/student#courses") {
      setCurrentHash("#courses");
    }

    setIsMobileMenuOpen(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "Аккаунттан шығу қатесі:",
        error
      );

      alert(
        "Аккаунттан шығу кезінде қате шықты."
      );

      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Телефондағы мәзір батырмасы */}
      <button
        type="button"
        onClick={() =>
          setIsMobileMenuOpen((current) => !current)
        }
        className="fixed left-4 top-4 z-50 rounded-xl bg-green-800 px-4 py-3 text-xl text-white shadow-lg lg:hidden"
        aria-label="Мәзірді ашу"
      >
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Телефондағы қараңғы фон */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Мәзірді жабу"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          flex min-h-screen w-72 shrink-0 flex-col
          bg-green-800 p-5 text-white
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="mb-8 pt-14 lg:pt-0">
          <h1 className="text-2xl font-bold">
            AKNUR Academy
          </h1>

          <p className="mt-1 text-sm text-green-200">
            Студент кабинеті
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  handleMenuClick(item.href)
                }
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
                  active
                    ? "bg-white text-green-800"
                    : "text-white hover:bg-green-700"
                }`}
              >
                <span className="text-xl">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-green-700 pt-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-white transition hover:bg-red-600"
          >
            <span className="text-xl">
              🚪
            </span>

            <span>Шығу</span>
          </button>
        </div>
      </aside>
    </>
  );
}