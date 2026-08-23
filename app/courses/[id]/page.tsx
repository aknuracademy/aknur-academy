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
  target_audience
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
        <div className="mx-auto max-w-5xl">
          <Link
            href="/#courses"
            className="text-sm font-semibold text-green-700"
          >
            ← Барлық курстар
          </Link>

          <div className="mt-8 rounded-3xl bg-white p-8 shadow-lg md:p-12">
            <p className="font-semibold text-green-700">
              AKNUR Academy курсы
            </p>

            <h1 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-5xl">
              {course.title}
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              {course.description ||
                "Курс туралы толық ақпарат жақында қосылады."}
            </p>
            <div className="mt-8">
  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
    Курс бағасы
  </p>

  <p className="mt-2 text-3xl font-extrabold text-green-700">
    {course.price?.toLocaleString("kk-KZ")} ₸
  </p>
</div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={whatsappUrl}
                className="rounded-xl bg-green-700 px-8 py-4 text-lg font-bold text-white hover:bg-green-800"
              >
                Курсқа жазылу
              </Link>

              <Link
                href="/#courses"
                className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-bold text-gray-800 hover:bg-gray-50"
              >
                Басқа курстар
              </Link>
            </div>
          </div>
          {course.full_description && (
  <div className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-extrabold text-gray-900">
      Курс туралы толық ақпарат
    </h2>

    <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
      {course.full_description}
    </p>
  </div>
)}
{course.target_audience && (
  <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-extrabold text-gray-900">
      Кімге арналған?
    </h2>

    <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
      {course.target_audience}
    </p>
  </div>
)}
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

      return (
        <details
  key={module.id}
  className="group rounded-2xl border border-gray-200 bg-white shadow-sm"
>
  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6">
    <div>
      <h3 className="text-xl font-bold text-gray-900">
        {moduleIndex + 1}-модуль. {module.title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {moduleVideos.length} сабақ
      </p>
    </div>

    <span className="text-2xl font-bold text-green-700 transition group-open:rotate-45">
      +
    </span>
  </summary>

  <div className="border-t border-gray-100 px-6 pb-6 pt-4">
    <div className="space-y-3">
      {moduleVideos.map((video, videoIndex) => (
        <div
          key={video.id}
          className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
        >
          <span className="font-bold text-green-700">
            {videoIndex + 1}
          </span>

          <span className="text-gray-700">
            {video.title}
          </span>
        </div>
      ))}
    </div>
  </div>
</details>
      );
    })}
  </div>
</div>
        </div>
      </section>
    </main>
  );
}