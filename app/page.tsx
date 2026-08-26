import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: courses, error } = await supabase
  .from("courses")
  .select(`
    id,
    title,
    description
  `)
  .order("id", { ascending: true });

if (error) {
  console.error("Курстарды жүктеу қатесі:", error);
}
  return (
    <main className="min-h-screen bg-white">
      {/* Жоғарғы мәзір */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h1 className="text-xl font-extrabold text-green-700 sm:text-2xl">
              AKNUR Academy
            </h1>

            <p className="text-xs text-gray-500">
              Онлайн білім беру платформасы
            </p>
          </div>

          <Link
            href="/login"
            className="shrink-0 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 sm:px-6 sm:text-base"
          >
            Жүйеге кіру
          </Link>
        </div>
      </header>

      {/* Негізгі бөлім */}
      <section className="bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 md:min-h-[650px] md:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 font-semibold text-green-700">
              Бухгалтерлер мен кәсіпкерлерге арналған
            </p>

            <h2 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-6xl">
              Біліміңізді арттырып,
              <span className="text-green-700">
                {" "}кәсібіңізді сенімді жүргізіңіз
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              AKNUR Academy — салық, есептілік және кәсіпкерлік
              бағытындағы практикалық онлайн сабақтар платформасы.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#courses"
                className="rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-green-800"
              >
                📚 Курстарды көру
              </a>

            </div>
          </div>
        </div>
      </section>
      {/* Курстар бөлімі */}
<section id="courses" className="bg-white px-6 py-20">
  <div className="mx-auto max-w-7xl">
    <div className="text-center">
      <p className="font-semibold text-green-700">
        БІЛІМ БЕРУ БАҒЫТТАРЫ
      </p>

      <h2 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
        AKNUR Academy курстары
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-gray-600">
        Практикалық сабақтар арқылы салық, есептілік және
        кәсіпкерлік бағытындағы біліміңізді жетілдіріңіз.
      </p>
    </div>
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {courses?.map((course) => (
    <div
      key={course.id}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-xl font-bold text-gray-900">
        {course.title}
      </h3>

      <p className="mt-3 text-gray-600">
        {course.description || "Курс туралы толық ақпарат"}
      </p>

      <Link
  href={`/courses/${course.id}`}
  className="mt-6 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
>
  Курсты ашу
</Link>
    </div>
  ))}
</div>
  </div>
</section>
    </main>
  );
}