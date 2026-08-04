import Link from "next/link";

const adminSections = [
  {
    title: "Курстар",
    description:
      "Жаңа курс қосу және курстарды басқару.",
    href: "/dashboard/courses",
    icon: "📚",
  },
  {
    title: "Видео сабақтар",
    description:
      "YouTube сілтемесін немесе MP4 файлды қосу.",
    href: "/dashboard/videos",
    icon: "🎥",
  },
  {
    title: "Студенттер",
    description:
      "Студенттерді көру және курс тағайындау.",
    href: "/dashboard/students",
    icon: "👩‍🎓",
  },
  {
    title: "Сертификаттар",
    description:
      "Курсты аяқтаған студенттерге сертификат беру.",
    href: "/admin/certificates",
    icon: "📜",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow md:p-8">
          <p className="font-semibold text-green-700">
            AKNUR Academy
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Админ панелі
          </h1>

          <p className="mt-3 text-gray-600">
            Курстарды, сабақтарды және студенттерді осы жерден
            басқарасыз.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl">
                {section.icon}
              </div>

              <h2 className="mt-4 text-xl font-bold">
                {section.title}
              </h2>

              <p className="mt-2 text-gray-600">
                {section.description}
              </p>

              <p className="mt-5 font-semibold text-green-700">
                Ашу →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}