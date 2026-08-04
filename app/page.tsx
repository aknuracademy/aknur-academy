import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-green-700">
        AKNUR Academy
      </h1>

      <p className="mt-6 text-2xl text-gray-700">
        Қазақстандағы бухгалтерлерге арналған онлайн платформа
      </p>

      <Link
        href="/login"
        className="mt-10 bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl text-xl transition"
      >
        Жүйеге кіру
      </Link>
    </main>
  );
}