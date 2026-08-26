"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type PlatformSettings = {
  id: number;
  platform_name: string | null;
  platform_description: string | null;
  founder_name: string | null;
  whatsapp: string | null;
  instagram: string | null;
  kaspi_pay_url: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
  async function loadSettings() {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("platform_settings")
        .select(`
          id,
          platform_name,
          platform_description,
          founder_name,
          whatsapp,
          instagram,
          kaspi_pay_url
        `)
        .eq("id", 1)
        .single();

      if (error) {
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error("Баптауларды жүктеу қатесі:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Баптауларды жүктеу кезінде белгісіз қате шықты."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  loadSettings();
}, []);

  async function saveSettings() {
  if (!settings) {
    return;
  }

  try {
    const { error } = await supabase
      .from("platform_settings")
      .update({
        platform_name: settings.platform_name,
        platform_description: settings.platform_description,
        founder_name: settings.founder_name,
        whatsapp: settings.whatsapp,
        instagram: settings.instagram,
        kaspi_pay_url: settings.kaspi_pay_url,
      })
      .eq("id", settings.id);

    if (error) {
      throw error;
    }

    alert("Баптаулар сәтті сақталды.");
  } catch (error) {
    console.error("Баптауларды сақтау қатесі:", error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Баптауларды сақтау кезінде қате шықты.");
    }
  }
}

if (loading) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

        <p className="mt-4 text-xl font-medium text-gray-700">
          Баптаулар жүктеліп жатыр...
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
          Баптауларды жүктеу мүмкін болмады
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
  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ⚙️ Баптаулар
          </h1>

          <p className="mt-2 text-gray-600">
            AKNUR Academy платформасының негізгі баптаулары
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Academy мәліметтері */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              🏫 Academy мәліметтері
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Платформа атауы
                </label>

                <input
  type="text"
  value={settings?.platform_name ?? ""}
  onChange={(event) =>
    setSettings((current) =>
      current
        ? {
            ...current,
            platform_name: event.target.value,
          }
        : current
    )
  }
  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
/>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Сипаттамасы
                </label>

                <input
  type="text"
  value={settings?.platform_description ?? ""}
  onChange={(event) =>
    setSettings((current) =>
      current
        ? {
            ...current,
            platform_description: event.target.value,
          }
        : current
    )
  }
  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
/>
              </div>
            </div>

            <button
  type="button"
  onClick={saveSettings}
  className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
>
  💾 Сақтау
</button>
          </section>

          {/* Сертификат */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              🏆 Сертификат баптаулары
            </h2>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Сертификаттағы Founder аты
              </label>

              <input
  type="text"
  value={settings?.founder_name ?? ""}
  onChange={(event) =>
    setSettings((current) =>
      current
        ? {
            ...current,
            founder_name: event.target.value,
          }
        : current
    )
  }
  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
/>
            </div>

            <button
  type="button"
  onClick={saveSettings}
  className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
>
  💾 Сақтау
</button>
          </section>

          {/* Байланыс */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              📞 Байланыс мәліметтері
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>

                <input
  type="text"
  value={settings?.whatsapp ?? ""}
  onChange={(event) =>
    setSettings((current) =>
      current
        ? {
            ...current,
            whatsapp: event.target.value,
          }
        : current
    )
  }
  placeholder="+7..."
  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
/>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Instagram
                </label>

                <input
  type="text"
  value={settings?.instagram ?? ""}
  onChange={(event) =>
    setSettings((current) =>
      current
        ? {
            ...current,
            instagram: event.target.value,
          }
        : current
    )
  }
  placeholder="@username"
  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
/>
              </div>
              <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Kaspi Pay сілтемесі
  </label>

  <input
    type="text"
    value={settings?.kaspi_pay_url ?? ""}
    onChange={(event) =>
      setSettings((current) =>
        current
          ? {
              ...current,
              kaspi_pay_url: event.target.value,
            }
          : current
      )
    }
    placeholder="https://pay.kaspi.kz/pay/..."
    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
  />
</div>
            </div>

            <button
  type="button"
  onClick={saveSettings}
  className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
>
  💾 Сақтау
</button>
          </section>

          {/* Қауіпсіздік */}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              🔐 Қауіпсіздік
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Администратор аккаунтының қауіпсіздік
              параметрлерін басқару.
            </p>

            <button
  type="button"
  onClick={() => router.push("/dashboard/change-password")}
  className="mt-6 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white transition hover:bg-gray-700"
>
  🔑 Парольді өзгерту
</button>
          </section>
        </div>
      </div>
    </main>
  );
}