import Link from "next/link";

import { supabase } from "@/lib/supabase";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { id } = await params;

  const courseId = Number(id);

  const { data: course, error } = await supabase
    .from("courses")
  .select(`
  id,
  title,
  description,
  price,
  full_description,
  target_audience,
  learning_outcomes,
  course_includes,
  access_info
`)
    .eq("id", courseId)
    .single();

    const { data: settings } = await supabase
  .from("platform_settings")
  .select("whatsapp")
  .eq("id", 1)
  .single();
  const whatsappNumber = settings?.whatsapp
  ?.replace(/\D/g, "");

const whatsappMessage = encodeURIComponent(
  `Сәлеметсіз бе! "${course?.title}" курсына жазылғым келеді.`
);

const whatsappUrl = whatsappNumber
  ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
  : "/login";
  const { data: modules } = await supabase
  .from("modules")
  .select(`
    id,
    title,
    position
  `)
  .eq("course_id", courseId)
  .order("position", { ascending: true });

const { data: videos } = await supabase
  .from("videos")
  .select(`
    id,
    module_id,
    title
  `)
  .eq("course_id", courseId)
  .order("id", { ascending: true });

  if (error || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-5">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            Курс табылмады
          </h1>

          <Link
            href="/#courses"
            className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
          >
            ← Курстарға қайту
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="bg-gradient-to-b from-green-50 to-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/#courses"
            className="text-sm font-semibold text-green-700"
          >
            ← Барлық курстар
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
  <aside className="lg:sticky lg:top-6">

        <div className="mt-8 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-white via-white to-green-50 shadow-xl">
  <div className="p-8 md:p-12">
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
          🎓 AKNUR Academy курсы
        </div>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
          {course.title}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          {course.description ||
            "Курс туралы толық ақпарат жақында қосылады."}
        </p>
        
        <div className="mt-8 inline-block rounded-2xl bg-green-50 px-6 py-4">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            Курс бағасы
          </p>

          <p className="mt-1 text-4xl font-extrabold text-green-700">
            {course.price?.toLocaleString("kk-KZ")} ₸
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white shadow-md transition hover:bg-green-800 hover:shadow-lg"
>
  💬 Курсқа жазылу
</a>

          <Link
            href="/#courses"
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-bold text-gray-800 transition hover:border-green-300 hover:bg-green-50"
          >
            Басқа курстар
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-green-100 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl">🎥</div>
          <p className="mt-2 font-bold text-gray-900">
            Видео сабақтар
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Қадам-қадам түсіндіру
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl">💬</div>
          <p className="mt-2 font-bold text-gray-900">
            Кері байланыс
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Практикамен бірге
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl">📄</div>
          <p className="mt-2 font-bold text-gray-900">
            Материалдар
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Қажетті файлдар
          </p>
        </div>

        <div className="rounded-2xl border border-green-100 bg-white p-5 text-center shadow-sm">
          <div className="text-3xl">🏆</div>
          <p className="mt-2 font-bold text-gray-900">
            Сертификат
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Курс аяқталған соң
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
</aside>

<div className="min-w-0">
          <div className="mt-10 space-y-4">
  {/* Курс туралы толық ақпарат */}
  {course.full_description && (
    <details className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 md:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-2xl">
            📄
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 md:text-xl">
              Курс туралы толық ақпарат
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Курс туралы толық мәлімет
            </p>
          </div>
        </div>

        <span className="text-2xl font-bold text-green-600 transition duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-green-50 bg-green-50/30 px-6 py-6 md:px-7">
        <p className="whitespace-pre-line leading-8 text-gray-700">
          {course.full_description}
        </p>
      </div>
    </details>
  )}

  {/* Кімге арналған */}
  {course.target_audience && (
    <details className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 md:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-2xl">
            👥
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 md:text-xl">
              Кімге арналған?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Бұл курс кімдерге пайдалы
            </p>
          </div>
        </div>

        <span className="text-2xl font-bold text-green-600 transition duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-green-50 bg-green-50/30 px-6 py-6 md:px-7">
        <p className="whitespace-pre-line leading-8 text-gray-700">
          {course.target_audience}
        </p>
      </div>
    </details>
  )}

  {/* Не үйренеді */}
  {course.learning_outcomes && (
    <details className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 md:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-2xl">
            🎓
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 md:text-xl">
              Курстан не үйренесіз?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Курстан алатын біліміңіз бен нәтижеңіз
            </p>
          </div>
        </div>

        <span className="text-2xl font-bold text-green-600 transition duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-green-50 bg-green-50/30 px-6 py-6 md:px-7">
        <p className="whitespace-pre-line leading-8 text-gray-700">
          {course.learning_outcomes}
        </p>
      </div>
    </details>
  )}

  {/* Курсқа не кіреді */}
  {course.course_includes && (
    <details className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 md:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-2xl">
            ✅
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 md:text-xl">
              Курсқа не кіреді?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Сабақтар, материалдар және қосымша мүмкіндіктер
            </p>
          </div>
        </div>

        <span className="text-2xl font-bold text-green-600 transition duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-green-50 bg-green-50/30 px-6 py-6 md:px-7">
        <p className="whitespace-pre-line leading-8 text-gray-700">
          {course.course_includes}
        </p>
      </div>
    </details>
  )}

  {/* Қолжетімділік */}
  {course.access_info && (
    <details className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-md">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 md:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-2xl">
            🕐
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900 md:text-xl">
              Қолжетімділік мерзімі
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Курсқа қолжетімділік және кері байланыс
            </p>
          </div>
        </div>

        <span className="text-2xl font-bold text-green-600 transition duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-green-50 bg-green-50/30 px-6 py-6 md:px-7">
        <p className="whitespace-pre-line leading-8 text-gray-700">
          {course.access_info}
        </p>
      </div>
    </details>
  )}
</div>
          <div className="mt-10">
  <h2 className="text-3xl font-extrabold text-gray-900">
    Курс бағдарламасы
  </h2>

  <p className="mt-3 text-gray-600">
    Курстағы модульдер мен сабақтар тізімі
  </p>

  <div className="mt-6 space-y-4">
    {modules?.map((module, moduleIndex) => {
  const moduleVideos =
    videos?.filter(
      (video) => video.module_id === module.id
    ) ?? [];

  const hasLessons = moduleVideos.length > 0;

  return (
    <details
      key={module.id}
      className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-lg font-extrabold text-green-700">
            {moduleIndex + 1}
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-gray-900">
              {module.title}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {hasLessons
                ? `${moduleVideos.length} сабақ`
                : "Сабақтар әлі қосылмаған"}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-2xl font-bold text-green-600 transition duration-200 group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-green-50 bg-green-50/20 px-5 py-5 md:px-6">
        {hasLessons ? (
          <div className="space-y-3">
            {moduleVideos.map((video, videoIndex) => (
              <div
                key={video.id}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700">
                  {videoIndex + 1}
                </div>

                <span className="text-gray-700">
                  {video.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-green-200 bg-white p-5 text-center">
            <p className="font-semibold text-gray-700">
              Бұл модульге сабақтар жақында қосылады
            </p>
          </div>
        )}
      </div>
    </details>
  );
})}
  </div>
</div>
        </div>
        </div>
</div>
      </section>
    </main>
  );
}