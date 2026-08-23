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
  price
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
        </div>
      </section>
    </main>
  );
}