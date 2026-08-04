"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!title.trim()) {
    alert("Курс атауын жазыңыз");
    return;
  }

  const { error } = await supabase
    .from("courses")
    .insert([
      {
        title,
        description,
        price: Number(price),
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Курс сәтті сақталды!");

  router.push("/dashboard/courses");
router.refresh();
}

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-6 rounded-lg border border-gray-300 bg-white px-5 py-3 hover:bg-gray-50"
        >
          ← Жеке кабинетке қайту
        </button>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-green-700">
            Жаңа курс қосу
          </h1>

          <p className="mt-2 text-gray-600">
            Курстың негізгі мәліметтерін толтырыңыз.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block font-semibold">
                Курс атауы
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Мысалы: ИП нөлден"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Курс сипаттамасы
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Курс туралы қысқаша ақпарат жазыңыз"
                rows={5}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Курс бағасы
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="39990"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
              />

              <p className="mt-2 text-sm text-gray-500">
                Бағаны теңгемен жазыңыз.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-green-700 p-4 font-semibold text-white hover:bg-green-800"
            >
              Курсты сақтау
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}