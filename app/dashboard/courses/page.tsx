"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCourses } from "@/services/course.service";
import Sidebar from "@/components/Sidebar";

type Course = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const data = await getCourses();
    console.log("Courses =>", data);

console.log("COURSES:", data);

setCourses(data as Course[]);
    try {
      setLoading(true);

      const data = await getCourses();
      setCourses(data as Course[]);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Курстарды жүктеу кезінде қате шықты.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-xl font-medium">Жүктеліп жатыр...</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700">
                📚 Курстар
              </h1>

              <p className="mt-2 text-gray-600">
                Курстарды және олардың модульдерін басқарыңыз.
              </p>
            </div>

            <Link
              href="/dashboard/courses/new"
              className="rounded-lg bg-green-600 px-5 py-3 text-center font-bold text-white hover:bg-green-700"
            >
              ➕ Жаңа курс қосу
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow">
              <p className="text-gray-500">Әзірге курс жоқ.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <h2 className="text-2xl font-bold text-green-700">
                    {course.title}
                  </h2>

                  <p className="mt-3 text-gray-600">
                    {course.description || "Сипаттама жоқ"}
                  </p>

                  <p className="mt-4 text-lg font-bold">
                    {course.price ?? 0} ₸
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    

                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="rounded-lg bg-green-600 px-5 py-3 text-center font-bold text-white hover:bg-green-700"
                    >
                      🎥 Сабақтарды басқару
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}